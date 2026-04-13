"use client";

import { useState } from "react";
import { VoiceRecorder } from "@/components/audio/VoiceRecorder";

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
  const charCount = issueText.length;

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
      <h1 className="font-typewriter text-[28px] font-semibold leading-[1.2] text-waldgruen-dark mb-8">
        Schritt 2: Dein Anliegen
      </h1>

      {/* Moderation rejection banner */}
      {errorMessage && (
        <div
          role="alert"
          className="bg-airmail-rot/10 border-l-4 border-airmail-rot text-airmail-rot p-4 rounded-r-lg text-sm font-body mb-4"
        >
          {errorMessage}
        </div>
      )}

      {/* Textarea */}
      <div>
        <label
          htmlFor="issueText"
          className="block font-body text-sm font-semibold text-warmgrau mb-1"
        >
          Was beschaeftigt dich?
        </label>
        <textarea
          id="issueText"
          value={issueText}
          onChange={handleTextChange}
          placeholder="Schreib hier, was dich stoert, was du dir wuenschst oder was du fragen moechtest. Je konkreter, desto ueberzeugender wird dein Brief."
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

      {/* Voice recorder */}
      <div className="mt-4">
        <VoiceRecorder
          onTranscription={handleTranscription}
          disabled={isSubmitting}
        />
      </div>

      {/* Submit button */}
      <div className="mt-8">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || issueText.trim().length === 0}
          className={[
            "bg-waldgruen text-creme font-semibold text-base px-8 py-4 rounded-xl",
            "hover:bg-waldgruen-dark transition-colors min-h-[44px] w-full sm:w-auto",
            isSubmitting || issueText.trim().length === 0
              ? "opacity-60 cursor-not-allowed"
              : "cursor-pointer",
          ].join(" ")}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
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
              Brief wird erstellt...
            </span>
          ) : (
            "Brief anfordern"
          )}
        </button>
      </div>
    </div>
  );
}
