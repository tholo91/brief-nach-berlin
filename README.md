# Brief nach Berlin

> Deine Meinung. Handschriftlich. An die Richtigen.

Ein politisches SaaS-Produkt, das Menschen ermöglicht, ihre Alltagsfrustration in wirkungsvolle, handschriftliche Briefe an Politiker zu verwandeln – ohne politisches Vorwissen, ohne Zeitaufwand.

---

## Das Problem

Handschriftliche Briefe werden in Bundestagsbüros tatsächlich gelesen und berücksichtigt – anders als Onlinepetitionen oder Social-Media-Posts. Aber die meisten Menschen wissen nicht, an wen sie schreiben sollen, wie sie es formulieren sollen, oder glauben schlicht, dass es nichts bringt.

Das Ergebnis: politische Ohnmacht, obwohl ein einfacher Kanal existiert.

## Die Lösung

**Brief nach Berlin** macht den Weg von der Alltagsfrustration zum adressierten Politikerbrief so einfach wie möglich:

1. **Eingabe** – Sprachnachricht, Foto oder kurzer Text: "Die Bushaltestelle vor unserer Schule wurde abgebaut."
2. **PLZ eingeben** – Wohnort in Deutschland
3. **Zuständige Politiker werden identifiziert** – MdB, EU-Abgeordnete, Landtag, Kommunalpolitik
4. **KI schreibt den Brief** – genau eine Seite, handschrifttauglich, zielgruppenspezifisch formuliert
5. **Nutzer wählt Empfänger** – ggf. mehrere Versionen für verschiedene Ebenen
6. **Abschreiben & Abschicken** – der Nutzer schreibt den Brief per Hand ab und schickt ihn selbst

---

## Kernprinzipien

- **Handschriftlich ist entscheidend** – das ist der Wirkungskanal, kein Nice-to-have
- **Eine Seite** – klare Beschränkung, damit der Brief wirklich abgeschrieben wird
- **Zielgruppenspezifisch** – ein Brief an den Bund argumentiert anders als einer an die Gemeinde
- **Keine Ohnmacht** – das Produkt gibt das Gefühl zurück, gehört werden zu können

---

## Roadmap (grob)

### v1 – Kern-MVP
- [ ] PLZ-basierte Politiker-Zuordnung (Bund, Land, Kommune, EU)
- [ ] Eingabe via Text, Speech-to-Text (Sprache), Bild
- [ ] KI-Briefgenerierung (1 Seite, ebenenspezifisch)
- [ ] Scheiterns-Kontext: Warum stockt das Anliegen politisch?
- [ ] Empfänger-Auswahl inkl. Brüssel (EU-Abgeordnete) + Anzeige der Adresse
- [ ] Spendenaufruf nach Briefgenerierung
- [ ] Einfache Landing Page

### v2 – Auto-Pen-Integration
- [ ] Partnerschaft mit Auto-Pen-Dienst (handschriftlich wirkender Druck & Versand)
- [ ] Optionaler Direktversand ohne Eigenaufwand des Nutzers
- [ ] Tracking / Bestätigung

---

## Datenquellen (Politiker-Daten)

Politikerdaten ändern sich nur nach Wahlen (alle 4 Jahre auf Bundesebene, variabel auf Landesebene).

Mögliche Quellen:
- [Offenes Parlament / OffenesParlament.de](https://offenesparlament.de)
- [Bundestag Open Data API](https://www.bundestag.de/services/opendata)
- [Abgeordnetenwatch API](https://www.abgeordnetenwatch.de/api)
- EU-Parlament: MEP-Daten über offizielle EU-API
- Kommunaldaten: ggf. manuell kuratiert oder per Web-Crawling

---

## Projektstruktur (geplant)

```
brief-nach-berlin/
├── README.md
├── KONZEPT.md          # Detaillierte Produktvision & offene Fragen
├── docs/
│   └── datenquellen.md
├── src/                # (später)
└── ...
```

---

## Hintergrund

Entstanden aus einem Bundestags-Praktikum und einem Studium der Politikwissenschaft – mit der Beobachtung, dass handschriftliche Bürgerbriefe in Abgeordnetenbüros eine überraschend hohe Wirkung haben.
