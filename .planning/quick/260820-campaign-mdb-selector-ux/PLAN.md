# Auswahl-UX für Kampagnen-MdBs

## Ziel

Eine Kampagne hat nur Bundestag oder Landesregierung als Hauptziel. Bei Bundestag ist eine konkrete MdB-Liste ein freiwilliger Opt-in.

## Umsetzung

- Creator und Verwaltung zeigen für Bundestagskampagnen den Schalter „An eine Auswahl von Abgeordneten richten“.
- Ohne aktiven Schalter wird eine leere ID-Liste gespeichert und die Kampagne bleibt PLZ-basiert.
- Die MdB-Suche erhält mehrfach kombinierbare Parteien-Chips. Textsuche und aktive Parteien wirken zusammen.
- Bei aktivem Such- oder Parteienfilter erscheinen Trefferzahl sowie „Alle gefilterten auswählen“ oder „Gefilterte Auswahl entfernen“.
- Die Trefferliste kann vertikal scrollen, aber nie horizontal. Partei, Wahlkreis und Ausschüsse umbrechen vollständig; Informationen werden nicht abgeschnitten.
- Die Verwaltungsansicht speichert dieselbe Auswahl nachträglich als neue Kampagnenrevision.

## Abnahme

- CDU/CSU und AfD gleichzeitig filtern liefert die Vereinigungsmenge beider Parteien.
- „Alle gefilterten auswählen“ ergänzt nur die aktuellen Filtertreffer.
- Lange Ausschussnamen sind vollständig lesbar.
- Umschalten auf den normalen Bundestagsmodus leert die gespeicherte Auswahl erst beim Speichern.
