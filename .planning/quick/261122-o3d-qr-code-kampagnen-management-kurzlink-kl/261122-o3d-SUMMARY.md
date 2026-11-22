---
status: complete
---
# QR-Code Kampagnen-Management (261122-o3d)

- Encoder: Versionen 3 bis 6 (29 bis 41 Module) ergänzt, Version 10/12/14 unverändert. Modulmuster gegen Python `qrcode` (Q, Maske 0) per Hash geprüft.
- QR nutzt den Kurzlink `www.briefnachberlin.de/<slugohnebindestriche>` (aktive Kampagnen), sonst die lange Kampagnen-URL. Der Redirect gilt auch nach Kampagnenende (Status bleibt `active`), pausierte Kampagnen lösen den Kurzlink jetzt ebenfalls auf.
- Logofeld: eckig, weiß, ganze Module (ungerade), 1 Modul Rahmen ums Logo, 7 bis 9 % der Module. Mit CoreImage-Scanner geprüft, auch im Worst Case (alle Module im Feld falsch).
- Vorschau: 128/160 px, ohne runde Ecken.
