import Image from "next/image";

type Variant = "wizard" | "success" | "content";

const VARIANTS: Record<Variant, { src: string; alt: string }> = {
  // Café-Szene, Berliner Altbaustraße, Reichstag in der Ferne — beim Schreiben.
  wizard: { src: "/images/img-fade-wizard.webp", alt: "" },
  // Brief fliegt über Berliner Dächer — auf dem Weg.
  success: { src: "/images/img-fade-success.webp", alt: "" },
  // Diverses Kiez-Leben, ruhige Allee, Reichstag-Andeutung — Standard für Content-Seiten.
  content: { src: "/images/img-fade-content.webp", alt: "" },
};

interface FadeFooterImageProps {
  variant: Variant;
}

// Dezente, breitwandige Footer-Illustration im Ghibli-Solarpunk-Stil. Sitzt
// unter dem Seiteninhalt, oberhalb des AppFooter. Wird per CSS-Maske nach oben
// transparent ausgeblendet, damit der Lesebereich darüber ruhig bleibt.
// Decorative — aria-hidden, leerer alt.
export default function FadeFooterImage({ variant }: FadeFooterImageProps) {
  const { src, alt } = VARIANTS[variant];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none w-full overflow-hidden mt-auto"
      style={{
        height: "clamp(180px, 22vw, 300px)",
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={1584}
        height={672}
        sizes="100vw"
        loading="lazy"
        className="w-full h-full object-cover object-bottom"
        style={{
          opacity: 0.32,
          maskImage:
            "linear-gradient(to top, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage:
            "linear-gradient(to top, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 100%)",
        }}
      />
    </div>
  );
}
