---
status: complete
---
# /ngo-briefkampagne: alle laufenden Kampagnen, zweispaltige Liste

- `getRunningCampaigns(limit = 24)` in `repository.ts` (gleicher Filter wie `getRecentActiveCampaigns`, Cap 24). `getRecentActiveCampaigns` unverändert.
- `CampaignList` mit `columns?: 1 | 2`: bei 2 `sm:grid-cols-2`, Titel `line-clamp-2` statt `truncate`, kein „Öffnen“-Label. Default unverändert für Kampagnen-, Ende- und NotFound-Seiten.
- NGO-Seite zeigt alle laufenden Kampagnen (lokal 10) plus Zeile „10 Kampagnen · 1.732 Briefe“ neben „Aktuell aktiv“.
- Abweichung vom Plan: Section bleibt `max-w-3xl` (bündig mit Hero), zwei Spalten à 380px reichen.
- Checks: jest campaignList/campaignPage/landingPageContent 21/21, eslint ok, tsc ohne Fehler in berührten Dateien, lokal gerendert desktop (2 Spalten) + 375px (1 Spalte, kein horizontales Scrollen).
- Nicht committet.

## Runde 2
- Bild `img-ngo-briefkampagne.webp` als flacher Streifen (16:6, object-cover) zwischen Kampagnenliste und Erklärblock.
- Überschriften: „So startet ihr eine Kampagne“, „An wen sich eure Kampagne richten kann“.
- Schluss-CTA gekürzt („Erst mal klein testen?“), Sekundärbutton „Thomas schreiben“ (mailto `FOUNDER_EMAIL`, Betreff „Frage zur Briefkampagne“).
- eslint ok, landingPageContent 5/5, lokal gerendert.

## Runde 3
- Hero: neuer Untertext (Argumente, Publikum, MdBs/Landesregierung/Adresse eurer Wahl), rechts daneben Creator-Icon + „Kampagne anfragen“; „Laufende Kampagnen ansehen“ und `ArrowDownIcon` entfernt.
- „Kampagne starten“ auf der Seite zu „Kampagne anfragen“ (Header global unverändert).
- Schlusskasten: „Noch Fragen vor dem Start?“ + neue Copy.
- „Mehr dazu“ ab `md` zweispaltig.
- Copy sagt bewusst „Landesregierung“ statt „Landtagsabgeordnete“: Kampagnenziel „Land“ geht institutionell an Landesregierung/Senat (CreatorCampaignForm.tsx:110-112).
- eslint ok, landingPageContent 5/5, lokal desktop + 375px gerendert.
