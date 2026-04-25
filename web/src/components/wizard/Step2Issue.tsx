"use client";

import { useState, useCallback, useEffect } from "react";
import { VoiceRecorder, type VoiceRecorderState } from "@/components/audio/VoiceRecorder";

const SUBMIT_STAGES = [
  "Zuständigkeit wird ermittelt...",
  "Brief wird formuliert...",
  "Brief wird geprüft...",
];

const TOPIC_EXAMPLES: { label: string; placeholder: string }[] = [
  {
    label: "Verkehr",
    placeholder:
      "z.B. Die Radwege in meiner Stadt sind in einem katastrophalen Zustand. Als Vater von zwei Kindern fahre ich täglich...",
  },
  {
    label: "Wohnen",
    placeholder:
      "z.B. Die Mieten in meiner Nachbarschaft sind in den letzten Jahren massiv gestiegen. Junge Familien können sich die Stadt nicht mehr leisten...",
  },
  {
    label: "Bildung",
    placeholder:
      "z.B. An der Grundschule meines Kindes teilen sich 340 Kinder zwölf Tablets. Der Digitalpakt Schule kommt nicht an...",
  },
  {
    label: "Klima & Umwelt",
    placeholder:
      "z.B. In unserer Region wird eine Waldfläche für ein Logistikzentrum gerodet, obwohl Alternativstandorte existieren...",
  },
  {
    label: "Gesundheit",
    placeholder:
      "z.B. In meinem Landkreis gibt es keinen freien Kinderarzt mehr. Die nächste Praxis mit Kapazität ist 45 Kilometer entfernt...",
  },
  {
    label: "Demokratie",
    placeholder:
      "z.B. Ich mache mir Sorgen um den Umgangston in politischen Debatten und den wachsenden Vertrauensverlust in demokratische Institutionen...",
  },
];

const DEFAULT_PLACEHOLDER =
  "z.B. Die Radwege in meiner Stadt sind in einem katastrophalen Zustand...";

const TONE_LABELS = ["freundlich", "höflich", "sachlich", "bestimmt", "nachdrücklich"] as const;

interface Step2IssueProps {
  onSubmit: (issueText: string, toneLevel: number) => void;
  isSubmitting: boolean;
  errorMessage: string | null;
  onErrorDismiss: () => void;
  defaultValue?: string;
}

export function Step2Issue({
  onSubmit,
  isSubmitting,
  errorMessage,
  onErrorDismiss,
  defaultValue,
}: Step2IssueProps) {
  const [issueText, setIssueText] = useState(defaultValue ?? "");
  const [voiceDone, setVoiceDone] = useState(false);
  const [submitStage, setSubmitStage] = useState(0);
  const [placeholder, setPlaceholder] = useState<string>(DEFAULT_PLACEHOLDER);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [toneLevel, setToneLevel] = useState(3);
  const charCount = issueText.length;

  // Cycle through progress stages while submitting — rough pacing based on
  // typical Mistral latency (~3–8s per generation + moderation round-trip).
  useEffect(() => {
    if (!isSubmitting) {
      setSubmitStage(0);
      return;
    }
    const t1 = setTimeout(() => setSubmitStage(1), 1800);
    const t2 = setTimeout(() => setSubmitStage(2), 5500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isSubmitting]);

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
      onSubmit(issueText, toneLevel);
    }
  };

  return (
    <div>
      <h1 className="font-typewriter text-[28px] font-semibold leading-[1.2] text-waldgruen-dark mb-2">
        Was möchtest du ändern?
      </h1>
      <p className="font-body text-sm text-warmgrau/70 mb-8">
        Beschreibe dein Anliegen – per Sprache oder Text. Je konkreter, desto überzeugender wird dein Brief.
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

      {/* Topic chips — help users get unstuck with a concrete starting example */}
      <div className="flex flex-wrap gap-2 mb-3">
        {TOPIC_EXAMPLES.map((topic) => {
          const isActive = activeTopic === topic.label;
          return (
            <button
              key={topic.label}
              type="button"
              onClick={() => {
                setActiveTopic(topic.label);
                setPlaceholder(topic.placeholder);
              }}
              disabled={isSubmitting}
              className={[
                "font-body text-sm px-3 py-1.5 rounded-full border transition-colors cursor-pointer",
                isActive
                  ? "bg-waldgruen text-creme border-waldgruen"
                  : "bg-creme text-waldgruen-dark border-warmgrau/30 hover:border-waldgruen",
                isSubmitting ? "opacity-50 cursor-not-allowed" : "",
              ].join(" ")}
            >
              {topic.label}
            </button>
          );
        })}
      </div>

      {/* Textarea */}
      <div>
        <textarea
          id="issueText"
          value={issueText}
          onChange={handleTextChange}
          placeholder={placeholder}
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

      {/* Tone slider */}
      <div className="mt-6">
        <label className="block font-body text-sm text-warmgrau/70 mb-3">
          Ton des Briefes
        </label>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={toneLevel}
          onChange={(e) => setToneLevel(Number(e.target.value))}
          disabled={isSubmitting}
          className="w-full accent-waldgruen cursor-pointer disabled:opacity-50"
          aria-label="Tonlage des Briefes"
        />
        <div className="flex justify-between mt-1">
          {TONE_LABELS.map((label, i) => (
            <span
              key={label}
              className={[
                "font-body text-xs transition-colors",
                toneLevel === i + 1 ? "text-waldgruen font-semibold" : "text-warmgrau/40",
              ].join(" ")}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Submit button */}
      <div className="mt-6">
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
              {SUBMIT_STAGES[submitStage]}
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
