---
quick_id: 261008-mdu
status: complete
---

# SEO: /petition-starten + /kampagne-starten

- New: web/src/app/(site)/petition-starten/page.tsx (6 FAQs, FAQPage + Article JSON-LD, 5 related links, CTA /app + /kampagne/starten)
- Updated: /kampagne-starten (title/description, MODIFIED, funding = kostenlos + spendenfinanziert via WE AID gGmbH, new H2 on combining petition + Briefkampagne, links to /petition-starten, /brief-oder-petition, /ngo-briefkampagne, /spenden)
- Sitemap: /petition-starten (0.9), /kampagne-starten (0.8)
- Incoming links: /brief-oder-petition, /andere-tools
- Facts: Bundestag Jahresbericht 2024 (Drs. 21/1900): 9.260 Petitionen, 413 öffentlich, 607 einzeln beraten; Quorum 30.000 in 6 Wochen seit 1.7.2024 (vorher 50.000 / 4 Wochen)
- Checks: eslint ok, tsc ok (pre-existing errors in campaignTopicReset.test.ts only), build ok, jest 582/584 (2 pre-existing failures: supportContent, letterSignalActions)
- Not committed (awaiting Thomas)
- Follow-up: 5 existing webp Figures added (petition-starten: letterbox-berlin, img-vier-ebenen, img-drei-briefe; kampagne-starten: img-campaign-crowd-ghibli, img-kiez)
- Follow-up: campaign examples per Thomas (2026-10-08): EEG so nicht! (Klartext mit Lilly) ~1.000 Briefe in 2 Tagen; AfD vor Gericht ~500 Briefe. Numbers from Thomas, not DB-verified (secret guard blocks .env.local)
