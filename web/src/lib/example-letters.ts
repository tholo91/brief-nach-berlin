export type Recipient = {
  name: string;
  salutation: string;
  party: string;
  role: string;
  /** Override the sender city shown in the letter header (teaser rotation only). */
  senderCity?: string;
};

export type ExampleLetter = {
  slug: string;
  fromCity: string;
  topic: string;
  recipient: Recipient;
  /** Rotating recipients used by the landing teaser only. First entry should equal `recipient`. */
  rotatingRecipients?: Recipient[];
  /** Letter body without salutation and without closing signature. */
  body: string;
};

const BUNDESTAG_ROLE = "MdB, Deutscher Bundestag";

export const EXAMPLE_LETTERS: ReadonlyArray<ExampleLetter> = [
  {
    slug: "energiepolitik",
    fromCity: "Duisburg",
    topic: "Energiepolitik und Abhängigkeit",
    recipient: {
      name: "Mahmut Özdemir",
      salutation: "Sehr geehrter Herr Özdemir",
      party: "SPD",
      role: BUNDESTAG_ROLE,
    },
    rotatingRecipients: [
      {
        name: "Mahmut Özdemir",
        salutation: "Sehr geehrter Herr Özdemir",
        party: "SPD",
        role: BUNDESTAG_ROLE,
      },
      {
        name: "Katrin Göring-Eckardt",
        salutation: "Sehr geehrte Frau Göring-Eckardt",
        party: "Grüne",
        role: BUNDESTAG_ROLE,
        senderCity: "Erfurt",
      },
      {
        name: "Nancy Faeser",
        salutation: "Sehr geehrte Frau Faeser",
        party: "SPD",
        role: BUNDESTAG_ROLE,
        senderCity: "Wiesbaden",
      },
    ],
    body: `ich schreibe Ihnen, weil ich nicht mehr nur zusehen kann, wie unsere Energiepolitik in die falsche Richtung läuft. Dass die Wirtschaftsministerin auf fossile Energien setzt, während Teile der Industrie selbst zurück zu Erneuerbaren wollen, macht mich fassungslos.

Wir machen uns immer abhängiger von Staaten, deren Werte wir nicht teilen. Die Lage rund um die Straße von Hormuz hat das schmerzhaft gezeigt.

Die Technologien für die Energiewende existieren. Die Mehrheit in der Bevölkerung will sie. Was fehlt, ist der politische Mut, sie auch durchzusetzen.

Ich bitte Sie: Bringen Sie das in Ihrer Fraktion auf den Tisch. Damit meine Kinder nicht in einer Welt aufwachsen, in der wir am Tropf von Regierungen hängen, die Menschenrechte mit Füßen treten.`,
  },
  {
    slug: "bremen-hauptbahnhof",
    fromCity: "Bremen",
    topic: "Lage am Hauptbahnhof",
    recipient: {
      name: "Thomas Röwekamp",
      salutation: "Sehr geehrter Herr Röwekamp",
      party: "CDU",
      role: BUNDESTAG_ROLE,
    },
    body: `ich schreibe Ihnen, weil mir die Lage rund um den Bremer Hauptbahnhof seit Monaten keine Ruhe lässt. Wer dort abends vorbeigeht, sieht Menschen, die Hilfe bräuchten. Und spürt, dass dieser Ort gekippt ist. Ich fühle mich unsicher, und ich sehe Mitmenschen, die in einer Abwärtsbewegung feststecken.

Mehr Polizei reicht nicht. Wir brauchen soziale Hilfen, die Leute aus der Sucht und von der Straße holen, bevor wir sie verlieren. Wenn Politik hier wegschaut, gewinnen am Ende die Falschen.

Als ver.di-Mitglied bitte ich Sie: Setzen Sie sich auf Bundesebene dafür ein, dass Bremen die Mittel bekommt, beides parallel anzugehen.`,
  },
  {
    slug: "berlin-kreuzkoelln",
    fromCity: "Berlin",
    topic: "Verdrängung in Kreuzkölln",
    recipient: {
      name: "Pascal Meiser",
      salutation: "Sehr geehrter Herr Meiser",
      party: "Die Linke",
      role: BUNDESTAG_ROLE,
    },
    body: `ich wohne seit vielen Jahren in Kreuzkölln und beobachte, wie der Kiez Stück für Stück Menschen verliert, die ihn überhaupt erst zu dem gemacht haben, was er ist. Nachbarn ziehen weg, weil sie die Miete nicht mehr stemmen. Läden, die seit Jahrzehnten da sind, machen zu. Stattdessen ziehen Leute her, die sechs Monate bleiben.

Ich klage niemanden persönlich an. Aber ich sehe, wie ein Stadtviertel still und leise umgebaut wird, während die Politik zuschaut.

Als ver.di-Mitglied bitte ich Sie, sich im Bundestag dafür stark zu machen, dass langjährige Mieter geschützt werden. Nicht in fünf Jahren. Jetzt.`,
  },
];
