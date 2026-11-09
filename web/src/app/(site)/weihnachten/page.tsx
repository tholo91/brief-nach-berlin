import Image from "next/image";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { DONATION_PROVIDER_URL } from "@/lib/config";
import { isWinterActionActive } from "@/lib/winter-action";
import styles from "./winter.module.css";

export const metadata: Metadata = {
  title: "Meine Spendenempfehlungen zu Weihnachten | Brief-nach-Berlin",
  description: "Vier Spendenmöglichkeiten, die mir am Herzen liegen.",
  robots: { index: false, follow: false },
};

const causes = [
  { name: "UNHCR", logo: "unhcr.svg", tag: "Ukraine", description: "Humanitäre Hilfe für Menschen, die vom Krieg betroffen sind.", href: "https://giving.unhcr.org/en/ukraine/" },
  { name: "UNICEF", logo: "unicef.svg", tag: "Kinder weltweit", description: "Hilfe für Kinder in Not weltweit.", href: "https://www.unicef.de/spenden/einmalig-spenden" },
  { name: "Greenpeace", logo: "greenpeace.svg", tag: "Umwelt & Klima", description: "Für Umwelt- und Klimaschutz.", href: "https://www.greenpeace.de/spenden" },
  { name: "Brief-nach-Berlin", logo: null, tag: "Mein Projekt", description: "Wenn du auch mein Projekt unterstützen möchtest.", href: DONATION_PROVIDER_URL },
];

export default async function WeihnachtenPage() {
  await connection();
  if (!isWinterActionActive()) redirect("/spenden");

  return (
    <div className={styles.scene}>
      <div className={styles.snow} aria-hidden="true">
        {Array.from({ length: 36 }, (_, i) => (
          <span key={i} style={{ "--x": `${(i * 37 + 5) % 100}%`, "--delay": `${-(i * 1.73) % 20}s`, "--duration": `${13 + (i % 7)}s`, "--size": `${3 + (i % 5)}px` } as CSSProperties} />
        ))}
      </div>
      <article className={styles.letter}>
        <header className={styles.intro}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>Ein Weihnachtsgruß aus Bremen</p>
            <h1>Gutes weitergeben<span>.</span></h1>
            <p>Moin, ich bin Thomas 👋</p>
            <p>Normalerweise freue ich mich über Spenden für Brief-nach-Berlin. In der Vorweihnachtszeit und über die Feiertage möchte ich meine Reichweite gerne mit ein paar Organisationen teilen, die gerade Unterstützung brauchen.</p>
            <p>Wenn du etwas übrig hast, schau doch mal bei ihnen vorbei. Und falls du auch mein Projekt unterstützen möchtest: Das findest du ganz unten.</p>
            <p className={styles.signature}>Danke dir und frohe Weihnachten!<br />Thomas</p>
          </div>
          <figure className={styles.portrait}>
            <div className={styles.frame}><Image src="/images/thomas-weihnachten.png" alt="Thomas mit gebastelter Weihnachtsmütze und weißem Bart" width={480} height={480} priority /></div>
            <figcaption>HO HO HO</figcaption>
          </figure>
        </header>
        <section className={styles.causes} aria-labelledby="spendenziele">
          <div className={styles.sectionHeading}><h2 id="spendenziele">Hier kannst du helfen</h2></div>
          <ul>
            {causes.map((cause, index) => (
              <li key={cause.name} className={index === 3 ? styles.ownCause : undefined}>
                <a href={cause.href} target="_blank" rel="noopener noreferrer">
                  <span className={styles.causeText}><span className={styles.tag}>{cause.tag}</span>{cause.logo ? <Image className={styles.logo} src={`/images/weihnachten-logos/${cause.logo}`} alt={cause.name === "Greenpeace" ? "Greenpeace: Trademark of Greenpeace International" : cause.name} width={110} height={38} unoptimized /> : <span className={styles.causeName}>{cause.name}</span>}<span className={styles.description}>{cause.description}</span></span>
                  <span className={styles.arrow} aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
          <p className={styles.note}>Die Links führen direkt zu den jeweiligen Spendenanbietern.</p>
        </section>
      </article>
    </div>
  );
}
