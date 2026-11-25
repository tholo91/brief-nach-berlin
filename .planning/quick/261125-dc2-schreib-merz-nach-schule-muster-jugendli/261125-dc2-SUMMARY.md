---
quick_id: 261125-dc2
status: complete
---

# /schreib-merz nach /schule-Muster

- Hero "Merz, wir müssen reden." (Handschrift), Fakten "Kostenlos / Ohne Account / In 2 Minuten", Merz-Bild klein als Foto rechts.
- Neues Formular `SchreibMerzForm` im /schule-Stil: Themen-Chips mit Emoji und jugendlichen Titeln, Feld "Was erlebst du selbst?", Spracheingabe, Button "Brief entwerfen". Handoff an den Wizard unverändert (campaign). `SchreibMerzExperienceV2` entfernt.
- So geht's, Warum ein Brief?, FAQ (mit Hinweis "unabhängige Aktion").
- Analytics behält utm_source/utm_medium/utm_campaign, für QR-Sticker (`?utm_source=sticker`).
- Checks: tsc (src) sauber, eslint sauber, jest schreibMerz 28/28, Browser mobil + Desktop, Klick führt in den Wizard mit Kampagnen-Banner.
- Nicht geprüft: Dark Mode sichtbar unterscheidbar, Produktion.
