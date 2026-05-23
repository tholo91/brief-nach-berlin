---
quick_id: 260523-pph
slug: stimmen-sign-off-copy-brief-verbessern-m
description: /stimmen sign-off copy tweaks + /brief-verbessern mobile copy button + bold prompt anchors
date: 2026-05-23
status: complete
tasks_total: 3
tasks_completed: 3
commits:
  - a645501
  - 7dfeb60
  - ff75d77
---

# /stimmen copy + /brief-verbessern mobile fix + bold anchors

Three atomic commits, two files, inline orchestrator.

## Was wurde gemacht

### 1. /stimmen sign-off, warmer (`a645501`)

- Button-Label: `Schreib mir` → `Melde dich gerne bei mir`
- Signatur: `Thomas, Bremen` → `Thomas aus Bremen`

Klingt einladender und persönlicher, ändert sonst nichts an der Struktur des consolidated end-blocks.

### 2. Copy-Button auf Mobile sichtbar (`7dfeb60`)

Vorher: `opacity-0 group-hover:opacity-100` - auf Touch-Geräten gibt es kein Hover, also war der Button unsichtbar. Auf Mobile war "Prompt kopieren" damit faktisch nicht zugänglich.

Nachher: `opacity-100 md:opacity-0 md:group-hover:opacity-100`. Auf Mobile immer sichtbar, auf Desktop bleibt der eleganten hover-reveal-Aesthetic erhalten. Plus `bg-white/80 md:bg-transparent` als dezenter Mobile-Background, damit der Button vor dem darunterliegenden Prompt-Text lesbar bleibt.

### 3. Bold Prompt-Anker (`ff75d77`)

`PromptCopyBlock` bekommt ein optionales `boldLines?: string[]` Prop. Beim Rendering wird der Text auf Zeilen aufgesplittet; Zeilen die exakt einem Eintrag aus `boldLines` matchen werden mit `<strong className="font-bold text-waldgruen-dark">` umschlossen. Das `text`-Prop bleibt die Source of Truth für die Zwischenablage, also paste output bleibt plain text.

In `/brief-verbessern` wird `boldLines` jetzt mit den zwei Anker-Zeilen aufgerufen:
- "Das möchte ich am Brief ändern oder ergänzen:"
- "Hier ist der Entwurf, den du überarbeiten sollst:"

Beide springen visuell raus, helfen dem Leser direkt zu sehen wo die Anmerkungen und der Brief-Entwurf rein müssen. Beim Kopieren landet aber 1:1 das ursprüngliche Plain-Text-Prompt in der Zwischenablage.

## Verifikation

- `npx tsc --noEmit` → exit 0
- `grep -n "—" web/src/components/PromptCopyBlock.tsx web/src/app/\(site\)/stimmen/page.tsx web/src/app/\(site\)/brief-verbessern/page.tsx` → empty
- Drei separate atomic commits, jeder logisch klar abgegrenzt.

## Inline rationale

Drei Edits über zwei Files, alle <20 Lines. Subagent-Setup wäre 10× zu schwer.
