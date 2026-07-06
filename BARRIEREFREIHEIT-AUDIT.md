# Barrierefreiheit: Lernnotiz und erster App-Audit

Stand: 2026-07-06

## 1. Kurzfazit

Ziel fuer Brief nach Berlin sollte pragmatisch **WCAG 2.2 Level AA** sein.

Warum:

- WCAG ist der internationale Standard fuer barrierefreie Webinhalte.
- WCAG 2.2 ist die aktuelle W3C-Empfehlung und baut auf 2.0/2.1 auf.
- Level AA ist der realistische Produktstandard: deutlich besser als Mindestniveau A, aber nicht so aufwendig wie AAA.
- In Deutschland/EU ist Barrierefreiheit auch rechtlich relevant, vor allem ueber BITV/BFSG/European Accessibility Act. Kleinstunternehmen koennen je nach Fall ausgenommen sein, aber das ist keine Produktstrategie. Barrierefreiheit hilft genau unserer Zielgruppe: Menschen, die schnell, sicher und ohne Friktion politisch handlungsfaehig werden wollen.

Quellen:

- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
- W3C Easy Checks: https://www.w3.org/WAI/test-evaluate/preliminary/
- W3C ARIA Practices: https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/
- WebAIM WCAG Checklist: https://webaim.org/standards/wcag/checklist
- MDN Accessibility: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/What_is_accessibility
- Bundesfachstelle BFSG: https://www.bundesfachstelle-barrierefreiheit.de/DE/Barrierefreiheitsstaerkungsgesetz/barrierefreiheitsstaerkungsgesetz_node.html

## 2. Was eine barrierefreie Website ausmacht

WCAG sortiert Barrierefreiheit in vier Prinzipien:

1. **Wahrnehmbar**
   - Inhalte sind nicht nur visuell verstaendlich.
   - Bilder haben sinnvolle Alt-Texte oder leere Alt-Texte, wenn sie dekorativ sind.
   - Text hat genug Kontrast.
   - Inhalte funktionieren bei Zoom, kleinen Screens und ohne perfekte Sehkraft.
   - Video/Audio hat Alternativen, wenn es relevante Information transportiert.

2. **Bedienbar**
   - Alles funktioniert mit Tastatur.
   - Fokus ist sichtbar und logisch.
   - Kein Nutzer bleibt in Menues, Modals oder Widgets gefangen.
   - Touch-Ziele sind gross genug.
   - Animationen respektieren `prefers-reduced-motion`.

3. **Verstaendlich**
   - Sprache der Seite ist gesetzt.
   - Formulare haben Labels, Hinweise und klare Fehlermeldungen.
   - Navigation und Begriffe bleiben konsistent.
   - Keine unerwarteten Kontextwechsel nur durch Fokus oder Eingabe.

4. **Robust**
   - HTML ist semantisch korrekt.
   - Interaktive Elemente haben Name, Rolle und Zustand.
   - Statusmeldungen werden fuer Screenreader angekuendigt.
   - ARIA wird sparsam genutzt: natives HTML zuerst, ARIA nur wenn noetig.

## 3. Marker, die wir in Reviews pruefen

### 3.1 Basis

- Jede Seite hat genau einen sinnvollen Seitentitel.
- `<html lang="de">` ist gesetzt.
- Hauptbereich ist als `<main>` vorhanden.
- Es gibt einen sichtbaren Skip-Link beim ersten Tab.
- Ueberschriften folgen einer sinnvollen Hierarchie.
- Links sind als Links erkennbar und sagen aus dem Kontext heraus, wohin sie fuehren.

### 3.2 Bilder und Medien

- Dekorative Bilder: `alt=""` und nicht fokussierbar.
- Inhaltliche Bilder: kurzer, zweckbezogener Alt-Text.
- Hintergrundvideos transportieren keine notwendige Information.
- Autoplay-Animationen sind stumm, stoppbar oder bei reduzierter Bewegung deaktiviert.

### 3.3 Tastatur und Fokus

- Tab-Reihenfolge entspricht der visuellen Reihenfolge.
- Aktiver Fokus ist sichtbar.
- Mobile Menues, Dialoge und Overlays schliessen per Escape.
- Wenn ein Overlay offen ist, landet Fokus darin und kehrt beim Schliessen sinnvoll zur ausloesenden Kontrolle zurueck.
- Kein verstecktes interaktives Element bleibt fokussierbar.

### 3.4 Formulare

- Jedes Eingabefeld hat ein echtes Label oder ein belastbares `aria-label`.
- Pflichtfelder sind im Label oder in Hilfetexten erkennbar.
- Fehler stehen direkt am Feld, sind per `aria-describedby` verbunden und werden per `role="alert"` oder Live Region angekuendigt.
- Disabled Buttons sind nicht die einzige Rueckmeldung; Nutzer verstehen, was fehlt.
- Statuswechsel wie "wird transkribiert", "Wahlkreis wird gesucht" oder "Brief wird formuliert" werden vorgelesen.

### 3.5 Farben, Kontrast, Groessen

