---
quick_id: 261010-rhx
mode: quick
source: approved plan mode plan (2026-10-10)
---

# Kampagnen-Pills erklären, Notizzettel ausblenden, Pills mobil zeigen

## Context
Die Kampagnen-Pills im Hero stehen ohne Erklärung da und wirken wie „Partner“-Logos, nicht wie ein zweiter Einstieg. Auf dem Handy sind sie gar nicht sichtbar. Der gelbe NGO-Notizzettel soll verschwinden, der Code bleibt aber für später erhalten.
Ziel: Desktop bekommt eine „oder“-Trennlinie, mobil eine wischbare Pill-Reihe zwischen Presse und Bewertungen, und die Bewertungs-Marquee wird mobil kompakter.

Arbeitsweg: `/gsd-quick` (Repo-Pflicht), Frontend-Änderungen laufen über `/frontend-design` (Memory-Regel).

## Änderungen

1. **Notizzettel ausblenden**: [Hero.tsx](web/src/components/Hero.tsx)
   - Oben in der Datei `const SHOW_NGO_BADGE = false;` anlegen und beide Stellen davon abhängig machen (Desktop beim h1, Mobil oben rechts): `locale === "de" && SHOW_NGO_BADGE && …`.
   - `NgoCampaignBadge` bleibt unverändert in der Datei.

2. **„oder“-Trennlinie (Desktop/Tablet)**: [Hero.tsx](web/src/components/Hero.tsx), direkt über `<HeroCampaignPills>` im `showCampaigns`-Block
   - Darstellung: `── oder wähle ein fertiges Anliegen ──`. Linie links und rechts `h-px flex-1 bg-waldgruen/15`, Text `font-typewriter text-xs tracking-widest uppercase text-warmgrau/60`, das Ganze `max-w-md mx-auto`.
   - Divider und Pills in einen gemeinsamen Wrapper mit `hidden md:block mt-8`, damit die Abstände gleich bleiben.

3. **Wischbare Reihe**: [HeroCampaignPills.tsx](web/src/components/campaigns/HeroCampaignPills.tsx)
   - Neuer Prop `layout?: "wrap" | "scroll"`, Standard `"wrap"` (Desktop bleibt wie heute).
   - `scroll` bedeutet: `ul` mit `flex-nowrap overflow-x-auto snap-x snap-mandatory px-6`, Scrollbar ausgeblendet (`scrollbar-width:none` plus webkit) und `li` mit `snap-start shrink-0`. Rechts ein Creme-Fade nach dem Muster der `press-marquee-shell`-Fades, als Hinweis, dass man wischen kann.
   - Pill-Markup und `CampaignLogo` bleiben gleich.

4. **Mobile Platzierung**: [page.tsx](web/src/app/page.tsx), in der Press/Review-Section nach `<PressMarquee />` und vor dem Zähler „Schon X Briefe“
   - Nur wenn `landingCampaigns.length > 0`, Wrapper `md:hidden mt-2`.
   - Titel im Stil der Press-Zeile („auch bekannt aus:“): `font-typewriter text-xs tracking-widest uppercase text-warmgrau/50`, Text **„Laufende Briefkampagnen:“**.
   - `<HeroCampaignPills campaigns={landingCampaigns} layout="scroll" />`. Die Komponente hat kein `"use client"`, funktioniert also auch in der Server-Page.

5. **Bewertungen mobil kleiner**: [ReviewCard.tsx](web/src/components/reviews/ReviewCard.tsx) + [ReviewMarquee.tsx](web/src/components/reviews/ReviewMarquee.tsx)
   - `ReviewCard` bekommt den Prop `compact?: boolean`. Wenn er gesetzt ist und die Karte zugeklappt ist: `w-[250px] p-4 line-clamp-3`, ab `md:` wieder `w-[300px] p-5 line-clamp-4`.
   - `ReviewMarquee` übergibt `compact={variant === "compact"}` und nutzt bei compact `py-4 md:py-6`.
   - Nur die Landing nutzt `variant="compact"`, `/stimmen` (`full`) bleibt unverändert.

## Bewusst nicht
- Kein Limit über 3 (bleibt in `repository.ts:493` und im `slice(0, 3)`).
- Kein neuer NGO-Einstieg als Ersatz für den Zettel. Das kommt als Hinweis im Abschluss, nicht als Änderung.

## Verifikation
1. `npx tsc --noEmit` und `npm run lint` in `web/`.
2. Dev-Server per `preview_start`. Desktop-Screenshot: Trennlinie über den Pills, kein Zettel, Presse-Logos auf Laptop-Höhe wie bisher.
3. `resize_window` auf mobile (375): kein Zettel oben rechts, Reihenfolge Presse → „Laufende Briefkampagnen:“ → wischbare Pills → Zähler → kleinere Bewertungen. Wischen per Scroll testen, Tap auf eine Pill öffnet `/kampagne/[slug]`.
4. `/stimmen` gegenprüfen: Bewertungskarten unverändert groß.
5. Screenshots (Desktop + Mobil) an Thomas, danach Commit auf `main` (Push nur auf Ansage).
