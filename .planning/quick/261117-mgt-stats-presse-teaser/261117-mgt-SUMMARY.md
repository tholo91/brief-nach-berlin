---
status: complete
date: 2026-11-17
---
# 261117-mgt: /stats für Presse

- /stats hat Header + Footer (`app/stats/layout.tsx`), doppelter Airmail-Streifen entfernt.
- Login-Seite: Info-Box, 3 offene Teaser (Briefe, Versandanteil, Top-3-Themen), 24 h gecacht (`lib/internalStats/publicTeaser.ts`).
- "Zugang anfragen": `PressContactButton` mit vorausgefülltem Betreff/Text; Thomas antwortet mit `/stats/unlock?pw=…`.
- Dashboard: SectionNav klebt unter dem AppHeader.
- /presse: Link "Aktuelle Zahlen zu Briefen und Themen" in der Pressekontakt-Box.
- Checks: jest 187/187 grün, tsc ok, Preview desktop + 375 px geprüft. Nicht deployt.
