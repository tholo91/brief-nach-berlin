# Brief nach Berlin – Bildplan für Unterseiten

Dieses Dokument beschreibt, welche Ghibli-Solarpunk-Bilder auf welchen Unterseiten platziert werden sollen, wo genau sie im Layout erscheinen, und die zugehörigen Generierungsprompts.

**Stil-Referenz:** Studio Ghibli, Solarpunk, Berlin. Warme Erdtöne, üppige Vegetation, Berliner Stadtlandschaft, hoffnungsvolle Atmosphäre, malerische Textur.

**Bild-Format:** Querformat (landscape), ca. 16:9 oder 3:2. Breite: 100% der Textspalte (max-w-2xl). Abgerundete Ecken (rounded-2xl), leichter Schatten.

---

## Bilder-Übersicht (6 einzigartige Bilder)

| Bild-ID | Motiv | Generiert? |
|---------|-------|------------|
| `img-oma-schreibt` | Ältere Frau schreibt Brief, Berliner Altbau, Abendlicht | ✅ Bereits generiert |
| `img-brief-schwebt` | Briefumschlag schwebt durch Berliner Straße Richtung Reichstag | ⬜ Noch zu generieren |
| `img-schreibtisch` | Junger Mensch schreibt am Schreibtisch, Nachmittagssonne | ⬜ Noch zu generieren |
| `img-drei-briefe` | Drei Briefe auf Holztisch, Tee, Morgenlicht | ⬜ Noch zu generieren |
| `img-treppe` | Steintreppe durch Berliner Park, Menschen auf verschiedenen Stufen | ⬜ Noch zu generieren |
| `img-kiez` | Mensch schreibt Brief auf Parkbank im Berliner Kiez | ⬜ Noch zu generieren |

---

## Seitenweise Platzierung

### `/warum` – Warum es Brief-nach-Berlin gibt

- **Bild:** `img-oma-schreibt` ✅
- **Platzierung:** Direkt nach dem Intro-Absatz (dem Zitat in Handschrift), vor dem ersten `<h2>` ("Wer dahintersteht")
- **Begründung:** Emotionaler Einstieg – das Bild fängt die Seele der Seite ein, bevor der Text erklärt
- **Breite:** Volle Spaltenbreite, ca. 400px Höhe

---

### `/warum-ein-brief` – Warum ein Brief mehr ist als ein Brief

- **Bild:** `img-brief-schwebt`
- **Platzierung:** Nach dem 2. Absatz des Artikels (nach dem Abschnitt über "Stimme abgeben")
- **Begründung:** Mitten im Essay als visueller Atemzug, wenn das Argument seinen ersten Gipfel erreicht
- **Breite:** Volle Spaltenbreite

---

### `/guide` – Der komplette Guide

- **Bild:** `img-schreibtisch`
- **Platzierung:** Zwischen Schritt 3 und Schritt 4 (nach "Den Brief formulieren", vor "Handschriftlich übertragen")
- **Begründung:** Genau an der Stelle, wo der Leser selbst zum Stift greifen soll – das Bild zeigt jemanden beim Tun
- **Breite:** Volle Spaltenbreite

---

### `/tipps` – 5 Schreibtipps

- **Bild:** `img-schreibtisch` (Wiederverwendung von `/guide`)
- **Platzierung:** Als Hero-Bild ganz oben, direkt unter dem `<h1>` und dem Intro-Satz, vor dem ersten Tipp
- **Begründung:** Kurze Seite, kein langer Text – das Bild gibt ihr sofort Charakter ohne im Weg zu stehen
- **Breite:** Volle Spaltenbreite

---

### `/beispiele` – Beispielbriefe

- **Bild:** `img-drei-briefe`
- **Platzierung:** Ganz oben als Hero, direkt nach dem `<h1>` und Intro-Text, vor den Beispielkarten
- **Begründung:** Bereitet den Leser visuell vor – er sieht Briefe, bevor er Briefe liest
- **Breite:** Volle Spaltenbreite

---

### `/aktiv-werden` – Aktiv werden

- **Bild:** `img-treppe`
- **Platzierung:** Nach dem Intro-Absatz, vor den drei Aktionskarten
- **Begründung:** Die Treppe symbolisiert genau das, was die Seite aussagen will: es gibt einen nächsten Schritt
- **Breite:** Volle Spaltenbreite

---

### `/treppe-der-selbstwirksamkeit` – Treppe der Selbstwirksamkeit

- **Bild:** `img-treppe` (Wiederverwendung von `/aktiv-werden`)
- **Platzierung:** Als Hero-Bild ganz oben, direkt nach `<h1>` und Intro-Satz
- **Begründung:** Gleiche Metapher, andere Seite – das Bild ist die Titelillustration des Konzepts
- **Breite:** Volle Spaltenbreite

---

### `/lage-der-nation` – Lage der Nation

