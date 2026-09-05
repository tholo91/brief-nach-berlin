import {
  GERMANY_MAP_PATH,
  GERMANY_MAP_VIEWBOX,
} from "@/lib/letterSignals/germanyMapGeometry.generated";
import type { LetterMapPoint } from "@/lib/letterSignals/mapTypes";

export type OwnPointState = "idle" | "flying" | "contributed";

export function GermanyContributionMap({
  points,
  ownPoint,
  ownPointState = "idle",
  reducedMotion = false,
  variant = "compact",
  label,
}: {
  points: LetterMapPoint[];
  ownPoint?: { x: number; y: number } | null;
  ownPointState?: OwnPointState;
  reducedMotion?: boolean;
  variant?: "compact" | "landing";
  label: string;
}) {
  const ownVisible = Boolean(ownPoint && ownPointState === "contributed");
  const flightPath = ownPoint
    ? `M 12 168 Q 64 154 ${ownPoint.x} ${ownPoint.y}`
    : "";

  return (
    <svg
      viewBox={GERMANY_MAP_VIEWBOX}
      role="img"
      aria-label={label}
      className={
        variant === "landing"
          ? "mx-auto h-auto w-full max-w-[18rem] md:max-w-[29rem]"
          : "mx-auto h-auto w-full max-w-[13rem]"
      }
    >
      <path
        d={GERMANY_MAP_PATH}
        fillRule="evenodd"
        className="fill-waldgruen/[0.035] stroke-waldgruen/45"
        strokeWidth="1.25"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />

      {points.map((point, index) => (
        <circle
          key={`${point.x}-${point.y}-${index}`}
          cx={point.x}
          cy={point.y}
          r={Math.min(2.5, 0.75 + Math.log2(point.count + 1) * 0.32)}
          className="fill-waldgruen/60"
        />
      ))}

      {ownPoint && ownPointState === "flying" && !reducedMotion && (
        <g className="text-airmail-rot">
          <rect x="-5" y="-3.4" width="10" height="6.8" rx="0.7" fill="white" stroke="currentColor" strokeWidth="1.2" />
          <path d="m-5-3.2 5 3.4 5-3.4" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <animateMotion dur="760ms" path={flightPath} fill="freeze" />
        </g>
      )}

      {ownVisible && ownPoint && (
        <g>
          <circle cx={ownPoint.x} cy={ownPoint.y} r="3.4" className="fill-airmail-rot/20">
            {!reducedMotion && (
              <>
                <animate attributeName="r" values="3.4;11;3.4" dur="900ms" repeatCount="1" />
                <animate attributeName="opacity" values="0.8;0;0" dur="900ms" repeatCount="1" />
              </>
            )}
          </circle>
          <circle cx={ownPoint.x} cy={ownPoint.y} r="3.2" className="fill-airmail-rot" />
        </g>
      )}
    </svg>
  );
}