- Normaler Text: mindestens 4.5:1 Kontrast.
- Grosse Schrift: mindestens 3:1.
- Icons, Fokusrahmen und UI-Grenzen: mindestens 3:1, wenn sie Bedeutung tragen.
- Touch-Ziele: mindestens 24x24 px nach WCAG 2.2, besser 44x44 px fuer mobile Bedienung.
- Keine Information nur ueber Farbe.

### 3.6 Dynamische UI

- Akkordeons nutzen native `<details>`/`<summary>` oder korrekte Button-ARIA.
- Segmentierte Auswahlgruppen haben semantischen Zustand, z.B. Radio-Group oder `aria-pressed`.
- Fortschritt im Wizard ist fuer Screenreader verstaendlich, nicht nur visuell.
- Lade- und Ergebniszustaende sind angekuendigt.
- Bewegte Marquees/Animationen lassen sich reduzieren oder pausieren.

## 4. Ist-Stand unserer App

### 4.1 Erfuellt oder solide geloest

- Sprache ist global gesetzt: `web/src/app/layout.tsx` setzt `<html lang="de">`.
- Landingpage nutzt einen echten `<main>`: `web/src/app/page.tsx`.
- Viele Controls sind echte `<button>`, `<a>` oder Next `<Link>` statt klickbarer Divs.
- Formulare im Wizard haben echte Labels und Feldfehler:
  - `web/src/components/wizard/Step1Form.tsx`
  - `web/src/components/wizard/Step1bOptional.tsx`
  - `web/src/components/campaigns/CampaignManager.tsx`
- Motion wird teilweise respektiert: `web/src/app/globals.css` enthaelt `prefers-reduced-motion` fuer zentrale Animationen.
- Dekorative Bilder sind teils korrekt mit leerem Alt-Text markiert, z.B. Envelope-Icon im Hero.
- FAQ nutzt native `<details>`/`<summary>`, also eine robuste Basis.
- Mobile Navigation hat `aria-expanded`, `aria-controls`, `aria-label` und Escape-Handling.

### 4.2 Wahrscheinliche Luecken

1. **Kein Skip-Link**
   - Befund: In `layout.tsx`, `Header.tsx` und App-Layouts ist kein "Zum Inhalt springen"-Link sichtbar.
   - Risiko: Tastaturnutzer muessen auf jeder Seite erst durch Navigation/Branding.
   - Prioritaet: Hoch.

2. **Mobiles Menue ohne Fokus-Management**
   - Befund: `Header.tsx` sperrt Body-Scroll und schliesst per Escape, setzt aber beim Oeffnen keinen Fokus ins Menue und stellt beim Schliessen keinen Fokus wieder her.
   - Risiko: Screenreader-/Tastaturnutzer koennen Orientierung verlieren.
   - Prioritaet: Hoch.

3. **Wizard-Schrittwechsel ohne Fokus-Reset**
   - Befund: `WizardShell.tsx` scrollt bei Schrittwechsel nach oben, setzt aber Fokus nicht auf die neue Schritt-Ueberschrift.
   - Risiko: Screenreader bekommen den Kontextwechsel nicht sauber mit.
   - Prioritaet: Hoch.

4. **Fortschrittsanzeige ist visuell, aber nicht semantisch**
   - Befund: Die Wizard-Dots sind `aria-hidden`, Labels erscheinen nur per Hover.
   - Risiko: Assistive Technologien erfahren nicht "Schritt 2 von 3".
   - Prioritaet: Mittel.

5. **Segmentierte Brieflangen-Auswahl ist semantisch ein Button-Set**
   - Befund: `Step1bOptional.tsx` nutzt drei Buttons fuer "1 Seite", "1,5 Seiten", "2 Seiten", aber ohne `aria-pressed`, Radio-Group oder verbundenes Label.
   - Risiko: Screenreader hoeren nicht eindeutig, welche Option aktuell gewaehlt ist.
   - Prioritaet: Mittel.

6. **Voice-/Transkriptionsstatus vermutlich nicht vollstaendig angekuendigt**
   - Befund: `VoiceRecorder.tsx` hat UI-Zustaende, aber nicht alle Statuswechsel sind zwingend in einer Live Region sichtbar, besonders auf der Landing mit `hideVoiceStatus`.
   - Risiko: Blinde Nutzer erfahren evtl. nicht, ob aufgenommen, verarbeitet oder ein Fehler passiert ist.
   - Prioritaet: Hoch, weil Voice ein zentraler Einstieg ist.

7. **Marquee-/Dauerbewegung braucht Pruefung**
   - Befund: `ReviewMarquee` und Press-/Review-Bewegungen sind interaktive bzw. bewegte Inhalte.
   - Risiko: WCAG verlangt bei relevanter Bewegung Kontrolle oder Respekt fuer reduzierte Bewegung.
   - Prioritaet: Mittel.

8. **Kontrast nur statisch plausibel, nicht gemessen**
   - Befund: Hauptfarben wirken wahrscheinlich okay, aber viele `text-warmgrau/50`, `text-warmgrau/40`, `text-waldgruen/60` Kombinationen koennen unter 4.5:1 fallen.
   - Risiko: Hilfetexte, Meta-Infos und Fehlerkontext koennen schwer lesbar sein.
   - Prioritaet: Mittel.

