import type { Locale } from "./locale";

/**
 * Copy of the parents page /eltern (page body, header CTA). The German values are the
 * original texts of the page and the German FAQ also feeds the FAQPage JSON-LD, so
 * search engines see the same German wording as the visible page.
 * Values with `{braces}` are templates; keep the token unchanged in every locale.
 */
export interface ElternCopy {
  header: { cta: string; ctaMobile: string };
  imageAlt: string;
  title: string;
  intro: string;
  doors: {
    write: { title: string; text: string };
    safe: { title: string; text: string };
  };
  responsibility: {
    heading: string;
    land: { title: string; text: string; who: string };
    school: { title: string; text: string; who: string };
    note: string;
  };
  safety: {
    heading: string;
    bullets: readonly [string, string, string];
    detailsLead: string;
    privacyLink: string;
    detailsMiddle: string;
    schoolsLink: string;
    detailsEnd: string;
  };
  faqHeading: string;
  faqs: { q: string; a: string }[];
}

const de: ElternCopy = {
  header: { cta: "Brief entwerfen", ctaMobile: "Schreiben" },
  imageAlt: "Ein Elternteil schreibt am Küchentisch einen Brief, das Kind zeigt auf eine Zeile, gemalte Illustration",
  title: "Schreib der Politik, was an der Schule deiner Kinder fehlt.",
  intro:
    "Unterrichtsausfall, gesperrte Turnhalle, verspäteter Schulbus? Ich suche die zuständige Ebene und schreibe dir einen Entwurf als Vorlage für deinen Brief.",
  doors: {
    write: {
      title: "Ich will selbst einen Brief schreiben",
      text: "Anliegen schildern, Entwurf bekommen, den Brief von Hand schreiben.",
    },
    safe: {
      title: "Mein Kind will Brief-nach-Berlin mit seiner Klasse nutzen",
      text: "Was mit den Daten passiert und wie die Lehrkraft startet.",
    },
  },
  responsibility: {
    heading: "Wer ist zuständig?",
    land: {
      title: "Land",
      text: "Lehrkräfte, Unterrichtsausfall, Lehrpläne, Schulgesetz.",
      who: "Landtag und Landesregierung",
    },
    school: {
      title: "Schulträger",
      text: "Gebäude, Ausstattung, Schulbus.",
      who: "Stadt, Gemeinde oder Kreis",
    },
    note: "Brief-nach-Berlin schlägt dir die zuständige Ebene vor. Prüf den Vorschlag, bevor du deinen Brief schreibst. Die Aufteilung unterscheidet sich je nach Bundesland, sie stammt vom Niedersächsischen Kultusministerium.",
  },
  safety: {
    heading: "Ist das sicher?",
    bullets: [
      "Verarbeitet werden Postleitzahl und Anliegen als Text, nur während der Verarbeitung, beim E-Mail-Weg auch die E-Mail-Adresse. Es gibt keine Accounts, auf meinem Server wird dafür nichts gespeichert. Trägt die Lehrkraft den Schulnamen ein, kommt er in den Brief und wird ebenfalls in keiner Datenbank gespeichert.",
      "Den Entwurf formuliert eine KI von Mistral, einem Unternehmen aus Frankreich.",
      "Im Jugendmodus bekommt dein Kind höchstens die eine Mail mit dem Entwurf: keine Erinnerungen, keine Spendenbitte, keine Frage nach einer Partei, keine Kartenfunktion.",
    ],
    detailsLead: "Alle Details stehen in der",
    privacyLink: "Datenschutzerklärung",
    detailsMiddle: "und auf der Seite",
    schoolsLink: "für Schulen",
    detailsEnd: ".",
  },
  faqHeading: "Häufige Fragen",
  faqs: [
    {
      q: "Wo kann ich mich über Unterrichtsausfall beschweren?",
      a: "Zuerst bei der Schulleitung und der Elternvertretung deiner Schule. Für Lehrkräfte und Unterrichtsausfall ist das Land zuständig, also kannst du auch an Landtagsabgeordnete oder die Landesregierung schreiben. Brief-nach-Berlin hilft dir, daraus einen Briefentwurf an die zuständige Ebene zu machen.",
    },
    {
      q: "Wer ist für das Schulgebäude zuständig?",
      a: "Für Gebäude, Ausstattung und Schulbus ist in der Regel der Schulträger zuständig, also die Stadt, die Gemeinde oder der Kreis. Lehrkräfte und Lehrpläne gehören zum Land. Die Aufteilung unterscheidet sich je nach Bundesland, die Quelle ist das Niedersächsische Kultusministerium.",
    },
    {
      q: "Kann ich an das Kultusministerium schreiben?",
      a: "Brief-nach-Berlin schlägt für die Landesebene Landtagsabgeordnete und die Landesregierung vor, in Stadtstaaten den Senat. Das Kultusministerium selbst ist kein eigener Empfänger in der Auswahl. Du kannst es im Brief aber nennen und schildern, was in deinem Bundesland geändert werden soll.",
    },
    {
      q: "Ist das für mein Kind sicher?",
      a: "Ja. Dein Kind gibt in der Schule Postleitzahl und Anliegen ein, nur während der Verarbeitung, ohne Account. Die Lehrkraft entscheidet, ob der Entwurf als PDF auf dem Gerät bleibt oder per E-Mail kommt; nur beim E-Mail-Weg wird eine Adresse abgefragt. Im Jugendmodus gibt es keine Erinnerungen, keine Spendenbitte und keine Frage nach einer Partei. Trägt die Lehrkraft im Klassenlink den Namen der Schule ein, kommt er in den Brief und wird in keiner Datenbank gespeichert. Den Entwurf formuliert eine KI von Mistral aus Frankreich.",
    },
    {
      q: "Was kostet das?",
      a: "Nichts. Brief-nach-Berlin ist kostenlos und du brauchst keinen Account. Für den Brief brauchst du nur Papier, einen Umschlag und eine Briefmarke.",
    },
  ],
};

