# Produktkonzept – Brief nach Berlin

Detaillierte Überlegungen zur Produktvision, offene Fragen und Designentscheidungen.

---

## Nutzererlebnis (User Flow)

```
[Startseite]
    ↓
Frustrationseingabe:
  - Sprachnachricht (Audio → Transkript)
  - Foto (z.B. kaputte Straße → OCR / Vision)
  - Freitext
    ↓
PLZ eingeben → Validation (muss DE sein)
    ↓
System identifiziert zuständige Politiker:
  - Bundesebene: MdB des Wahlkreises
  - EU-Ebene: MdEP der Region
  - Landesebene: MdL des Wahlkreises
  - Kommunal: Bürgermeister / Stadtrat (wo verfügbar)
    ↓
KI-Briefgenerierung
  - Thema analysieren → welche Ebene ist primär zuständig?
  - Scheiterns-Kontext: Warum stockt das Anliegen gerade? (Gesetz, Partei, Ausschuss)
  - Brief(e) schreiben: 1 Seite, klar, sachlich, mit persönlicher Note
  - Ggf. mehrere Versionen (Bund vs. Land vs. Kommune vs. EU/Brüssel)
    ↓
Nutzer-Review:
  - Brief lesen, ggf. leicht editieren
  - Empfänger auswählen (inkl. EU-Abgeordnete für Brüssel)
  - Adresse angezeigt bekommen
    ↓
[Optional v2: Auto-Pen-Versand]
[v1: "Jetzt abschreiben & abschicken"]
    ↓
[Spendenaufruf: "Dieser Brief war kostenlos – hilf uns, das so zu halten"]
```

---

## KI-Briefgenerierung – Anforderungen

### Länge & Format
- Exakt 1 Seite handschriftlich (ca. 200–280 Wörter bei normaler Handschrift)
- Kein Letterhead nötig – nur Datum, Anrede, Text, Grußformel, Name (Platzhalter)
- Keine Bullet Points – Fließtext, wie ein echter Brief

### Ton
- Persönlich, aber sachlich
- Nicht aggressiv, nicht devot – auf Augenhöhe
- Bezug auf konkretes lokales Problem
- Kein politisches Bullshit-Bingo

### Zielgruppenspezifische Argumentation
| Ebene | Fokus |
|-------|-------|
| Kommunal | Konkreter Missstand, Bitte um direkte Maßnahme |
| Land | Zuständigkeitsrahmen, Fördermittel, Zuständigkeit |
| Bund | Gesetzgebung, Bundesmittel, übergeordnete Verantwortung |
| EU | Richtlinien, Förderprogramme, europäische Vergleiche |

---

## Datenstrategie – Politikerzuordnung

### PLZ → Wahlkreis → Politiker
- Bundestagswahlkreise: 299 Wahlkreise, gut dokumentiert
- PLZ-zu-Wahlkreis-Mapping: existiert als offene Datei (z.B. vom Bundeswahlleiter)
- Daten ändern sich nur nach Bundestagswahl (alle 4 Jahre)

### Datenquellen-Priorität
1. **Abgeordnetenwatch API** – sehr gut strukturiert, inkl. Kontaktdaten
2. **Bundestag Open Data** – offiziell, aber weniger komfortabel
3. **EU-Parlament API** – für MEPs nach Region
4. **Landesparlamenten** – heterogen, ggf. manuell kuratieren oder scrapen

### Update-Strategie
- Nach jeder Wahl: Daten einmalig aktualisieren
- Kein Echtzeit-Crawling nötig für v1
- Datenbank mit Politikern + Wahlkreisen + Adressen lokal halten

---

## Offene Fragen

