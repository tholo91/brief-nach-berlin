export interface WebmailProvider {
  label: string;
  url: string;
}

export const WEBMAIL_PROVIDERS: Readonly<Record<string, WebmailProvider>> = {
  "gmail.com": { label: "Gmail öffnen", url: "https://mail.google.com/" },
  "googlemail.com": { label: "Gmail öffnen", url: "https://mail.google.com/" },
  "gmx.de": { label: "GMX öffnen", url: "https://www.gmx.net/" },
  "gmx.net": { label: "GMX öffnen", url: "https://www.gmx.net/" },
  "gmx.com": { label: "GMX öffnen", url: "https://www.gmx.com/" },
  "web.de": { label: "Web.de öffnen", url: "https://web.de/" },
  "outlook.com": { label: "Outlook öffnen", url: "https://outlook.live.com/mail/" },
  "outlook.de": { label: "Outlook öffnen", url: "https://outlook.live.com/mail/" },
  "hotmail.com": { label: "Outlook öffnen", url: "https://outlook.live.com/mail/" },
  "hotmail.de": { label: "Outlook öffnen", url: "https://outlook.live.com/mail/" },
  "live.de": { label: "Outlook öffnen", url: "https://outlook.live.com/mail/" },
  "live.com": { label: "Outlook öffnen", url: "https://outlook.live.com/mail/" },
  "msn.com": { label: "Outlook öffnen", url: "https://outlook.live.com/mail/" },
  "yahoo.com": { label: "Yahoo öffnen", url: "https://mail.yahoo.com/" },
  "yahoo.de": { label: "Yahoo öffnen", url: "https://mail.yahoo.de/" },
  "icloud.com": { label: "iCloud Mail öffnen", url: "https://www.icloud.com/mail" },
  "me.com": { label: "iCloud Mail öffnen", url: "https://www.icloud.com/mail" },
  "mac.com": { label: "iCloud Mail öffnen", url: "https://www.icloud.com/mail" },
  "t-online.de": { label: "T-Online öffnen", url: "https://email.t-online.de/" },
  "aol.com": { label: "AOL Mail öffnen", url: "https://mail.aol.com/" },
  "aol.de": { label: "AOL Mail öffnen", url: "https://mail.aol.de/" },
  "proton.me": { label: "Proton Mail öffnen", url: "https://mail.proton.me/" },
  "protonmail.com": { label: "Proton Mail öffnen", url: "https://mail.proton.me/" },
  "pm.me": { label: "Proton Mail öffnen", url: "https://mail.proton.me/" },
  "mail.com": { label: "mail.com öffnen", url: "https://www.mail.com/" },
  "mailbox.org": { label: "mailbox.org öffnen", url: "https://login.mailbox.org/" },
  "posteo.de": { label: "Posteo öffnen", url: "https://posteo.de/" },
  "posteo.net": { label: "Posteo öffnen", url: "https://posteo.de/" },
};

const COMMON_TLD_TYPOS: Readonly<Record<string, string>> = {
  cmo: "com",
  con: "com",
  ed: "de",
  em: "me",
  eme: "me",
  nte: "net",
  ocm: "com",
  ten: "net",
  vom: "com",
};

function damerauLevenshteinDistance(left: string, right: string): number {
  const matrix = Array.from({ length: left.length + 1 }, () =>
    Array<number>(right.length + 1).fill(0),
  );

  for (let row = 0; row <= left.length; row += 1) matrix[row][0] = row;
  for (let column = 0; column <= right.length; column += 1) matrix[0][column] = column;

  for (let row = 1; row <= left.length; row += 1) {
    for (let column = 1; column <= right.length; column += 1) {
      const substitutionCost = left[row - 1] === right[column - 1] ? 0 : 1;
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + substitutionCost,
      );

      if (
        row > 1 &&
        column > 1 &&
        left[row - 1] === right[column - 2] &&
        left[row - 2] === right[column - 1]
      ) {
        matrix[row][column] = Math.min(matrix[row][column], matrix[row - 2][column - 2] + 1);
      }
    }
  }

  return matrix[left.length][right.length];
}

export function suggestEmailCorrection(email: string): string | null {
  const separatorIndex = email.lastIndexOf("@");
  if (separatorIndex <= 0 || separatorIndex === email.length - 1) return null;

  const localPart = email.slice(0, separatorIndex);
  const domain = email.slice(separatorIndex + 1).toLowerCase();
  if (WEBMAIL_PROVIDERS[domain]) return null;

  const closeProviderDomains = Object.keys(WEBMAIL_PROVIDERS).filter(
    (candidate) => damerauLevenshteinDistance(domain, candidate) === 1,
  );
  if (closeProviderDomains.length === 1) {
    return `${localPart}@${closeProviderDomains[0]}`;
  }

  const domainParts = domain.split(".");
  if (domainParts.length < 2) return null;

  const currentTld = domainParts.at(-1) ?? "";
  const correctedTld = COMMON_TLD_TYPOS[currentTld];
  if (!correctedTld) return null;

  domainParts[domainParts.length - 1] = correctedTld;
  const correctedDomain = domainParts.join(".");
  const secondLevelDomain = domainParts.at(-2);
  const knownDomainsWithSameName = Object.keys(WEBMAIL_PROVIDERS).filter(
    (candidate) => candidate.split(".").at(-2) === secondLevelDomain,
  );

  if (knownDomainsWithSameName.length > 0 && !WEBMAIL_PROVIDERS[correctedDomain]) {
    return null;
  }

  return `${localPart}@${correctedDomain}`;
}