const en: ElternCopy = {
  header: { cta: "Draft a letter", ctaMobile: "Write" },
  imageAlt: "A parent writes a letter at the kitchen table while the child points at a line, painted illustration",
  title: "Tell politicians what is missing at your children's school.",
  intro:
    "Lessons cancelled, gym closed, school bus late? I find the right level of government and write you a draft as a template for your letter.",
  doors: {
    write: {
      title: "I want to write a letter myself",
      text: "Describe your concern, get a draft, write the letter by hand.",
    },
    safe: {
      title: "My child wants to use Brief-nach-Berlin with their class",
      text: "What happens to the data and how the teacher gets started.",
    },
  },
  responsibility: {
    heading: "Who is responsible?",
    land: {
      title: "State (Land)",
      text: "Teachers, cancelled lessons, curricula, school law.",
      who: "Landtag and Landesregierung (state parliament and state government)",
    },
    school: {
      title: "School authority (Schulträger)",
      text: "Buildings, equipment, school bus.",
      who: "City, municipality or district (Kreis)",
    },
    note: "Brief-nach-Berlin suggests the right level for you. Check the suggestion before you write your letter. The split differs by federal state. It comes from the Lower Saxony ministry of education (Niedersächsisches Kultusministerium).",
  },
  safety: {
    heading: "Is this safe?",
    bullets: [
      "The postal code and your concern are processed as text, only during processing, and on the email route the email address too. There are no accounts, and nothing is stored on my server for this. If the teacher enters the school name, it goes into the letter and is not stored in any database either.",
      "The draft is written by an AI from Mistral, a company from France.",
      "In youth mode, your child gets at most one email with the draft: no reminders, no donation request, no question about a party, no map function.",
    ],
    detailsLead: "All details are in the",
    privacyLink: "privacy policy",
    detailsMiddle: "and on the page",
    schoolsLink: "for schools",
    detailsEnd: ". Both pages are in German.",
  },
  faqHeading: "Common questions",
  faqs: [
    {
      q: "Where can I complain about cancelled lessons?",
      a: "First to the school management (Schulleitung) and the parent representatives of your school. The state (Land) is responsible for teachers and cancelled lessons, so you can also write to members of the Landtag (state parliament) or to the Landesregierung (state government). Brief-nach-Berlin helps you turn that into a draft letter to the right level.",
    },
    {
      q: "Who is responsible for the school building?",
      a: "The Schulträger is usually responsible for buildings, equipment and the school bus, meaning the city, the municipality or the district (Kreis). Teachers and curricula belong to the state. The split differs by federal state. The source is the Lower Saxony ministry of education (Niedersächsisches Kultusministerium).",
    },
    {
      q: "Can I write to the Kultusministerium?",
      a: "For the state level, Brief-nach-Berlin suggests members of the Landtag and the Landesregierung, and in city states the Senat. The Kultusministerium (ministry of education) itself is not a separate recipient in the selection. You can name it in your letter, though, and describe what should change in your federal state.",
    },
    {
      q: "Is this safe for my child?",
      a: "Yes. Your child enters the postal code and the concern at school, only during processing, without an account. The teacher decides whether the draft stays on the device as a PDF or arrives by email; an address is only asked for on the email route. In youth mode there are no reminders, no donation request and no question about a party. If the teacher enters the school name in the class link, it goes into the letter and is not stored in any database. The draft is written by an AI from Mistral in France.",
    },
    {
      q: "What does it cost?",
      a: "Nothing. Brief-nach-Berlin is free and you do not need an account. For the letter you only need paper, an envelope and a stamp.",
    },
  ],
};

