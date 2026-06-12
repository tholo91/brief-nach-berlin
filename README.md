# Brief nach Berlin

> Deine Meinung. Handschriftlich. An die Richtigen.

**Brief nach Berlin** verwandelt Alltagsfrust in einen echten Brief an den zuständigen Politiker - in unter 3 Minuten, ohne politisches Vorwissen.

Live unter [brief-nach-berlin.de](https://brief-nach-berlin.de)

---

## Wie es funktioniert

1. Frustration beschreiben - als Text, Sprachnachricht oder Foto
2. PLZ eingeben
3. Die KI identifiziert zuständige Politiker (Bund, Land, Kommune, EU)
4. Ein Brief wird generiert - genau eine Seite, formell, adressiert
5. Abschreiben und abschicken - per Hand, per Post

Warum handschriftlich? Weil handgeschriebene Bürgerbriefe in Bundestagsbüros tatsächlich gelesen und in Sitzungen erwähnt werden. Onlinepetitionen nicht.

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

## Hintergrund

Entstanden aus einem Bundestags-Praktikum und einem Studium der Politikwissenschaft. Die Beobachtung: handschriftliche Bürgerbriefe haben in Abgeordnetenbüros eine überraschend hohe Wirkung - aber kaum jemand nutzt diesen Kanal, weil die Hürde zu groß ist.

Ein Solo-Projekt von [Thomas Lorenz](https://thomas-lorenz.eu).
