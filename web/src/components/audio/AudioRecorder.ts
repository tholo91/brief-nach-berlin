/**
 * Client-only RecordRTC wrapper for browser-safe audio recording.
 * Lazy-loads recordrtc to avoid SSR crashes.
 *
 * Adapted from surv.ai/lib/audio/recorder.ts for one-shot recording
 * (no chunked uploads). Max duration reduced to 3 minutes.
 */

import type RecordRTCType from "recordrtc";

export const MAX_RECORDING_DURATION_MS = 180_000; // 3 minutes

export interface RecordingResult {
  blob: Blob;
  durationMs: number;
  mimeType: string;
}

export type RecorderState =
  | "idle"
  | "requesting_permission"
  | "recording"
  | "stopped"
  | "error";

export interface BrowserContext {
  os: "ios" | "android" | "macos" | "windows" | "other";
  browser: "safari" | "chrome" | "firefox" | "edge" | "other";
}

export interface RecorderError {
  type:
    | "permission_denied"
    | "no_microphone"
    | "insecure_context"
    | "unsupported"
    | "unknown";
  message: string;
  context?: BrowserContext;
}

export function getBrowserContext(): BrowserContext {
  if (typeof navigator === "undefined") return { os: "other", browser: "other" };

  const ua = navigator.userAgent.toLowerCase();

  let os: BrowserContext["os"] = "other";
  if (/iphone|ipad|ipod/.test(ua)) os = "ios";
  else if (/android/.test(ua)) os = "android";
  else if (/macintosh|mac os x/.test(ua)) os = "macos";
  else if (/windows/.test(ua)) os = "windows";

  let browser: BrowserContext["browser"] = "other";
  if (/edg/.test(ua)) browser = "edge";
  else if (/chrome|crios/.test(ua)) browser = "chrome";
  else if (/firefox|fxios/.test(ua)) browser = "firefox";
  else if (/safari/.test(ua)) browser = "safari";

  return { os, browser };
}

let RecordRTCClass: typeof RecordRTCType | null = null;

async function loadRecordRTC(): Promise<typeof RecordRTCType> {
  if (!RecordRTCClass) {
    const mod = await import("recordrtc");
    RecordRTCClass = mod.default;
  }
  return RecordRTCClass;
}

export function classifyMediaError(err: unknown): RecorderError {
  const context = getBrowserContext();

  if (err instanceof DOMException) {
    if (
      err.name === "NotAllowedError" ||
      err.name === "PermissionDeniedError"
    ) {
      return {
        type: "permission_denied",
        message:
          "Mikrofonzugriff wurde verweigert. Bitte erlaube den Mikrofonzugriff und versuche es erneut.",
        context,
      };
    }
    if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
      return {
        type: "no_microphone",
        message:
          "Kein Mikrofon gefunden. Bitte schliesse ein Mikrofon an und versuche es erneut.",
        context,
      };
    }
  }

  if (
    typeof window !== "undefined" &&
    window.location.protocol !== "https:" &&
    window.location.hostname !== "localhost"
  ) {
    return {
      type: "insecure_context",
      message: "Aufnahme erfordert eine sichere Verbindung (HTTPS).",
      context,
    };
  }

  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    return {
      type: "unsupported",
      message: "Dein Browser unterstützt keine Audioaufnahme.",
      context,
    };
  }

  return {
    type: "unknown",
    message: "Ein unerwarteter Fehler ist aufgetreten.",
    context,
  };
}

export class AudioRecorder {
  private recorder: RecordRTCType | null = null;
  private stream: MediaStream | null = null;
  private startTime = 0;
  private autoStopTimer: ReturnType<typeof setTimeout> | null = null;
  private _state: RecorderState = "idle";
  private onStateChange?: (state: RecorderState) => void;
  private onAutoStop?: (result: RecordingResult) => void;

  constructor(opts?: {
    onStateChange?: (state: RecorderState) => void;
    onAutoStop?: (result: RecordingResult) => void;
  }) {
    this.onStateChange = opts?.onStateChange;
    this.onAutoStop = opts?.onAutoStop;
  }

  get state(): RecorderState {
    return this._state;
  }

  get analyserStream(): MediaStream | null {
    return this.stream;
  }

  getAnalyserNode(): AnalyserNode | null {
    if (!this.stream) return null;
    try {
      const AudioContext =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof window.AudioContext })
          .webkitAudioContext;
      if (!AudioContext) return null;
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(this.stream);
      const analyser = ctx.createAnalyser();
      source.connect(analyser);
      return analyser;
    } catch {
      return null;
    }
  }

  private setState(state: RecorderState) {
    this._state = state;
    this.onStateChange?.(state);
  }

  async start(): Promise<void> {
    this.setState("requesting_permission");

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
    });

    this.stream = stream;

    const RecordRTC = await loadRecordRTC();

    this.recorder = new RecordRTC(stream, {
      type: "audio",
      mimeType: "audio/webm",
      disableLogs: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    this.recorder.startRecording();
    this.startTime = Date.now();
    this.setState("recording");

    this.autoStopTimer = setTimeout(async () => {
      if (this._state === "recording") {
        const result = await this.stop();
        this.onAutoStop?.(result);
      }
    }, MAX_RECORDING_DURATION_MS);
  }

  async stop(): Promise<RecordingResult> {
    if (this.autoStopTimer) {
      clearTimeout(this.autoStopTimer);
      this.autoStopTimer = null;
    }

    return new Promise<RecordingResult>((resolve, reject) => {
      const activeRecorder = this.recorder;

      if (!activeRecorder) {
        this.setState("error");
        reject(new Error("No active recorder"));
        return;
      }

      const durationMs = Date.now() - this.startTime;

      try {
        activeRecorder.stopRecording(() => {
          const blob = activeRecorder.getBlob();
          const mimeType = blob.type || "audio/webm";
          this.releaseStream();
          this.setState("stopped");
          resolve({ blob, durationMs, mimeType });
        });
      } catch (error) {
        this.releaseStream();
        this.setState("error");
        reject(
          error instanceof Error ? error : new Error("Failed to stop recording")
        );
      }
    });
  }

  reset(): void {
    if (this.autoStopTimer) {
      clearTimeout(this.autoStopTimer);
      this.autoStopTimer = null;
    }
    if (this.recorder) {
      try {
        this.recorder.stopRecording(() => {});
      } catch {
        // Ignore — recorder may already be stopped
      }
      this.recorder.destroy();
      this.recorder = null;
    }
    this.releaseStream();
    this.startTime = 0;
    this.setState("idle");
  }

  private releaseStream(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }

  destroy(): void {
    this.reset();
    this.onStateChange = undefined;
    this.onAutoStop = undefined;
  }
}
