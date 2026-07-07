# Quick Task 260707-vrt: No-Storage-Flow zum Anpassen bestehender Briefentwuerfe - Context

**Gathered:** 2026-07-07
**Status:** Ready for planning

<domain>
## Task Boundary

Nutzer koennen einen bestehenden Briefentwurf aus der E-Mail auf `/brief/anpassen`
einfuegen und eine umformulierte Variante per E-Mail erhalten. Der Flow speichert
keine Brieftexte, uebergibt keine Brieftexte per URL, erhoeht keinen oeffentlichen
Counter und nutzt in Brevo den Tag `brief_variant`.

</domain>

<decisions>
## Implementation Decisions

### CTA-Link
- Der Mail-CTA nutzt einen absoluten Link zu `/brief/anpassen#email=<encoded-email>`.
- Es wird nur die E-Mail-Adresse uebergeben, kein Brieftext.

### Eingefuegter Brieftext
- Nutzer sollen den ganzen Brieftext aus der Mail einfuegen, inklusive MdB/Anrede,
  aber ohne neue MdB-Auswahl. Die bestehende Anschrift bleibt in der urspruenglichen
  Mail verfuegbar.

### Tonalitaet
- Die vorhandene 1-5-Tonalitaet wird wiederverwendet. Die UI bleibt simpel.

### Validierung und Versand
- Mindestlaenge fuer eingefuegten Brieftext: 500 Zeichen.
- Success-Route: `/brief/anpassen/erfolg`.
- Brevo-Tag: `brief_variant`.

</decisions>

<specifics>
## Specific Ideas

- E-Mail-Input-Placeholder: `deine@email.de`, falls der Hash nicht greift.
- CTA-Copy in der fertigen Brief-Mail:
  - "Nicht ganz dein Ton?"
  - "Du kannst den Entwurf schnell anpassen."
  - "Brief anpassen"

</specifics>

<canonical_refs>
## Canonical References

- User Story und Akzeptanzkriterien aus dem Chat vom 2026-07-07.

</canonical_refs>
