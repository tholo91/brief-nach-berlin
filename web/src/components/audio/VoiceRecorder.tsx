"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AudioRecorder,
  classifyMediaError,
  type RecorderState,
  type RecordingResult,
} from "./AudioRecorder";

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  onStateChange?: (state: UIState) => void;
  disabled?: boolean;
  /** When the textarea is empty we show a more prominent mic. */
  hasText?: boolean;
  /** Rendered on the right of the meta row below the textarea. */
  charCount: number;
  /** Landing single-line: vertically center the in-field control on the
   *  textarea instead of pinning it to the top-right corner. */
  centered?: boolean;
  /** Current textarea height (px) used to center the control vertically. */
  fieldHeight?: number;
  /** Horizontal position class of the in-field control (default right-2.5).
   *  The landing shifts it left to make room for the submit CTA beside it. */
  controlRightClass?: string;
  /** Force the subtle (outline) mic even when the field is empty, so a separate
   *  primary CTA next to it stays the only green accent. */
  forceSubtle?: boolean;
  /** Minimum chars needed to submit. When set and not yet reached, the counter
   *  reads "X von mind. N Zeichen"; once reached it drops to "X Zeichen". */
  minChars?: number;
  /** Optional keyboard shortcut hint rendered directly left of the counter
   *  (desktop only). Pass e.g. "⌘↵" or "Ctrl+↵"; omit/undefined to hide. */
  keyboardHint?: string;
}

type UIState = "idle" | "recording" | "processing" | "error";

const BAR_COUNT = 5;

function formatElapsed(seconds: number): string {
  return (
    String(Math.floor(seconds / 60)).padStart(2, "0") +
    ":" +
    String(seconds % 60).padStart(2, "0")
  );
}

function MicIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}

export type { UIState as VoiceRecorderState };

