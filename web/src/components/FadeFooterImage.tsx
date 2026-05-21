import Image from "next/image";

type Variant = "wizard" | "success" | "content";

// fadeStart: where the mask reaches full opacity (higher = less fade, more image visible).
// fullHeight: render at natural aspect ratio (no crop) instead of clamped band — used when
// the interesting subject sits in the top portion of the source image.
const VARIANTS: Record<Variant, {
  src: string;
  alt: string;
  fadeStart: string;
  fullHeight?: boolean;
}> = {
  // Café-Szene, Berliner Altbaustraße, Reichstag in der Ferne — beim Schreiben.
  wizard: { src: "/images/img-fade-wizard.webp", alt: "", fadeStart: "35%" },
  // Brief-Taube über Berliner Dächern. Subjekt sitzt oben rechts — komplette
  // Höhe rendern, sonst schneidet object-bottom die Taube weg.
  success: { src: "/images/img-fade-success.webp", alt: "", fadeStart: "85%", fullHeight: true },
  // Diverses Kiez-Leben, ruhige Allee, Reichstag-Andeutung — Standard für Content-Seiten.
  content: { src: "/images/img-fade-content.webp", alt: "", fadeStart: "35%" },
};

interface FadeFooterImageProps {
  variant: Variant;
}

// Dezente, breitwandige Footer-Illustration im Ghibli-Solarpunk-Stil. Sitzt
// unter dem Seiteninhalt, oberhalb des AppFooter. Wird per CSS-Maske nach oben
// transparent ausgeblendet, damit der Lesebereich darüber ruhig bleibt.
// Decorative — aria-hidden, leerer alt.
export default function FadeFooterImage({ variant }: FadeFooterImageProps) {
  const { src, alt, fadeStart, fullHeight } = VARIANTS[variant];
  const mask = `linear-gradient(to top, rgba(0,0,0,1) ${fadeStart}, rgba(0,0,0,0) 100%)`;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none w-full overflow-hidden mt-auto"
      style={
        fullHeight
          ? { maxHeight: "min(48vh, 520px)" }
          : { height: "clamp(180px, 22vw, 300px)" }
      }
    >
      <Image
        src={src}
        alt={alt}
        width={1584}
        height={672}
        sizes="100vw"
        loading="lazy"
        className={
          fullHeight
            ? "w-full h-auto object-contain"
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
