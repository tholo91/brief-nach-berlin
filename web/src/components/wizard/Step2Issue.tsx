"use client";

import { useState, useCallback } from "react";
import { VoiceRecorder, type VoiceRecorderState } from "@/components/audio/VoiceRecorder";

interface Step2IssueProps {
  onSubmit: (issueText: string) => void;
  isSubmitting: boolean;
  errorMessage: string | null;
  onErrorDismiss: () => void;
}

export function Step2Issue({
  onSubmit,
  isSubmitting,
  errorMessage,
  onErrorDismiss,
}: Step2IssueProps) {
  const [issueText, setIssueText] = useState("");
  const [voiceDone, setVoiceDone] = useState(false);
  const charCount = issueText.length;

  const handleVoiceStateChange = useCallback((state: VoiceRecorderState) => {
    if (state === "done") setVoiceDone(true);
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIssueText(e.target.value);
    if (errorMessage) {
      onErrorDismiss();
    }
  };

  const handleTranscription = (text: string) => {
    setIssueText((prev) => (prev ? prev + "\n" + text : text));
  };

  const handleSubmit = () => {
    if (issueText.trim().length > 0) {
      onSubmit(issueText);
    }
  };

  return (
    <div>
      <h1 className="font-typewriter text-[28px] font-semibold leading-[1.2] text-waldgruen-dark mb-2">
        Was möchtest du ändern?
      </h1>
      <p className="font-body text-sm text-warmgrau/70 mb-8">
        Beschreibe dein Anliegen — per Sprache oder Text. Je konkreter, desto überzeugender wird dein Brief.
      </p>

      {/* Moderation rejection banner */}
      {errorMessage && (
        <div
          role="alert"
          className="bg-airmail-rot/10 border-l-4 border-airmail-rot text-airmail-rot p-4 rounded-r-lg text-sm font-body mb-4"
        >
          {errorMessage}
        </div>
      )}

      {/* Voice recorder — easy path first, fades out after transcription */}
      <div className={`transition-all duration-700 ease-out ${voiceDone ? "opacity-0 max-h-0 overflow-hidden mb-0" : "opacity-100 max-h-40 mb-4"}`}>
        <VoiceRecorder
          onTranscription={handleTranscription}
          onStateChange={handleVoiceStateChange}
          disabled={isSubmitting}
        />
      </div>

      {/* Divider — fades out with voice recorder */}
      <div className={`flex items-center gap-3 my-4 transition-all duration-700 ease-out ${voiceDone ? "opacity-0 max-h-0 overflow-hidden !my-0" : "opacity-100 max-h-8"}`}>
        <div className="flex-1 h-px bg-warmgrau/20" />
        <span className="font-body text-xs text-warmgrau/50">oder schreib es selbst</span>
        <div className="flex-1 h-px bg-warmgrau/20" />
      </div>

      {/* Textarea */}
      <div>
        <textarea
          id="issueText"
          value={issueText}
          onChange={handleTextChange}
          placeholder="z.B. Die Radwege in meiner Stadt sind in einem katastrophalen Zustand..."
          disabled={isSubmitting}
          className={[
            "bg-creme border border-warmgrau/30 rounded-lg px-4 py-3 text-base font-body text-warmgrau",
            "focus:outline-none focus:ring-2 focus:ring-waldgruen focus:border-waldgruen w-full",
            "min-h-[160px] max-h-[320px] resize-y",
            isSubmitting ? "opacity-60" : "",
          ].join(" ")}
          aria-describedby="issueText-counter"
        />
        <p
          id="issueText-counter"
          className="text-right text-sm text-warmgrau/60 mt-1"
        >
          {charCount} Zeichen
        </p>
      </div>

      {/* Submit button */}
      <div className="mt-8">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || issueText.trim().length === 0}
          className={[
            "bg-waldgruen text-creme font-semibold text-base px-8 py-4 rounded-xl",
            "hover:bg-waldgruen-dark transition-colors min-h-[44px] w-full",
            isSubmitting || issueText.trim().length === 0
              ? "opacity-60 cursor-not-allowed"
              : "cursor-pointer",
          ].join(" ")}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
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
                className="animate-spin"
                aria-hidden="true"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Brief wird erstellt...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
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
                <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" />
                <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" />
              </svg>
              Brief erstellen
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