### Produkt
- [ ] Wie geht man mit Themen um, die mehrere Ebenen betreffen? Mehrere Briefe generieren oder einen generalistischen?
- [ ] Soll der Nutzer den Namen im Brief selbst eintragen, oder gibt es ein Konto?
- [ ] Braucht es eine Vorschau, wie der Brief handschriftlich aussieht (Schriftart-Simulation)?
- [ ] Wie verhindert man Missbrauch (Hassbriefe, Spam an Politiker)?
- [ ] **Brüssel als Zielort**: Briefe auch ans EU-Parlament adressieren können – offene Frage: werden handschriftliche Briefe dort ähnlich aufmerksam gelesen wie im Bundestag? Recherche nötig (EU-Abgeordnetenbüros, Petitionsausschuss). Ggf. anderer Kanal effektiver (z.B. EU-Petitionsplattform als Ergänzung)?
- [ ] **Scheiterns-Kontext anzeigen**: Dem Nutzer erklären, *warum* sein Anliegen aktuell politisch scheitert oder stockt – z.B. welches Gesetz es blockiert, welche Partei dagegen ist, welcher Ausschuss zuständig ist. Gibt dem Brief mehr Substanz und dem Nutzer Verständnis. Umsetzung: KI-Recherche zum Thema vor Briefgenerierung, ggf. mit aktuellen Nachrichten/Parlamentsdaten anreichern.
- [ ] **Spendenaufruf / Finanzierung**: Nach Briefgenerierung dezenten Spendenaufruf einblenden, um den Betrieb der Seite zu finanzieren. Mögliche Umsetzung: "Dieser Brief war kostenlos – hilf uns, das so zu halten" mit Spenden-Button (z.B. Stripe, PayPal, Ko-fi). Alternativ: monatliche Supporter-Mitgliedschaft. Passt gut zur gemeinnützigen Struktur.

### Business
- [ ] Monetarisierung: Freemium? (1 Brief gratis, dann Abo?) Oder komplett kostenlos mit Spenden/Förderung?
- [ ] Zielgruppe primär: ältere Nutzer (Rentner, die handschreiben wollen) oder auch jüngere?
- [ ] Gemeinnützige Struktur vs. klassisches SaaS?
- [ ] Auto-Pen-Partner in DE/EU identifizieren (z.B. Handwrytten, Bond, oder DE-Anbieter)

### Technisch
- [ ] **Speech-to-Text als primärer Eingabekanal**: Nutzer schildert sein Anliegen per Sprache direkt im Browser (Web Speech API oder Whisper). Senkt die Hürde massiv – man muss nichts tippen, sondern redet einfach drauflos. Umsetzung v1: Browser-native Web Speech API (kostenlos, kein Backend nötig). Umsetzung v2: Whisper/Deepgram für bessere Qualität bei Dialekten und Hintergrundgeräuschen.
- [ ] Briefgenerierung: GPT-4 / Claude mit System-Prompt-Engineering oder Fine-Tuning?
- [ ] Hosting: wo sollen Nutzerdaten (PLZ, Thema) liegen? DSGVO beachten!
- [ ] Minimale Datenspeicherung – kein Account nötig für v1?

---

## Wettbewerb & Einordnung

| Produkt | Ansatz | Unterschied zu Brief nach Berlin |
|---------|--------|----------------------------------|
| Abgeordnetenwatch | Öffentliche Fragenplattform | Digital, keine Briefe, kein KI-Drafting |
| WeAct / Change.org | Petitionen | Massenformat, wenig Wirkung |
| OpenPetition | Petitionen DE | Gleich wie oben |
| **Brief nach Berlin** | Persönlicher Brief, handschriftlich | Höchste Wirkung, niedrigste Hürde |

---

## Inspiration & Referenzen

- Bundestag-Praktikum: handschriftliche Briefe werden tatsächlich gelesen und intern diskutiert
- Politikwissenschaftlicher Hintergrund: Responsivität von Abgeordneten auf direkte Bürgeranfragen
- Auto-Pen-Technologie: bereits kommerziell verfügbar (USA: Bond, Handwrytten etc.)

---

## Namensdiskussion

**Brief nach Berlin** – funktioniert als Konzeptname, aber:
- Briefe gehen nicht nur nach Berlin (auch Kommunal, Landesebene)
- Mögliche Alternativen: *Dein Brief*, *Brief an die Politik*, *Stift & Stimme*
- Vorerst: Brief nach Berlin als Arbeitstitel, weil es eingängig ist

---

*Letzte Aktualisierung: 2026-02-23 — Rohfassung, work in progress*
