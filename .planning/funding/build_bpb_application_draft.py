from io import BytesIO
from pathlib import Path

from pypdf import PdfReader, PdfWriter
from pypdf.generic import ArrayObject, NameObject
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


SOURCE = Path(__file__).parent / "official-templates" / "bpb-antragsformular-2027.pdf"
OUTPUT = Path(__file__).parents[2] / "output" / "pdf" / "bpb-antragsentwurf-2027.pdf"

VALUES = {
    "Text1": "Vom Anliegen zur eigenen Stimme: Ein niedrigschwelliger Brief-Pilot für politische Selbstwirksamkeit im Alltag",
    "Text18": (
        "Brief-nach-Berlin ist ein überparteiliches, niedrigschwelliges Bildungsangebot für "
        "alltagsbelastete Erwachsene und Menschen ohne bisherigen direkten Politikkontakt. "
        "Teilnehmende klären die politische Zuständigkeit ihres eigenen Anliegens, erstellen "
        "einen persönlichen Briefentwurf und prüfen, überarbeiten und versenden ihn selbst. "
        "Digitale Einzelnutzung, moderierte Briefwerkstätten und kurze Lernimpulse zu "
        "Repräsentation, Kontroversität und Responsivität werden verbunden. Der Pilot erprobt, "
        "ob dieser selbst ausgeführte erste Schritt politische Handlungsfähigkeit und "
        "Selbstwirksamkeit stärken kann. Brieftexte und politische Anliegen werden nicht für "
        "die Evaluation gespeichert."
    ),
    "Text19": (
        "Quantitativ: 1.200 begonnene und 700 fertiggestellte Entwürfe, 250 freiwillig "
        "bestätigte Versendungen, 100 vollständige Vorher-/Nachher-Datensätze, 6 bis 10 "
        "Briefwerkstätten und 2 bis 4 aktive Zielgruppenpartner. Qualitativ: Teilnehmende "
        "können Zuständigkeiten besser einordnen, ihre eigene Position verständlich formulieren "
        "und Möglichkeiten sowie Grenzen politischer Responsivität reflektieren. Ein öffentlicher "
        "Lernbericht dokumentiert Methode, Abbrüche, Nichtversand, Nichtantworten und "
        "Evaluationsgrenzen. Eine positive Wirkung wird nicht vorweggenommen."
    ),
    "Text20": "01.03.2027",
    "Text21": "01.03.2027 bis 31.12.2027",
}

# Rechtecke der fünf bereits fachlich geklärten Felder. Diese Werte werden gezielt
# statisch eingebettet; alle übrigen Formularfelder bleiben interaktiv ausfüllbar.
PLACEMENTS = {
    "Text1": (0, (139.0715, 623.0817, 536.3247, 660.3654), 8.0, 9.5),
    "Text18": (1, (71.4328, 423.1354, 527.0863, 585.1381), 8.0, 10.0),
    "Text19": (1, (71.4328, 237.7066, 526.7564, 408.2879), 8.0, 10.0),
    "Text20": (1, (71.1026, 180.6262, 526.7564, 213.2906), 9.0, 11.0),
    "Text21": (1, (70.7731, 132.7841, 527.0863, 165.4485), 9.0, 11.0),
}


def wrap_text(text: str, max_width: float, font: str, size: float) -> list[str]:
    lines: list[str] = []
    current = ""
    for word in text.split():
        candidate = f"{current} {word}".strip()
        if stringWidth(candidate, font, size) <= max_width:
            current = candidate
            continue
        if current:
            lines.append(current)
        current = word
    if current:
        lines.append(current)
    return lines


def build_overlay(reader: PdfReader) -> PdfReader:
    stream = BytesIO()
    pdf = canvas.Canvas(stream)
    for page_number, page in enumerate(reader.pages):
        width = float(page.mediabox.width)
        height = float(page.mediabox.height)
        pdf.setPageSize((width, height))
        for name, (target_page, rect, font_size, leading) in PLACEMENTS.items():
            if target_page != page_number:
                continue
            x1, y1, x2, y2 = rect
            padding = 4
            lines = wrap_text(VALUES[name], x2 - x1 - 2 * padding, "Helvetica", font_size)
            max_lines = max(1, int((y2 - y1 - 2 * padding) // leading))
            if len(lines) > max_lines:
                raise ValueError(f"Text passt nicht in {name}: {len(lines)} statt {max_lines} Zeilen")
            text_object = pdf.beginText(x1 + padding, y2 - padding - font_size)
            text_object.setFont("Helvetica", font_size)
            text_object.setLeading(leading)
            for line in lines:
                text_object.textLine(line)
            pdf.drawText(text_object)
        pdf.showPage()
    pdf.save()
    stream.seek(0)
    return PdfReader(stream)


def field_name(annotation) -> str | None:
    parent_ref = annotation.get("/Parent")
    field = parent_ref.get_object() if parent_ref else annotation
    return field.get("/T")


source_reader = PdfReader(SOURCE)
fields = source_reader.get_fields() or {}
missing = set(VALUES) - set(fields)
if missing:
    raise ValueError(f"Fehlende Formularfelder: {sorted(missing)}")

writer = PdfWriter()
writer.clone_document_from_reader(source_reader)
overlay_reader = build_overlay(source_reader)
for index, page in enumerate(writer.pages):
    page.merge_page(overlay_reader.pages[index])
    remaining_annotations = ArrayObject()
    for annotation_ref in page.get("/Annots", []):
        annotation = annotation_ref.get_object()
        if annotation.get("/Subtype") == "/Widget" and field_name(annotation) in VALUES:
            continue
        remaining_annotations.append(annotation_ref)
    page[NameObject("/Annots")] = remaining_annotations

acroform = writer.root_object.get("/AcroForm")
if acroform:
    acroform = acroform.get_object()
    remaining_fields = ArrayObject()
    for field_ref in acroform.get("/Fields", []):
        if field_ref.get_object().get("/T") not in VALUES:
            remaining_fields.append(field_ref)
    acroform[NameObject("/Fields")] = remaining_fields

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
with OUTPUT.open("wb") as stream:
    writer.write(stream)

check = PdfReader(OUTPUT)
remaining = check.get_fields() or {}
still_interactive = set(VALUES) & set(remaining)
if still_interactive:
    raise ValueError(f"Bereits eingebettete Felder noch interaktiv: {sorted(still_interactive)}")
if len(remaining) < 40:
    raise ValueError(f"Zu wenige interaktive Restfelder: {len(remaining)}")

for page in check.pages:
    for annotation_ref in page.get("/Annots", []):
        annotation = annotation_ref.get_object()
        if annotation.get("/Subtype") == "/Widget" and field_name(annotation) in VALUES:
            raise ValueError("Ein eingebettetes Feld ist noch als Widget vorhanden")

visible_text = "\n".join(page.extract_text() or "" for page in check.pages)
for snippet in ("Vom Anliegen zur eigenen Stimme", "Brief-nach-Berlin ist", "01.03.2027"):
    if snippet not in visible_text:
        raise ValueError(f"Eingebetteter Text fehlt: {snippet}")

print(OUTPUT)
