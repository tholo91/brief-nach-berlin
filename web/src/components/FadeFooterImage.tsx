import Image from "next/image";

type Variant = "wizard" | "success" | "content" | "level";

// fadeStart: where the mask reaches full opacity (higher = less fade, more image visible).
// fullHeight: render at natural aspect ratio (no crop) instead of clamped band — used when
// the interesting subject sits in the top portion of the source image.
const VARIANTS: Record<Variant, {
  src: string;
  alt: string;
  fadeStart: string;
  width: number;
  height: number;
  fullHeight?: boolean;
}> = {
  // Café-Szene, Berliner Altbaustraße, Reichstag in der Ferne — beim Schreiben.
  wizard: {
    src: "/images/img-fade-wizard.webp",
    alt: "",
    fadeStart: "35%",
    width: 1584,
    height: 672,
  },
  // Brief-Taube über Berliner Dächern. Subjekt sitzt oben rechts — komplette
  // Höhe rendern, sonst schneidet object-bottom die Taube weg.
  success: {
    src: "/images/img-fade-success.webp",
    alt: "",
    fadeStart: "85%",
    width: 1584,
    height: 672,
    fullHeight: true,
  },
  // Diverses Kiez-Leben, ruhige Allee, Reichstag-Andeutung — Standard für Content-Seiten.
  content: {
    src: "/images/img-fade-content.webp",
    alt: "",
    fadeStart: "35%",
    width: 1584,
    height: 672,
  },
  // Rathaus, Landtag und Bundestag in einer gemeinsamen Landschaft — Ebene wählen.
  level: {
    src: "/images/img-fade-level.webp",
    alt: "",
    fadeStart: "35%",
    width: 900,
    height: 473,
  },
};

interface FadeFooterImageProps {
  variant: Variant;
  successBackground?: boolean;
}

// Dezente, breitwandige Footer-Illustration im Ghibli-Solarpunk-Stil. Sitzt
// unter dem Seiteninhalt, oberhalb des Seitenfooters. Wird per CSS-Maske nach oben
// transparent ausgeblendet, damit der Lesebereich darüber ruhig bleibt.
// Decorative — aria-hidden, leerer alt.
export default function FadeFooterImage({ variant, successBackground = false }: FadeFooterImageProps) {
  const { src, alt, fadeStart, width, height, fullHeight } = VARIANTS[variant];
  const mask = `linear-gradient(to top, rgba(0,0,0,1) ${fadeStart}, rgba(0,0,0,0) 100%)`;

  return (
    <div
      aria-hidden="true"
      className={successBackground
        ? "pointer-events-none absolute inset-x-0 bottom-0 mx-auto w-full select-none overflow-hidden"
        : "pointer-events-none mx-auto mt-auto w-full select-none overflow-hidden"
      }
      style={
        successBackground
          ? { height: "min(48vh, 520px)", maxWidth: `${width}px` }
          : fullHeight
          ? { maxHeight: "min(48vh, 520px)", maxWidth: `${width}px` }
          : { height: "clamp(180px, 22vw, 300px)", maxWidth: `${width}px` }
      }
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes="100vw"
        loading="lazy"
        className={
          successBackground
            ? "h-full w-full object-cover object-bottom"
            : fullHeight
            ? "h-auto w-full object-contain"
            : "w-full h-full object-cover object-bottom"
        }
        style={{
          opacity: 0.32,
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      />
    </div>
  );
}
