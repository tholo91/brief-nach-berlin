# Luftpostgruß von Brief-nach-Berlin — Entwurf v1

Erstellt am 4. Oktober 2026 mit dem eingebauten imagegen-Tool. Lokaler Entwurf, nicht hochgeladen oder bestellt.

## Dateien

- `cover-din-c6.jpg`: Bildseite / Seite 2, 1914 × 1346 Pixel, 300-dpi-Metadaten, deckend, sRGB. DIN C6: 162 × 114 mm.
- `briefmarkenmotiv.jpg`: separate Motivdatei für die echte Marke, 1500 × 900 Pixel. 5:3 ist ein Arbeitsformat, keine bestätigte Motivfläche des Shops.
- `cover-layout.svg` und `briefmarken-layout.svg`: eigenständige bearbeitbare Layoutquellen mit eingebetteten Illustrationen und echten Textobjekten. Schrift: Courier New; bei anderen Systemen Schriftverfügbarkeit prüfen.
- `vorschau.jpg`: beide Entwürfe nebeneinander, kein Uploadmotiv.
- `druckprobe.html`: bei 100 % ohne Seitenanpassung drucken. Cover 162 × 114 mm; Briefmarkenmotiv beispielhaft 40 × 24 mm. Die Probe ersetzt nicht die Shop-Druckvorschau.

## Drucklücken und Gestaltung

Der Hintergrund besitzt nativ 1495 × 1052 Pixel, also rund 234 dpi bei DIN C6. Er wurde für den JPEG-Export auf 1914 × 1346 Pixel vergrößert. Die 300-dpi-Metadaten erzeugen keine neuen Illustrationsdetails. Schrift und Ziermarkenrahmen werden aus SVG in der Exportauflösung gerendert. Das 300-dpi-Ziel für die Coverillustration ist damit noch nicht erreicht.

Das Markenbild besitzt nativ 1619 × 971 Pixel und ausreichend Reserve für die beispielhafte kleine Größenprobe. Beschriftungen liegen innerhalb der Arbeitsfläche; der tatsächliche Shop-Ausschnitt bleibt zu prüfen. Beide Upload-JPEGs liegen unter 5 MB. Ein 5-mm-Sicherheitsabstand ist eine Entwurfsentscheidung, keine bestätigte Vorgabe der Post. Der Luftpostrand wurde vom Bildmodell schmaler als die geplanten circa 5 mm gezeichnet; das Cover bewahrt diese ruhigere Version. Die Skyline ist illustrativ und räumlich verdichtet, keine geografisch genaue Ansicht Berlins.

Die Ziermarke liegt ausschließlich auf der Bildseite. Sie trägt „Ziermarke“, keinen Portowert, Matrixcode, Postnamen oder Postlogo. Das Markenmotiv für die echte Frankierung enthält nur Illustration und Projektname. Offizielle Bestandteile ergänzt der Shop. Keine rechtliche Freigabe und keine bestätigte Annahme durch die Post. Beschnitt, Motivfläche und PDF-Druckvorschau vor einer Bestellung prüfen. Upload und Bestellung benötigen separate Freigabe.

Quellen, geprüft am 4. Oktober 2026: [DIN-C6-Maße](https://www.deutschepost.de/de/brief_postkarte/beispiele-tipps.html), [Konfigurator](https://shop.deutschepost.de/shop/individuell/bmi.jsp?productType=type3) (Uploadanzeige: maximal 5 MB), [Post-AGB](https://shop.deutschepost.de/agb), insbesondere Abschnitt II.6 und II.7.

## Bearbeiten und exportieren

SVG in einem Vektoreditor öffnen; Gruß, Namen und Markenbeschriftungen sind Textobjekte. Nach direkten Änderungen an den SVG-Dateien mit `--render-only` exportieren. Ohne dieses Argument erzeugt das Skript die ursprünglichen Layouts neu.

```sh
node design/postkarten/luftpost-v1/export.mjs --render-only
```

Das Skript nutzt das vorhandene `web/node_modules/sharp`. Alternativ `POSTCARD_SHARP_MODULE` auf eine vorhandene Sharp-Installation setzen. Es werden keine Pakete installiert. Die native Bilddatei `web/public/images/email-followup-envelope.png` bleibt unverändert.

Die Generierungsbriefings stehen in `prompts.md`.
