"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AudioRecorder,
  classifyMediaError,
  type RecorderState,
} from "./AudioRecorder";

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  onStateChange?: (state: UIState) => void;
  disabled?: boolean;
}

type UIState = "idle" | "recording" | "processing" | "done" | "error";

function formatElapsed(seconds: number): string {
  return (
    String(Math.floor(seconds / 60)).padStart(2, "0") +
    ":" +
    String(seconds % 60).padStart(2, "0")
  );
}

export type { UIState as VoiceRecorderState };

export function VoiceRecorder({ onTranscription, onStateChange, disabled }: VoiceRecorderProps) {
  const [uiState, setUiStateInternal] = useState<UIState>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const setUiState = useCallback((state: UIState) => {
    setUiStateInternal(state);
    onStateChange?.(state);
  }, [onStateChange]);

  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      audioRecorderRef.current?.destroy();
    };
  }, [clearTimer]);

  const handleClick = async () => {
    if (disabled || uiState === "done") return;

    if (uiState === "idle") {
      await startRecording();
    } else if (uiState === "recording") {
      await stopRecordingAndTranscribe();
    }
  };

  const startRecording = async () => {
    if (!audioRecorderRef.current) {
      audioRecorderRef.current = new AudioRecorder({
        onStateChange: (state: RecorderState) => {
          if (state === "error") {
            clearTimer();
            setUiState("error");
            setTimeout(() => {
              setUiState("idle");
              setElapsedSeconds(0);
            }, 3000);
          }
        },
      });
    }

    try {
      setElapsedSeconds(0);
      await audioRecorderRef.current.start();
      startTimeRef.current = Date.now();
      setUiState("recording");

      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedSeconds(elapsed);
      }, 1000);
    } catch (err) {
      const classified = classifyMediaError(err);
      console.error("Recording start error:", classified);
      setUiState("error");
      setTimeout(() => {
        setUiState("idle");
        setElapsedSeconds(0);
      }, 3000);
    }
  };

  const stopRecordingAndTranscribe = async () => {
    const recorder = audioRecorderRef.current;
    if (!recorder) return;

    clearTimer();

    try {
      const result = await recorder.stop();
      setUiState("processing");

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
      // One-shot: stay in "done" state permanently
      setUiState("done");
    } catch (err) {
      console.error("Transcription error:", err);
      setUiState("error");
      setTimeout(() => {
        setUiState("idle");
        setElapsedSeconds(0);
        audioRecorderRef.current?.reset();
      }, 3000);
    }
  };

  const ariaLabel =
    uiState === "recording"
      ? "Aufnahme stoppen"
      : uiState === "processing"
        ? "Transkription läuft"
        : uiState === "done"
          ? "Aufnahme übernommen"
          : "Sprachaufnahme starten";

  const isButtonDisabled = disabled || uiState === "processing" || uiState === "done";

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isButtonDisabled}
        aria-label={ariaLabel}
        className={[
          "flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg",
          "bg-creme border transition-colors min-h-[44px] w-full",
          "font-body text-sm",
          uiState === "recording"
            ? "border-airmail-rot text-warmgrau"
            : "border-warmgrau/30 text-warmgrau",
          isButtonDisabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-warmgrau/5",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {uiState === "idle" && (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-waldgruen"
              aria-hidden="true"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
            <span>Sprachaufnahme starten</span>
          </>
        )}

        {uiState === "recording" && (
          <>
            <span
              className="w-3 h-3 rounded-full bg-airmail-rot animate-pulse"
              aria-hidden="true"
            />
            <span className="font-typewriter text-sm text-warmgrau tabular-nums">
              {formatElapsed(elapsedSeconds)}
            </span>
            <span>Beschreibe dein Anliegen...</span>
          </>
        )}

        {uiState === "processing" && (
          <>
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
              className="animate-spin text-warmgrau"
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <span>Transkription läuft...</span>
          </>
        )}

        {uiState === "done" && (
          <span className="text-waldgruen">Aufnahme übernommen</span>
        )}

        {uiState === "error" && (
          <span className="text-airmail-rot">
            Aufnahme fehlgeschlagen – bitte erneut versuchen
          </span>
        )}
      </button>
    </div>
  );
}
