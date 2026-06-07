"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { VoiceRecorder, type VoiceRecorderState } from "@/components/audio/VoiceRecorder";

interface TipsDisclosureProps {
  open: boolean;
  setOpen: (v: boolean) => void;
}

function TipsDisclosure({ open, setOpen }: TipsDisclosureProps) {
  const [hint, setHint] = useState(true);

  // Subtle pulse for ~3s on first mount to draw attention without being noisy.
  useEffect(() => {
    const t = setTimeout(() => setHint(false), 3000);
    return () => clearTimeout(t);
  }, []);

  const toggle = () => {
    setOpen(!open);
    setHint(false);
  };

  return (
    <div
      id="tips-disclosure"
      className="mb-4 border-l-4 border-waldgruen bg-waldgruen/5 rounded-r-lg overflow-hidden scroll-mt-4"
    >
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
          Je konkreter, desto wirksamer
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
        <div className="px-4 pb-4 pt-1 font-body text-sm text-warmgrau leading-relaxed space-y-3.5">
          <div>
            <p className="font-semibold text-waldgruen-dark mb-0.5">Stichpunkte genügen.</p>
            <p>Was siehst du, was nervt dich, was schlägst du vor? Daraus baut das Tool die Sätze.</p>
          </div>
          <div>
            <p className="font-semibold text-waldgruen-dark mb-0.5">Sag kurz, wer du bist.</p>
            <p>
              Beruf, Familie, Verein: solche Details geben Gewicht und verhindern, dass
              Annahmen über dich getroffen werden, die nicht stimmen.
            </p>
          </div>
          <div>
            <p className="font-semibold text-waldgruen-dark mb-0.5">Eine konkrete Bitte reicht.</p>
            <p>
              Was sollen die Abgeordneten <em>tun</em>? Ein präziser Satz schlägt eine
              lange Wunschliste.
            </p>
          </div>
          <div>
            <p className="font-semibold text-waldgruen-dark mb-0.5">
              Sag auch, was du <em>nicht meinst</em>.
            </p>
            <p>
              Wenn etwas missverstanden werden könnte (&bdquo;ich bin für X, aber gegen Y&ldquo;),
              schreib&rsquo;s explizit dazu.
            </p>
          </div>
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
  "z.B. Radwege bei uns kaputt, Schlaglöcher überall, gefährlich für Schulkinder",
  "z.B. Miete explodiert in unserem Viertel, Familien ziehen weg, was kann man tun?",
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
  const [tipsOpen, setTipsOpen] = useState(false);

  const charCount = issueText.trim().length;
  const tooShort = charCount < MIN_CHARS;
  const voiceTouched = voiceState !== "idle";
  const placeholder =
    voiceState === "recording"
      ? "Sprich jetzt, dein Text erscheint hier..."
      : voiceState === "processing"
        ? "Transkribiere deine Aufnahme..."
        : PLACEHOLDER_EXAMPLES[placeholderIndex];

  const handleVoiceStateChange = useCallback((state: VoiceRecorderState) => {
    setVoiceState(state);
    if (state === "done") setVoiceDone(true);
  }, []);

  // Rotate placeholder every few seconds while textarea is empty, so users
  // get a sense of the kinds of issues that work without a category picker.
  useEffect(() => {
    if (issueText.length > 0) return;
    if (voiceState === "recording" || voiceState === "processing") return;
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDER_EXAMPLES.length);
    }, PLACEHOLDER_ROTATE_MS);
    return () => clearInterval(interval);
  }, [issueText, voiceState]);

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
        Sprich drauflos und passe deinen Text danach an. Oder nenne ein paar Stichpunkte, du musst keine ganzen Sätze schreiben. Daraus wird dein Briefentwurf formuliert.
      </p>

      {/* Tips disclosure — subtle nudge toward effective writing */}
      <TipsDisclosure open={tipsOpen} setOpen={setTipsOpen} />

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
        <span className="font-body text-xs text-warmgrau/50">oder tipp deine Stichpunkte</span>
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
        <div className={`mt-2 transition-opacity duration-300 ${charCount > 0 ? "opacity-100" : "opacity-0"}`} aria-live="polite">
          <p id="issueText-counter" className="text-right text-sm text-warmgrau/50">
            {charCount} Zeichen
          </p>
        </div>
      </div>

      {/* Tone slider — appears softly once the user has typed enough to
          make a tone choice meaningful. Avoids overwhelming the first
          impression of step 2. */}
      <div
        aria-hidden={tooShort}
        className={[
          "overflow-hidden transition-all duration-500 ease-out",
          tooShort
            ? "opacity-0 max-h-0 mt-0 pointer-events-none"
            : "opacity-100 max-h-40 mt-6 md:mt-10",
        ].join(" ")}
      >
        <label className="block font-body text-sm text-warmgrau/70 mb-3">
          Tonalität des finalen Briefes
        </label>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={toneLevel}
          onChange={(e) => setToneLevel(Number(e.target.value))}
          className="w-full accent-waldgruen cursor-pointer disabled:opacity-50"
          aria-label="Tonlage des finalen Briefes"
          tabIndex={tooShort ? -1 : 0}
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
