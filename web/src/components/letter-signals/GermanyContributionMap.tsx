import {
  GERMANY_MAP_PATH,
  GERMANY_MAP_VIEWBOX,
} from "@/lib/letterSignals/germanyMapGeometry.generated";
import type { LetterMapPoint } from "@/lib/letterSignals/mapTypes";
import { contributionPointRadius, scaledPointRadius } from "@/lib/letterSignals/mapViewport";

export type OwnPointState = "idle" | "flying" | "contributed";

export function GermanyContributionMap({
  points,
  ownPoint,
  ownPointState = "idle",
  reducedMotion = false,
  variant = "compact",
  viewBox = GERMANY_MAP_VIEWBOX,
  zoom = 1,
  label,
}: {
  points: LetterMapPoint[];
  ownPoint?: { x: number; y: number } | null;
  ownPointState?: OwnPointState;
  reducedMotion?: boolean;
  variant?: "compact" | "landing" | "expanded";
  viewBox?: string;
  zoom?: number;
  label: string;
}) {
  const ownVisible = Boolean(ownPoint && ownPointState === "contributed");
  const expanded = variant === "expanded";
  const ownRadius = scaledPointRadius(3.2, zoom);
  const flightPath = ownPoint
    ? `M 12 168 Q 64 154 ${ownPoint.x} ${ownPoint.y}`
    : "";

  return (
    <svg
      viewBox={viewBox}
      role="img"
      aria-label={label}
      className={
        expanded
          ? "block h-full w-full"
          : variant === "landing"
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
          r={scaledPointRadius(contributionPointRadius(point.count), zoom)}
          className={expanded ? "fill-waldgruen/70 stroke-creme" : "fill-waldgruen/60"}
          {...(expanded ? { strokeWidth: 0.75, vectorEffect: "non-scaling-stroke" as const } : {})}
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
          <circle cx={ownPoint.x} cy={ownPoint.y} r={scaledPointRadius(3.4, zoom)} className="fill-airmail-rot/20">
            {!reducedMotion && (
              <>
                <animate
                  attributeName="r"
                  values={`${scaledPointRadius(3.4, zoom)};${scaledPointRadius(11, zoom)};${scaledPointRadius(3.4, zoom)}`}
                  dur="900ms"
                  repeatCount="1"
                />
                <animate attributeName="opacity" values="0.8;0;0" dur="900ms" repeatCount="1" />
              </>
            )}
          </circle>
          <circle
            cx={ownPoint.x}
            cy={ownPoint.y}
            r={ownRadius}
            className="fill-airmail-rot"
            {...(expanded ? { stroke: "white", strokeWidth: 2, vectorEffect: "non-scaling-stroke" as const } : {})}
          />
        </g>
      )}
    </svg>
  );
}
