---
quick_id: 261010-rhx
status: complete
commit: 8399f29
---

# Summary: Landing-Kampagnen-Pills erklärt, mobil sichtbar, Notizzettel geparkt

- Hero.tsx: `SHOW_NGO_BADGE = false` blendet den NGO-Notizzettel (Desktop + Mobil) aus, Komponente bleibt.
- Hero.tsx: Trennlinie "oder wähle ein fertiges Anliegen" (font-typewriter, Kleinschreibung) über den Pills ab md.
- HeroCampaignPills: neuer Prop `layout="scroll"` (einzeilig, wischbar, Snap, Creme-Fade rechts).
- Neue MobileCampaignStrip (client, nur locale de, md:hidden): Titel "Laufende Briefkampagnen:" zwischen PressMarquee und Briefzähler.
- ReviewCard `compact` (über ReviewMarquee variant="compact"): mobil 250px, p-4, line-clamp-3; ab md unverändert. /stimmen unberührt.
- Abweichung vom Plan: Mobiler Block als eigene Client-Komponente statt inline in page.tsx, weil die Sprache erst im Browser feststeht.

Verifiziert: eslint sauber, tsc ohne src-Fehler, Preview Desktop 1440 + Mobil 375 (Wischen bis Ende, Karten 250px), /stimmen 300px, keine Konsolenfehler.