const tr: ElternCopy = {
  header: { cta: "Mektup taslağı oluştur", ctaMobile: "Yaz" },
  imageAlt: "Bir ebeveyn mutfak masasında mektup yazıyor, çocuk bir satırı gösteriyor, çizilmiş illüstrasyon",
  title: "Çocuklarınızın okulunda neyin eksik olduğunu siyasete yazın.",
  intro:
    "Ders iptalleri, kapatılan spor salonu, geç kalan okul servisi? Sorumlu düzeyi ben bulurum ve mektubunuz için örnek olacak bir taslak yazarım.",
  doors: {
    write: {
      title: "Kendim bir mektup yazmak istiyorum",
      text: "Talebinizi anlatın, taslağı alın, mektubu elle yazın.",
    },
    safe: {
      title: "Çocuğum Brief-nach-Berlin'i sınıfıyla kullanmak istiyor",
      text: "Verilere ne olduğu ve öğretmenin nasıl başlattığı.",
    },
  },
  responsibility: {
    heading: "Kim sorumlu?",
    land: {
      title: "Eyalet (Land)",
      text: "Öğretmenler, ders iptalleri, müfredat, okul yasası.",
      who: "Landtag ve Landesregierung (eyalet meclisi ve eyalet hükümeti)",
    },
    school: {
      title: "Okul idaresi (Schulträger)",
      text: "Binalar, donanım, okul servisi.",
      who: "Şehir, belediye veya ilçe (Kreis)",
    },
    note: "Brief-nach-Berlin sorumlu düzeyi size önerir. Mektubunuzu yazmadan önce öneriyi kontrol edin. Dağılım eyalete göre değişir. Bu dağılım Aşağı Saksonya eğitim bakanlığından (Niedersächsisches Kultusministerium) gelir.",
  },
  safety: {
    heading: "Bu güvenli mi?",
    bullets: [
      "Posta kodu ve talebiniz metin olarak, yalnızca işlenme sırasında işlenir; e-posta yolunda e-posta adresi de işlenir. Hesap yoktur ve bunun için sunucumda hiçbir şey saklanmaz. Öğretmen okulun adını girerse mektuba eklenir ve hiçbir veri tabanında saklanmaz.",
      "Taslağı Fransa'daki bir şirket olan Mistral'in yapay zekâsı yazar.",
      "Gençlik modunda çocuğunuz en fazla taslağı içeren tek bir e-posta alır: hatırlatma yok, bağış isteği yok, parti sorusu yok, harita özelliği yok.",
    ],
    detailsLead: "Tüm ayrıntılar",
    privacyLink: "gizlilik politikasında",
    detailsMiddle: "ve",
    schoolsLink: "okullar sayfasında",
    detailsEnd: " yer alır. Her iki sayfa da Almanca.",
  },
  faqHeading: "Sık sorulan sorular",
  faqs: [
    {
      q: "Ders iptallerini nereye şikâyet edebilirim?",
      a: "Önce okul müdürlüğüne (Schulleitung) ve okulunuzun veli temsilciliğine. Öğretmenler ve ders iptalleri eyaletin (Land) sorumluluğundadır. Bu yüzden Landtag milletvekillerine veya Landesregierung'a (eyalet hükümeti) da yazabilirsiniz. Brief-nach-Berlin, bunu sorumlu düzeye giden bir mektup taslağına dönüştürmenize yardımcı olur.",
    },
    {
      q: "Okul binasından kim sorumlu?",
      a: "Binalar, donanım ve okul servisi için genellikle Schulträger sorumludur; yani şehir, belediye veya ilçe (Kreis). Öğretmenler ve müfredat eyalete aittir. Dağılım eyalete göre değişir. Kaynak Aşağı Saksonya eğitim bakanlığıdır (Niedersächsisches Kultusministerium).",
    },
    {
      q: "Kultusministerium'a yazabilir miyim?",
      a: "Brief-nach-Berlin eyalet düzeyi için Landtag milletvekillerini ve Landesregierung'u, şehir eyaletlerinde Senat'ı önerir. Kultusministerium (eğitim bakanlığı) seçimde ayrı bir alıcı değildir. Ancak mektupta onu anabilir ve eyaletinizde neyin değişmesi gerektiğini anlatabilirsiniz.",
    },
    {
      q: "Bu çocuğum için güvenli mi?",
      a: "Evet. Çocuğunuz okulda posta kodunu ve talebini yalnızca işlenme sırasında, hesap olmadan girer. Taslağın cihazda PDF olarak mı kalacağına yoksa e-postayla mı geleceğine öğretmen karar verir; adres yalnızca e-posta yolunda sorulur. Gençlik modunda hatırlatma, bağış isteği ve parti sorusu yoktur. Öğretmen sınıf bağlantısına okulun adını girerse mektuba eklenir ve hiçbir veri tabanında saklanmaz. Taslağı Fransa'daki Mistral'in yapay zekâsı yazar.",
    },
    {
      q: "Bunun maliyeti nedir?",
      a: "Hiçbir şey. Brief-nach-Berlin ücretsizdir ve hesap gerekmez. Mektup için yalnızca kâğıt, zarf ve pul yeter.",
    },
  ],
};

export const ELTERN_COPY: Record<Locale, ElternCopy> = { de, en, tr };