export function VoiceRecorder({
  onTranscription,
  onStateChange,
  disabled,
  hasText = false,
  charCount,
  centered = false,
  fieldHeight = 0,
  controlRightClass = "right-2.5",
  forceSubtle = false,
  minChars,
  keyboardHint,
}: VoiceRecorderProps) {
  const [uiState, setUiStateInternal] = useState<UIState>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const setUiState = useCallback(
    (state: UIState) => {
      setUiStateInternal(state);
      onStateChange?.(state);
    },
    [onStateChange]
  );

  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Level meter
  const rafRef = useRef<number | null>(null);
  const barsRef = useRef<(HTMLSpanElement | null)[]>([]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopMeter = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    audioRecorderRef.current?.closeAnalyser();
    barsRef.current.forEach((bar) => {
      if (bar) bar.style.height = "20%";
    });
  }, []);

  const startMeter = useCallback(() => {
    const analyser = audioRecorderRef.current?.getAnalyserNode();
    if (!analyser) return;
    const data = new Uint8Array(analyser.fftSize);
    const weights = [0.6, 1, 0.85, 1, 0.6];

    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i]! - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / data.length);
      const level = Math.min(1, rms * 3.2);
      barsRef.current.forEach((bar, i) => {
        if (!bar) return;
        const h = 20 + level * (weights[i] ?? 1) * 80;
        bar.style.height = `${Math.max(20, Math.min(100, h))}%`;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      stopMeter();
      audioRecorderRef.current?.destroy();
    };
  }, [clearTimer, stopMeter]);

  const flashError = useCallback(() => {
    clearTimer();
    stopMeter();
    setUiState("error");
    setTimeout(() => {
      setUiState("idle");
      setElapsedSeconds(0);
      audioRecorderRef.current?.reset();
    }, 3000);
  }, [clearTimer, stopMeter, setUiState]);

  const transcribe = useCallback(
    async (result: RecordingResult) => {
      setUiState("processing");
      try {
        const formData = new FormData();
        formData.append("audio", result.blob, "recording.webm");

        const response = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Transcription request failed: ${response.status}`);
        }

        const data = await response.json();
        if (!data.text) {
          throw new Error("No transcription text returned");
        }

        onTranscription(data.text);
        // Repeatable: return to idle so the user can dictate again.
        setUiState("idle");
        setElapsedSeconds(0);
      } catch (err) {
        console.error("Transcription error:", err);
        flashError();
      }
    },
    [onTranscription, setUiState, flashError]
  );

  const startRecording = useCallback(async () => {
    // Fresh recorder each take so callbacks bind to current props.
    audioRecorderRef.current?.destroy();
    audioRecorderRef.current = new AudioRecorder({
      onStateChange: (state: RecorderState) => {
        if (state === "error") flashError();
      },
      onAutoStop: (result: RecordingResult) => {
        clearTimer();
        stopMeter();
        void transcribe(result);
      },
    });

    try {
      setElapsedSeconds(0);
      await audioRecorderRef.current.start();
      startTimeRef.current = Date.now();
      setUiState("recording");
      startMeter();

      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedSeconds(elapsed);
      }, 1000);
    } catch (err) {
      const classified = classifyMediaError(err);
      console.error("Recording start error:", classified);
      flashError();
    }
  }, [clearTimer, stopMeter, transcribe, setUiState, startMeter, flashError]);

  const stopRecordingAndTranscribe = useCallback(async () => {
    const recorder = audioRecorderRef.current;
    if (!recorder) return;

    clearTimer();
    stopMeter();

    try {
      const result = await recorder.stop();
      await transcribe(result);
    } catch (err) {
      console.error("Stop/transcribe error:", err);
      flashError();
    }
  }, [clearTimer, stopMeter, transcribe, flashError]);

  const handleToggle = () => {
    if (disabled) return;
    if (uiState === "idle") {
      void startRecording();
    } else if (uiState === "recording") {
      void stopRecordingAndTranscribe();
    }
  };

  const isRecording = uiState === "recording";
  const isProcessing = uiState === "processing";
  const isError = uiState === "error";
  const showProminent = uiState === "idle" && !hasText && !forceSubtle;

  const ariaStatus =
    uiState === "recording"
      ? "Aufnahme läuft"
      : uiState === "processing"
        ? "Transkription läuft"
        : uiState === "error"
          ? "Aufnahme fehlgeschlagen"
          : "";

  return (
    <>
      {/* In-field control. Single-line landing: vertically centered on the
          textarea via transform (kept off `top` for cheap compositing). Once
          the text wraps it pins to the top-right corner. */}
      <div
        // centered (landing single line): vertically centered on the textarea.
        // forceSubtle multi-line (landing): pinned to the textarea's bottom so it
        // rides down with the newest line. Wizard: top-right corner as before.
        // Positioned via translateY off the textarea height (not bottom-*) so the
        // meta row below the field doesn't push the control down.
        className={
          centered || forceSubtle
            ? `absolute ${controlRightClass} top-0 flex h-10 w-10 items-center justify-center`
            : `absolute ${controlRightClass} top-2.5`
        }
        style={
          centered
            ? { transform: `translateY(${Math.max(0, (fieldHeight - 40) / 2)}px)` }
            : forceSubtle
              ? { transform: `translateY(${Math.max(0, fieldHeight - 40 - 8)}px)` }
              : undefined
        }
      >
        {uiState === "idle" && (
          <button
            type="button"
            onClick={handleToggle}
            disabled={disabled}
            aria-label="Sprachaufnahme starten"
            title="Diktieren: deine Worte werden ins Textfeld übernommen. Du kannst den Text danach noch ändern."
            className={[
              "flex items-center justify-center rounded-full transition-colors",
              forceSubtle
                ? "h-8 w-8 text-warmgrau hover:text-waldgruen"
                : showProminent
                  ? "h-9 w-9 bg-waldgruen text-creme shadow-sm hover:bg-waldgruen-dark"
                  : "h-9 w-9 border border-warmgrau/30 bg-creme/80 text-warmgrau backdrop-blur-sm hover:bg-warmgrau/5 hover:text-waldgruen",
              disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
            ].join(" ")}
          >
            <MicIcon size={18} />
          </button>
        )}

        {isRecording && (
          <button
            type="button"
            onClick={handleToggle}
            aria-label="Aufnahme beenden und Text übernehmen"
            className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-waldgruen text-creme shadow-sm"
          >
            <span
              className="absolute inset-0 rounded-full bg-waldgruen/40 animate-ping"
              aria-hidden="true"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
        )}

        {isProcessing && (
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-warmgrau/30 bg-creme/80 text-warmgrau">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-spin"
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
        )}

        {isError && (
          <div
            title="Aufnahme fehlgeschlagen, bitte erneut versuchen"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-airmail-rot/40 bg-airmail-rot/10 text-airmail-rot"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" x2="12" y1="9" y2="13" />
              <line x1="12" x2="12.01" y1="17" y2="17" />
            </svg>
          </div>
        )}
      </div>

      {/* Single meta row below the field: left = state, right = char count. */}
      <div className="mt-1 flex min-h-[22px] items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          {isRecording && (
            <>
              <div className="flex h-4 items-end gap-[3px]" aria-hidden="true">
                {Array.from({ length: BAR_COUNT }).map((_, i) => (
                  <span
                    key={i}
                    ref={(el) => {
                      barsRef.current[i] = el;
                    }}
                    className="w-[3px] rounded-full bg-airmail-rot/70 transition-[height] duration-75 ease-out"
                    style={{ height: "20%" }}
                  />
                ))}
              </div>
              <span className="font-typewriter tabular-nums text-airmail-rot">
                {formatElapsed(elapsedSeconds)}
              </span>
            </>
          )}
          {isProcessing && (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-spin text-warmgrau"
                aria-hidden="true"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <span className="font-body text-warmgrau">
                Transkribiere deine Aufnahme...
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {keyboardHint && (
            <span className="hidden md:inline text-sm text-warmgrau/50" aria-hidden="true">
              {keyboardHint} weiter
            </span>
          )}
          <p
            id="issueText-counter"
            aria-live="polite"
            className="text-xs md:text-sm text-warmgrau/50"
          >
            {charCount > 0
              ? minChars && charCount < minChars
                ? `${charCount} von mind. ${minChars} Zeichen`
                : `${charCount} Zeichen`
              : ""}
          </p>
        </div>
      </div>

      <span className="sr-only" role="status" aria-live="polite">
        {ariaStatus}
      </span>
    </>
  );
}
