---
quick_id: 261009-kn2
status: complete
commit: fc1f971
---

# 261009-kn2: Kampagne verwalten Navbar, Kontakt, Zahlen-Refresh

## Ergebnis
- Sprunglinks Teilen / Zahlen / Feedback / Bearbeiten: ab md in der AppHeader-Zeile (Portal in `data-app-header-center`), mobil als zweite Sticky-Zeile. Spenden entfernt.
- Kontakt-Button sekundär oben rechts (`data-app-header-actions`), mailto `BRIEF_EMAIL` mit Betreff `Kampagne <slug>` via neuem `campaignContactHref` (auch in CampaignManager genutzt).
- Briefzahl: "Briefe nach Berlin geschrieben"; `CreatorStatsRefresh` (router.refresh in Transition, 60 s Client-Sperre, "vor X Min. aktualisiert"), bei beendeten Kampagnen ausgeblendet.
- Feedback-Block mit Anker `creator-feedback`.

## Verifikation
- Jest komplett: 107 Suites / 899 Tests grün; eslint auf geänderten Dateien sauber; tsc ohne Fehler in geänderten Dateien (Rest-Fehler stammen aus iCloud-Duplikaten "* 2.ts").
- Browser (localhost:3000, temporäre Dev-Vorschau mit Fixture-Kampagne, danach zurückgebaut): Desktop eine Zeile, 375px zwei Zeilen ohne horizontales Scrollen, Header-Höhe unverändert 57px, Feedback/Zahlen/Bearbeiten springen korrekt (Bearbeiten öffnet details), Refresh nach 60 s aktiv und danach wieder gesperrt, keine Console-Fehler.

## Offen
- Nicht mit echter Verwaltungs-Session getestet; nicht deployed (main vor origin/main).
