import { Document, Font, Link, Page, Polygon, StyleSheet, Svg, Text, View, pdf } from "@react-pdf/renderer";
import { AI_CONTENT_PDF_METADATA } from "@/lib/email/aiContentMarking";
import { emailCopy } from "@/lib/email/mailLocale";
import type { RecipientEnvelope } from "@/lib/lookup/recipientEnvelope";
import { WORKSHEET_CHECKLIST } from "./lessonPlan";

const GREEN = "#1B4332";
const TEXT = "#3D3D3D";
const STRIPE_WIDTH = 595.28;

const styles = StyleSheet.create({
  page: { fontFamily: "NotoSans", fontSize: 11, color: TEXT, paddingBottom: 44 },
  body: { paddingHorizontal: 56, paddingTop: 30 },
  brand: { fontSize: 10, fontWeight: 700, color: GREEN },
  title: { marginTop: 4, fontSize: 19, fontWeight: 700, color: GREEN },
  intro: { marginTop: 5, lineHeight: 1.45 },
  envelope: { marginTop: 18, padding: 12, borderWidth: 1, borderColor: "#B7C7BD", borderRadius: 4 },
  label: { marginBottom: 5, fontSize: 9.5, fontWeight: 700, color: GREEN },
  addressName: { fontWeight: 700 },
  addressLine: { marginTop: 1 },
  writeLine: { marginTop: 20, borderBottomWidth: 0.75, borderBottomColor: "#8A8A8A" },
  link: { marginTop: 8, fontSize: 9.5, color: GREEN },
  letter: { marginTop: 20, fontSize: 11.5, lineHeight: 1.65 },
  paragraph: { marginBottom: 8 },
  checklist: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#B7C7BD" },
  checklistTitle: { marginBottom: 6, fontSize: 12, fontWeight: 700, color: GREEN },
  checkRow: { flexDirection: "row", marginBottom: 4 },
  checkBox: { width: 10, height: 10, marginTop: 2, marginRight: 7, borderWidth: 1, borderColor: GREEN },
  notice: { position: "absolute", left: 56, right: 56, bottom: 20, fontSize: 8.5, lineHeight: 1.35, color: "#5A5A5A" },
});

function AirmailStripe() {
  const stripes = Array.from({ length: 34 }, (_, index) => {
    const left = index * 18 - 6;
    return (
      <Polygon
        key={index}
        points={`${left},8 ${left + 6},0 ${left + 16},0 ${left + 10},8`}
        fill={index % 2 === 0 ? "#C1121F" : "#1D3557"}
      />
    );
  });
  return (
    <Svg width={STRIPE_WIDTH} height={8} viewBox={`0 0 ${STRIPE_WIDTH} 8`}>
      {stripes}
    </Svg>
  );
}

function LetterDocument({ letterText, envelope }: { letterText: string; envelope: RecipientEnvelope }) {
  const copy = emailCopy.de;
  const [name, ...address] = envelope.lines;
  return (
    <Document
      title="Dein Briefentwurf"
      author="Brief-nach-Berlin"
      creator={AI_CONTENT_PDF_METADATA.creator}
      producer={AI_CONTENT_PDF_METADATA.creator}
      keywords={AI_CONTENT_PDF_METADATA.keywords}
      language="de"
    >
      <Page size="A4" style={styles.page}>
        <AirmailStripe />
        <View style={styles.body}>
          <Text style={styles.brand}>Brief-nach-Berlin</Text>
          <Text style={styles.title}>Dein Briefentwurf</Text>
          <Text style={styles.intro}>
            Schreib ihn von Hand ab und ergänze ein eigenes Erlebnis. Erst dann ist es dein Brief.
          </Text>

          <View style={styles.envelope} wrap={false}>
            <Text style={styles.label}>Für den Umschlag</Text>
            <Text style={styles.addressName}>{name}</Text>
            {address.map((line) => (
              <Text key={line} style={styles.addressLine}>{line}</Text>
            ))}
            {!envelope.complete && (
              <>
                <View style={styles.writeLine} />
                <View style={styles.writeLine} />
              </>
            )}
            {envelope.searchUrl && (
              <Link src={envelope.searchUrl} style={styles.link}>
                {envelope.complete ? "Anschrift bei Google prüfen" : "Anschrift bei Google suchen und hier eintragen"}
              </Link>
            )}
          </View>

          <View style={styles.letter}>
            {letterText.split(/\n+/).map((paragraph, index) => (
              <Text key={index} style={styles.paragraph}>{paragraph}</Text>
            ))}
          </View>

          <View style={styles.checklist} wrap={false}>
            <Text style={styles.checklistTitle}>Mach den Brief zu deinem</Text>
            {WORKSHEET_CHECKLIST.map((item) => (
              <View key={item} style={styles.checkRow}>
                <View style={styles.checkBox} />
                <Text>{item}</Text>
              </View>
            ))}
          </View>
        </View>
        <Text style={styles.notice} fixed>
          {copy.notice} {copy.noticeText}. {copy.responsibility}
        </Text>
      </Page>
    </Document>
  );
}

// Läuft nur im Browser: Brief und Anschrift verlassen das Gerät dafür nicht.
export async function buildLetterPdf(input: { letterText: string; envelope: RecipientEnvelope }): Promise<Blob> {
  const origin = window.location.origin;
  Font.register({
    family: "NotoSans",
    fonts: [
      { src: `${origin}/fonts/NotoSans-Regular.ttf`, fontWeight: 400 },
      { src: `${origin}/fonts/NotoSans-Bold.ttf`, fontWeight: 700 },
    ],
  });
  Font.registerHyphenationCallback((word) => [word]);
  return pdf(<LetterDocument {...input} />).toBlob();
}
