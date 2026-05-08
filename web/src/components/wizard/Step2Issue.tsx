"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { VoiceRecorder, type VoiceRecorderState } from "@/components/audio/VoiceRecorder";

function TipsDisclosure() {
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState(true);

  // Subtle pulse for ~3s on first mount to draw attention without being noisy.
  useEffect(() => {
    const t = setTimeout(() => setHint(false), 3000);
    return () => clearTimeout(t);
  }, []);

  const toggle = () => {
    setOpen((v) => !v);
    setHint(false);
  };

  return (
    <div className="mb-4 border-l-4 border-waldgruen bg-waldgruen/5 rounded-r-lg overflow-hidden">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="tips-content"
        className={[
          "w-full flex items-center justify-between gap-3 px-4 py-3 text-left",
          "font-body text-sm font-semibold text-waldgruen-dark",
          "hover:bg-waldgruen/10 transition-colors cursor-pointer",
          hint && !open ? "animate-pulse" : "",
        ].join(" ")}
      >
        <span className="flex items-center gap-2">
          <svg
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
            <path d="M9 18h6" />
            <path d="M10 22h4" />
            <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2Z" />
          </svg>
          So wird dein Brief am wirksamsten
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`transition-transform duration-300 ${open ? "rotate-180" : "rotate-0"}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div
        id="tips-content"
        className={`transition-all duration-300 ease-out overflow-hidden ${
          open ? "max-h-[680px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 pt-1 font-body text-sm text-warmgrau leading-relaxed space-y-3">
          <p>
            <span className="font-semibold text-waldgruen-dark">Sei konkret.</span>{" "}
            Wo wohnst du, was siehst du, was hast du erlebt? Ein Satz mit deiner Straße oder
            deinem Stadtteil bringt mehr als jede Statistik.
          </p>
          <p>
            <span className="font-semibold text-waldgruen-dark">Eine Bitte reicht.</span>{" "}
            Was sollen Abgeordnete genau tun? Je klarer, desto wirkungsvoller. Lieber eine
            präzise Forderung als eine lange Wunschliste.
          </p>
          <p>
            <span className="font-semibold text-waldgruen-dark">Sag, wer du bist.</span>{" "}
            Beruf, Verein, Gewerkschaft: solche Details geben deinem Brief Gewicht. Auf
            der nächsten Seite kannst du das ergänzen.
          </p>
          <p>
            <span className="font-semibold text-waldgruen-dark">Trau dich, ehrlich zu sein.</span>{" "}
            Wut, Sorge, Hoffnung gehören rein. Du musst nicht wie ein Politiker klingen,
            du sollst wie du klingen.
          </p>
          <div className="mt-3 rounded-md bg-creme/70 border border-warmgrau/15 px-3 py-2 font-typewriter text-[13px] text-warmgrau/85 italic">
            Beispiel: &bdquo;Ich wohne in der Bremer Neustadt. Letzten Mittwoch stand ich morgens
            am Hauptbahnhof und habe gesehen, wie...&ldquo;
          </div>
        </div>
      </div>
    </div>
  );
}

const PLACEHOLDER_EXAMPLES: string[] = [
  "z.B. Die Radwege in meiner Stadt sind in einem katastrophalen Zustand. Als Vater von zwei Kindern fahre ich täglich...",
  "z.B. Die Mieten in meiner Nachbarschaft sind in den letzten Jahren massiv gestiegen. Junge Familien können sich die Stadt nicht mehr leisten...",
  "z.B. An der Grundschule meines Kindes teilen sich 340 Kinder zwölf Tablets. Der Digitalpakt Schule kommt nicht an...",
  "z.B. In unserer Region wird eine Waldfläche für ein Logistikzentrum gerodet, obwohl Alternativstandorte existieren...",
  "z.B. In meinem Landkreis gibt es keinen freien Kinderarzt mehr. Die nächste Praxis mit Kapazität ist 45 Kilometer entfernt...",
  "z.B. Ich mache mir Sorgen um den Umgangston in politischen Debatten und den wachsenden Vertrauensverlust in demokratische Institutionen...",
];

const PLACEHOLDER_ROTATE_MS = 4000;
const MIN_CHARS = 50;

const TONE_LABELS = ["freundlich", "höflich", "sachlich", "bestimmt", "nachdrücklich"] as const;

interface Step2IssueProps {
  onSubmit: (issueText: string, toneLevel: number, usedSpeechToText: boolean) => void;
  defaultValue?: string;
  defaultToneLevel?: number;
}

export function Step2Issue({
  onSubmit,
  defaultValue,
  defaultToneLevel,
}: Step2IssueProps) {
  const [issueText, setIssueText] = useState(defaultValue ?? "");
  const [voiceState, setVoiceState] = useState<VoiceRecorderState>("idle");
  const [voiceDone, setVoiceDone] = useState(false);
  const usedVoiceRef = useRef(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [toneLevel, setToneLevel] = useState(defaultToneLevel ?? 3);
  const charCount = issueText.trim().length;
  const tooShort = charCount < MIN_CHARS;
  const placeholder = PLACEHOLDER_EXAMPLES[placeholderIndex];
  const voiceTouched = voiceState !== "idle";

  const handleVoiceStateChange = useCallback((state: VoiceRecorderState) => {
    setVoiceState(state);
    if (state === "done") setVoiceDone(true);
  }, []);

  // Rotate placeholder every few seconds while textarea is empty, so users
  // get a sense of the kinds of issues that work without a category picker.
  useEffect(() => {
    if (issueText.length > 0) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDER_EXAMPLES.length);
    }, PLACEHOLDER_ROTATE_MS);
    return () => clearInterval(interval);
  }, [issueText]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIssueText(e.target.value);
  };

  const handleTranscription = (text: string) => {
    usedVoiceRef.current = true;
    setIssueText((prev) => (prev ? prev + "\n" + text : text));
  };

  const handleSubmit = () => {
    if (!tooShort) {
      onSubmit(issueText, toneLevel, usedVoiceRef.current);
    }
  };

  return (
    <div>
      <h1 className="font-typewriter text-[28px] font-semibold leading-[1.2] text-waldgruen-dark mb-2">
        Was beschäftigt dich gerade?
      </h1>
      <p className="font-body text-sm text-warmgrau/70 mb-4">
        Schildere dein Anliegen: schnell per Sprache oder direkt per Text. Je konkreter du es schilderst, desto wirkungsvoller wird dein Brief.{!voiceTouched && " Sprich dein Anliegen ein, wir tippen deinen Brief vor."}
      </p>

      {/* Tips disclosure — subtle nudge toward effective writing */}
      <TipsDisclosure />

      {/* Voice recorder — easy path first, fades out after transcription */}
      <div className={`transition-all duration-700 ease-out ${voiceDone ? "opacity-0 max-h-0 overflow-hidden mb-0" : "opacity-100 max-h-40 mb-4"}`}>
        <VoiceRecorder
          onTranscription={handleTranscription}
          onStateChange={handleVoiceStateChange}
        />
      </div>

      {/* Divider — hidden as soon as voice recording starts (or after) */}
      <div className={`flex items-center gap-3 my-4 transition-all duration-700 ease-out ${voiceTouched ? "opacity-0 max-h-0 overflow-hidden !my-0" : "opacity-100 max-h-8"}`}>
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
          placeholder={placeholder}
          className={[
            "bg-creme border border-warmgrau/30 rounded-lg px-4 py-3 text-base font-body text-warmgrau",
            "focus:outline-none focus:ring-2 focus:ring-waldgruen focus:border-waldgruen w-full",
            "min-h-[160px] max-h-[320px] resize-y",
          ].join(" ")}
          aria-describedby="issueText-counter"
        />
        <p
          id="issueText-counter"
          className={`text-right text-sm mt-1 ${tooShort ? "text-warmgrau/60" : "text-waldgruen"}`}
        >
          {tooShort ? `noch ${MIN_CHARS - charCount} Zeichen bis zum Brief` : `${charCount} Zeichen`}
        </p>
      </div>

      {/* Tone slider */}
      <div className="mt-6">
        <label className="block font-body text-sm text-warmgrau/70 mb-3">
          Tonalität des Briefes
        </label>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={toneLevel}
          onChange={(e) => setToneLevel(Number(e.target.value))}
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
          disabled={tooShort}
          className={[
            "bg-waldgruen text-creme font-semibold text-base px-8 py-4 rounded-xl",
            "hover:bg-waldgruen-dark transition-colors min-h-[44px] w-full",
            tooShort ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
          ].join(" ")}
        >
          Weiter
        </button>
      </div>
    </div>
  );
}