9. **Automatischer Fokus im Hero**
   - Befund: `Step2Issue` fokussiert auf Desktop automatisch das Anliegenfeld.
   - Risiko: Kann hilfreich sein, aber Screenreader-/Tastaturnutzer koennen dadurch am Seitenanfang Kontext verlieren.
   - Prioritaet: Niedrig bis Mittel; mit Screenreader pruefen.

10. **Rechtliche Barrierefreiheitserklaerung fehlt vermutlich**
    - Befund: Es gibt Datenschutz/Impressum, aber keine eigene Barrierefreiheitserklaerung.
    - Risiko: Rechtlich nicht zwingend klar fuer unser aktuelles Setup, aber als Civic-Tech-Projekt vertrauensbildend.
    - Prioritaet: Niedrig fuer MVP, sinnvoll vor groesserer Oeffentlichkeit.

## 5. Priorisierte To-dos

### P0: Schnell und wirksam

- [ ] Globalen Skip-Link einbauen: "Zum Inhalt springen".
- [ ] `main` global eindeutig fokussierbar machen oder pro Layout sauber markieren.
- [ ] Wizard-Schrittwechsel: Fokus auf die neue `h1` setzen.
- [ ] Mobile Navigation: Fokus beim Oeffnen auf ersten Menuepunkt oder Close/Button setzen; beim Schliessen zurueck zum Burger.
- [ ] VoiceRecorder: unsichtbare Live Region fuer Status "Mikrofon wird vorbereitet", "Aufnahme laeuft", "Transkribiere", "Fehler" ergaenzen.

### P1: Semantik und Bedienbarkeit schaerfen

- [ ] Wizard-Fortschritt als Text fuer Screenreader ergaenzen: "Schritt 2 von 3: Kontaktdaten".
- [ ] Brieflangen-Auswahl als Radio-Group bauen oder `aria-pressed` pro Button setzen.
- [ ] Kampagnen-/Wizard-Statusmeldungen in Live Regions pruefen.
- [ ] Marquees bei `prefers-reduced-motion: reduce` stoppen oder stark vereinfachen.
- [ ] Mobile Menue-Overlay: pruefen, ob fokussierbare Inhalte hinter dem Overlay per Tab erreichbar bleiben.

### P2: Qualitaet vor groesserem Launch

- [ ] Kontrast aller Text-/Background-Kombinationen messen.
- [ ] Alle Alt-Texte visuell pruefen: dekorativ vs. inhaltlich.
- [ ] Seitentitel aller Routen pruefen: eindeutig und vorne aussagekraeftig.
- [ ] Screenreader-Test mit VoiceOver Safari/Chrome fuer Landing, Wizard, Kampagnenseite.
- [ ] Tastatur-Test fuer alle Kernflows dokumentieren.
- [ ] Optional: `/barrierefreiheit` Seite mit ehrlicher Erklaerung, Kontaktweg und bekannten Einschraenkungen.

## 6. Minimaler Testplan

Vor jedem groesseren Release:

1. **Automatisch**
   - `npm run lint`
   - Build pruefen.
   - Optional: Playwright + axe-core fuer `/`, `/app`, `/kampagne/[slug]`, `/datenschutz`, `/impressum`.

2. **Tastatur**
   - Seite neu laden.
   - Nur Tab, Shift+Tab, Enter, Space, Escape nutzen.
   - Pruefen: Fokus sichtbar, Reihenfolge logisch, kein Trap, alle Aktionen erreichbar.

3. **Screenreader**
   - macOS VoiceOver: Safari oder Chrome.
   - Flow: Landing → Anliegen schreiben → Wizard → PLZ/E-Mail → optionale Infos → Abgeordnetenauswahl.
   - Pruefen: Ueberschriften, Labels, Fehlermeldungen, Statuswechsel, Button-Namen.

4. **Zoom und Layout**
   - Browser-Zoom 200%.
   - Mobile Breite ca. 360 px.
   - Pruefen: kein horizontaler Scroll, keine abgeschnittenen Labels, Buttons bleiben erreichbar.

5. **Motion**
   - Systemsetting "Bewegung reduzieren" aktivieren.
   - Pruefen: keine dauernde, stoerende Bewegung; Hero/Marquees beruhigen sich.

## 7. Shipping-Entscheidung

Das ist kein Grund, die Produktvalidierung zu stoppen.

Billigster sinnvoller Schritt:

- P0-Todos umsetzen.
- Danach mit einer echten Person testen, die nur Tastatur nutzt oder VoiceOver einschaltet.
- Dann weiter Nutzer gewinnen.

Barrierefreiheit ist hier kein Polish. Fuer Brief nach Berlin ist sie Produktkern: Wenn politische Teilhabe das Versprechen ist, darf die Bedienung nicht Menschen ausschliessen, die ohnehin schon haeufiger ausgeschlossen werden.
