# 001 — Meilenstein-Mail: Briefe fliegen in die Luft

- **Type:** Image (E-Mail-Hero + Social-Kachel)
- **Status:** next step
- **Target tool:** Nano Banana / Midjourney / GPT Image
- **Purpose:** Ein Bild, das Ersteller screenshotten und posten wollen, wenn ihre Kampagne 50, 100, 500 … Briefe erreicht.
- **Wichtig:** Kein Text im Bild. Die Zahl („500 Briefe"), der Kampagnentitel und brief-nach-berlin.de kommen per HTML bzw. `next/og` darüber, damit ein Bild für alle Stufen reicht.

## Formate

| # | Format | Einsatz | Freiraum |
|---|--------|---------|----------|
| A | 3:2 quer (1800×1200) | Kopfbild der Mail | oberes Drittel ruhiger Himmel |
| B | 4:5 hoch (1080×1350) | Instagram-Post, LinkedIn | obere 40 % ruhiger Himmel für Zahl + Titel |
| C | 9:16 hoch (1080×1920) | Instagram-Story | obere 35 % und untere 15 % ruhig |

Erst A generieren und Stil festzurren, dann B und C mit A als Referenzbild.

## Konzept 1: Briefe-Konfetti (empfohlen)

```
A joyful celebration scene in Studio Ghibli background art style (Kazuo Oga),
set in a hopeful solarpunk Berlin. Hand-painted, visible brushstrokes,
watercolor sky, gouache mid-ground.

SCENE: A small, diverse group of ordinary people (different ages, a grandmother,
a teenager, a parent with a child on their shoulders, someone in a wheelchair)
stand together on a green rooftop garden and joyfully toss dozens of letters
and envelopes high into the air. The letters fly upward and scatter like a
flock of paper birds and confetti, catching the golden light. Envelopes have
subtle airmail edges in muted red and blue, a few have small stamps.
Faces are seen from the side or behind, joyful body language, laughing,
arms raised. Not a protest: no signs, no banners, no flags.

SETTING: Rooftop with wildflowers, raised vegetable beds, a few solar panels,
string lights. Below and behind: Berlin Altbau rooftops covered in greenery,
the glass dome of the Reichstag softly visible in the distance in atmospheric
haze, the Fernsehturm even softer, two modern wind turbines on the horizon.

LIGHT AND SKY: Golden hour, honey-colored light, enormous soft cumulus clouds,
peach-gold horizon fading to gentle cerulean. The upper third of the image is
open, calm sky with only a few drifting letters, leaving room for a headline.

COLOR PALETTE: Rich layered greens (forest #2D6A4F, sage, moss), warm cream
(#FAF8F5) and sandstone, muted airmail red (#C1121F) and airmail blue
(#1D3557) only as small accents on envelopes. Slightly desaturated and warm,
like a beautiful faded postcard. Shadows soft blue-green, never black.

MOOD: Pride, relief, community, "we did this together". Warm, hopeful,
grounded, not cute, not kitsch.

AVOID: No readable text, no letters with legible writing, no logos, no flags,
no party colors, no crowds of hundreds, no stock-photo look, no AI glow,
no purple gradients, no fireworks, no emojis, no watermark.

Aspect ratio 3:2, high resolution.
```

## Konzept 2: Briefschwarm über Berlin (Alternative)

Gleicher Stil-Block wie oben, nur SCENE und SETTING ersetzen:

```
SCENE: Hundreds of letters and envelopes fly over a green solarpunk Berlin
like a great flock of birds, forming a long, flowing ribbon that curves through
the sky toward the glass dome of the Reichstag. In the lower foreground, on a
tree-lined street with a red German mailbox, a few people look up and wave,
one child points at the flock, a cyclist has stopped to watch.

SETTING: Altbau facades with ivy and balconies full of plants, cobblestones
with wildflowers, bicycles, a linden tree. The Reichstag dome sits in the
middle distance, warm and softly lit, the letter flock streaming toward it.
```

## Nach der Generierung

1. Beste Variante als `prompts/meilenstein-mail/assets/` ablegen.
2. Für die Mail als JPG/PNG exportieren (kein WebP, Outlook zeigt es nicht), max. 1200 px breit, unter 250 KB, nach `web/public/images/email-meilenstein.jpg`.
3. EXIF/GPS entfernen und mit `mdls` prüfen, bevor es nach `public/` geht.
