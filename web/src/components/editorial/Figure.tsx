import Image from "next/image";
import { ReactNode } from "react";

type Side = "left" | "right";

interface FigureProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  side?: Side;
  rotate?: "left" | "right" | "none";
  caption?: ReactNode;
  className?: string;
}

const sideClass: Record<Side, string> = {
  // md+: float so text wraps around. Mobile: stays block, centered with max width.
  right: "md:float-right md:ml-7 md:mb-3 md:clear-right",
  left: "md:float-left md:mr-7 md:mb-3 md:clear-left",
};

const rotateClass: Record<NonNullable<FigureProps["rotate"]>, string> = {
  left: "-rotate-2",
  right: "rotate-2",
  none: "",
};

export function Figure({
  src,
  alt = "",
  width = 240,
  height = 162,
  side = "right",
  rotate = "right",
  caption,
  className = "",
}: FigureProps) {
  // Rotate outward looks more natural when the image hugs an edge.
  const effectiveRotate = rotate === "right" && side === "left" ? "left" : rotate;

  return (
    <figure
      className={`
        my-6 mx-auto max-w-xs
        md:my-1 md:mx-0 md:max-w-none
        ${sideClass[side]}
        md:w-[220px] lg:w-[240px]
        ${className}
      `}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes="(max-width: 768px) 320px, 240px"
        className={`
          rounded-2xl shadow-xl shadow-waldgruen/20 opacity-95
          ${rotateClass[effectiveRotate]}
          transition-all duration-500
          hover:shadow-2xl hover:shadow-waldgruen/30 hover:-translate-y-0.5
          w-full h-auto
        `}
      />
      {caption ? (
        <figcaption className="mt-2 font-handwriting text-sm md:text-base text-warmgrau/60 leading-snug">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
