interface SectionDividerProps {
  symbol?: string;
  className?: string;
}

export function SectionDivider({ symbol = "✦", className = "" }: SectionDividerProps) {
  return (
    <div
      aria-hidden
      className={`my-12 md:my-16 flex items-center justify-center gap-4 text-waldgruen/30 ${className}`}
    >
      <span className="h-px w-16 bg-current" />
      <span className="font-typewriter text-sm tracking-[0.4em]">{symbol}</span>
      <span className="h-px w-16 bg-current" />
    </div>
  );
}