- **Bild:** `img-brief-schwebt` (Wiederverwendung von `/warum-ein-brief`)
- **Platzierung:** Nach dem 4. Absatz (nach dem Impact-Text über die 6x-Nutzung), vor dem abschließenden Dank-Abschnitt
- **Begründung:** Das schwebende Brief-Bild passt zur Idee, dass etwas in der Welt angekommen ist
- **Breite:** Volle Spaltenbreite

---

### `/abgeordneten-schreiben` – Brief an Abgeordnete schreiben

- **Bild:** `img-brief-schwebt` (Wiederverwendung, dritte Verwendung)
- **Platzierung:** Nach dem 2. Absatz (nach der Einleitung zu Abgeordnetenbriefen), vor den konkreten Anleitungsschritten
- **Begründung:** Perfekte inhaltliche Passung – der Brief auf dem Weg zum Reichstag
- **Breite:** Volle Spaltenbreite

---

### `/andere-tools` – Andere Tools

- **Bild:** `img-drei-briefe` (Wiederverwendung von `/beispiele`)
- **Platzierung:** Nach dem Intro-Absatz, vor der Vergleichstabelle/-liste
- **Begründung:** Ruhiges, einladendes Bild bevor es sachlich wird – nimmt den Vergleichsseiten-Charakter etwas
- **Breite:** Volle Spaltenbreite

---

### `/kommunalpolitik-brief` – Brief an Kommunalpolitik

- **Bild:** `img-kiez`
- **Platzierung:** Direkt nach dem `<h1>` und Intro-Satz, als Hero-Einstieg
- **Begründung:** Hyperlokal und konkret – das Bild zeigt jemanden im eigenen Kiez, genau das, worum es geht
- **Breite:** Volle Spaltenbreite

---

## Bild-Prompts (für Generierung)

### `img-oma-schreibt` ✅ bereits vorhanden

Datei: `Gemini_Generated_Image_2o0iev2o0iev2o0i.png`

```
Studio Ghibli style illustration, solarpunk aesthetic, Berlin. An elderly German woman sits at a wooden kitchen table in a warm Altbau apartment at dusk, writing a handwritten letter with focused care. Soft lamplight, lush houseplants on every windowsill, Berlin rooftops visible through the window covered in wildflowers and small gardens. Warm amber and forest green palette. Gentle, hopeful atmosphere. Detailed background, painterly texture.
```

---

### `img-brief-schwebt`

```
Studio Ghibli style illustration, solarpunk Berlin. A single handwritten letter envelope floats gently through a sunlit Berlin street, past Gründerzeit buildings draped in climbing plants, linden trees in bloom, bicycles leaning against walls. In the far distance, the Reichstag dome glows golden. The letter trails a faint shimmer like it carries weight and meaning. Warm light, hopeful and slightly magical atmosphere. Soft painterly style.
```

---

### `img-schreibtisch`

```
Studio Ghibli style illustration, solarpunk. A young person sits at a tidy wooden desk, carefully writing a letter by hand. On the desk: a fountain pen, a stamp, an envelope, and a folded letter. Afternoon sunlight streams through a multi-pane window, a lush green plant wall behind them. Calm, focused, cozy atmosphere. Warm earthy tones, soft shadows, painterly detail.
```

---

### `img-drei-briefe`

```
Studio Ghibli style illustration, solarpunk. Three handwritten letters spread out on a warm wooden table, slightly overlapping, each with a German postage stamp. Between them: a ceramic cup of tea with steam rising, a small green branch, morning sunlight casting long shadows. Nostalgic yet hopeful mood. Soft warm colors, cozy and authentic atmosphere. Painterly style.
```

---

### `img-treppe`

```
Studio Ghibli style illustration, solarpunk. A wide stone staircase rises through a lush Berlin park toward a bright civic building at the top. People stand on different steps - some just beginning at the bottom, some near the top looking back with a smile. Wildflowers grow between the stones, trees arch overhead. The image feels like a journey, not a race. Warm afternoon light, gentle optimism. Painterly, detailed.
```

---

### `img-kiez`

```
Studio Ghibli style illustration, solarpunk Berlin. A person sits on a park bench in a Berliner Kiez, writing a handwritten letter. Around them: a neighborhood playground, children playing, a cracked pavement being slowly overgrown with small plants. The scene feels local, lived-in, and full of care. Warm afternoon colors, community intimacy, quiet determination. Painterly style.
```

---

## Implementierungshinweise

- Alle Bilder liegen im Ordner `/public/images/` als `.webp` (empfohlen) oder `.png`
- Next.js `<Image>` Komponente verwenden mit `width`, `height`, `alt`-Text
- Beispiel:

```tsx
<Image
  src="/images/img-oma-schreibt.webp"
  alt="Ältere Frau schreibt einen Brief in einer Berliner Altbauwohnung"
  width={800}
  height={450}
  className="w-full rounded-2xl shadow-md shadow-waldgruen/15 my-10"
/>
```

- `alt`-Texte immer auf Deutsch, beschreibend, ohne "Bild von"
- `my-10` als vertikalen Abstand empfohlen (ca. 40px oben und unten)
- Auf mobilen Geräten nimmt das Bild automatisch volle Breite ein
