# Brief-nach-Berlin

> Deine Meinung. Handschriftlich. An die Richtigen.

**Brief-nach-Berlin** hilft Menschen, aus politischer Ohnmacht ins Handeln zu kommen: Das Tool macht aus einem eigenen Anliegen in wenigen Minuten einen persönlichen Brief an die zuständige politische Vertretung.

Live unter [brief-nach-berlin.de](https://brief-nach-berlin.de)

🇪🇺 Want to bring this open source approach to Austria, Portugal, the Netherlands, or another European democracy? Start here: [brief-nach-berlin.de/europe](https://www.brief-nach-berlin.de/europe)

AI fork guide: [ADAPT_TO_YOUR_COUNTRY.md](ADAPT_TO_YOUR_COUNTRY.md)

---

## Wie es funktioniert

1. Frustration beschreiben - als Text, Sprachnachricht oder Foto
2. PLZ eingeben
3. Die KI identifiziert zuständige Politiker (Bund, Land, Kommune, EU)
4. Ein Brief wird generiert - genau eine Seite, formell, adressiert
5. Abschreiben und abschicken - per Hand, per Post

Warum handschriftlich? Weil der Brief dadurch nicht bei der Formulierung endet: Du liest ihn, passt ihn an, schreibst ihn selbst ab und schickst ihn ab. Diese menschliche Handlung ist der Punkt, nicht möglichst viel automatisierte Post.

## Selbstverständnis

Brief-nach-Berlin nimmt Menschen nicht die eigene Meinung ab. Es nimmt eine konkrete Hürde weg: Wer ein politisches Anliegen hat, muss nicht erst die richtige Adresse recherchieren, Amtsdeutsch beherrschen oder lange überlegen, wie ein Brief aufgebaut sein soll. Ein Entwurf ist in wenigen Minuten da. Die Entscheidung, ihn zu prüfen, persönlich zu machen und abzuschicken, bleibt bei der Person selbst.

Der Brief ist kein vollständiges Beteiligungsprogramm und keine Garantie für eine Antwort. Er kann aber ein erster, asynchroner Schritt sein, wenn der nächste Schritt sonst zu groß wirkt. So kann aus „Die da oben müssten doch mal …“ ein eigener Anspruch an die politische Vertretung werden.

Das Projekt ist Open Source. Dadurch kann das Grundmuster auch für andere Länder angepasst werden: Anliegen aufnehmen, politische Zuständigkeit erklären, die passende Adresse finden und Menschen zu einer eigenen Handlung ermutigen. Die konkrete Daten- und Zuständigkeitslogik bleibt dabei jeweils lokal.

---

## Traction

- ~700 Briefe generiert in einem Monat
- Erwähnt in [Lage der Nation](https://lagedernation.org) - dem meistgehörten politischen Podcast Deutschlands

---

## Stack

- **Next.js** + Vercel
- **Mistral AI** - Briefgenerierung und Sprachtranskription (Voxtral)
- **Supabase** - Statistiken, kein User-Storage
- **Brevo** - optionaler E-Mail-Versand
- PLZ-Wahlkreis-Mapping via statischem CSV der Bundeswahlleiterin
- Politiker-Daten via Abgeordnetenwatch API

Kein Account. Keine persistenten Nutzerdaten. DSGVO-konform by design.

---

## Finanzierung

Brief-nach-Berlin ist eine gemeinnützige Initiative in Trägerschaft der WE AID gGmbH. Das Projekt bleibt kostenlos; Spenden helfen bei Betrieb und Weiterentwicklung. Mehr dazu unter [brief-nach-berlin.de/spenden](https://www.brief-nach-berlin.de/spenden).

---

## Hintergrund

Entstanden aus einem Bundestags-Praktikum und einem Studium der Politikwissenschaft. Die persönliche Ausgangsfrage war einfacher: Wie kann ich meiner Mutter die Ausrede nehmen, einen Brief nicht zu schreiben, obwohl sie sich über Politik ärgert? Daraus wurde ein Tool, das Recherche und Formulierung erleichtert, damit aus Meckern ein eigener Anspruch an die politische Vertretung werden kann.

Ein Solo-Projekt von [Thomas Lorenz](https://thomas-lorenz.eu).
