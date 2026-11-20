import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));
jest.mock("@/lib/actions/updateCampaign", () => ({ updateCampaignAction: jest.fn() }));
jest.mock("@/lib/actions/pauseCampaign", () => ({ pauseCampaignAction: jest.fn() }));
jest.mock("@/lib/actions/resumeCampaign", () => ({ resumeCampaignAction: jest.fn() }));
jest.mock("@/lib/actions/campaignEnd", () => ({
  endCampaignAction: jest.fn(),
  updateCampaignEndDateAction: jest.fn(),
}));
jest.mock("@/lib/actions/transferCampaign", () => ({ transferCampaignAction: jest.fn() }));
jest.mock("@/lib/actions/setMilestoneMails", () => ({ setMilestoneMailsAction: jest.fn() }));

import { CampaignManager } from "@/components/campaigns/CampaignManager";
import { CampaignVariantsEditor } from "@/components/campaigns/CampaignVariantsEditor";
import type { Campaign } from "@/lib/campaigns/schema";

const variantA = "Eine erste alternative Perspektive mit mindestens fünfzig Zeichen für den Test.";
const variantB = "Eine zweite alternative Perspektive mit mindestens fünfzig Zeichen für den Test.";

const baseCampaign: Campaign = {
  id: "campaign-1",
  slug: "duisburg-retten",
  creatorEmail: "initiative@example.org",
  title: "Duisburg retten",
  issueText: "Duisburg braucht jetzt mehr sichere und bezahlbare öffentliche Räume.",
  description: null,
  creatorName: null,
  externalUrl: null,
  logoPath: "initiative/logo.png",
  status: "active",
  moderationStatus: "approved",
  moderationCategories: [],
  targetLevel: "Bund",
  targetState: null,
  targetRecipient: null,
  targetPoliticianIds: [],
  emailVerifiedAt: null,
  activatedAt: "2026-08-25T00:00:00.000Z",
  pausedAt: null,
  archivedAt: null,
  lastPublishedRevisionId: null,
  letterCount: 0,
  createdAt: "2026-08-25T00:00:00.000Z",
  updatedAt: "2026-08-25T00:00:00.000Z",
};

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
});

function renderManager(campaign: Campaign, ended = false) {
  return renderToStaticMarkup(createElement(CampaignManager, { campaign, ended }));
}

function renderEditor(overrides: Partial<Parameters<typeof CampaignVariantsEditor>[0]> = {}) {
  return renderToStaticMarkup(
    createElement(CampaignVariantsEditor, {
      initialAlternatives: [],
      initialHooks: [],
      issueTextChanged: false,
      disabled: false,
      ...overrides,
    })
  );
}

describe("CampaignManager: Varianten und Satzanfänge", () => {
  it("rendert Tabs mit dem Anliegen als erstem Panel, dann die Satzanfänge", () => {
    const markup = renderManager(baseCampaign);
    const positions = [
      markup.indexOf("Anliegen und Varianten"),
      markup.indexOf('id="issueText"'),
      markup.indexOf("Satzanfänge für die persönliche Zeile"),
      markup.indexOf('for="creatorName"'),
    ];

    expect(positions.every((position) => position >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    expect(markup).toContain('name="variantsSubmitted"');
  });

  it("zeigt gespeicherte Varianten und Satzanfänge mit den Formfeldern", () => {
    const markup = renderManager({
      ...baseCampaign,
      issueTextAlternatives: [variantA, variantB],
      issueTextAlternativesBase: baseCampaign.issueText,
      personalHooks: ["Ich pendle täglich:"],
    });

    expect(markup.match(/name="issueTextAlternative"/g)).toHaveLength(2);
    expect(markup).toContain(variantA);
    expect(markup).toContain(variantB);
    expect(markup).toContain('name="personalHook"');
    expect(markup).toContain('value="Ich pendle täglich:"');
    expect(markup).not.toContain('aria-label="Variante hinzufügen"');
    expect(markup).toContain('aria-label="Variante 2 entfernen"');
  });

  it("verbirgt den Änderungshinweis, solange das Anliegen unverändert ist", () => {
    const markup = renderManager({ ...baseCampaign, issueTextAlternatives: [variantA] });
    expect(markup).not.toContain("Du hast das Anliegen geändert");
  });
});

describe("CampaignVariantsEditor", () => {
  it("zeigt Erklärtexte, den leeren Zustand und den Plus-Tab", () => {
    const markup = renderEditor();

    expect(markup).toContain('role="tablist"');
    expect(markup).toContain('aria-selected="true"');

    expect(markup).toContain("Damit Büros nicht lauter gleiche Briefe bekommen");
    expect(markup).toContain("Schreibende sehen diese Anfänge als Vorschläge");
    expect(markup).toContain("Ohne eigene Satzanfänge erscheinen allgemeine Vorschläge");
    expect(markup).toContain('aria-label="Variante hinzufügen"');
    expect(markup).not.toContain('name="issueTextAlternative"');
    expect(markup).not.toContain('name="personalHook"');
  });

  it("zeigt den sanften Hinweis nur bei geändertem Anliegen und vorhandenen Varianten", () => {
    const hint = "Du hast das Anliegen geändert. Passen die Varianten noch?";
    expect(renderEditor({ issueTextChanged: true, initialAlternatives: [variantA] })).toContain(hint);
    expect(renderEditor({ issueTextChanged: true })).not.toContain(hint);
    expect(renderEditor({ issueTextChanged: false, initialAlternatives: [variantA] })).not.toContain(hint);
  });

  it("zeigt den Zeichenzähler mit Mindestlänge bei zu kurzen Varianten", () => {
    const markup = renderEditor({ initialAlternatives: ["Zu kurz"] });
    expect(markup).toContain("7 Zeichen, mindestens 50");
  });

  it("sperrt das Eingabefeld, wenn drei Satzanfänge vorhanden sind", () => {
    const markup = renderEditor({ initialHooks: ["Eins eins", "Zwei zwei", "Drei drei"] });
    expect(markup.match(/name="personalHook"/g)).toHaveLength(3);
    expect(markup).toContain("Mehr als 3 Satzanfänge sind nicht möglich");
    expect(markup).not.toContain("Neuer Satzanfang");
  });

  it("gibt Servermeldungen unter dem jeweiligen Abschnitt aus", () => {
    const markup = renderEditor({
      alternativesError: "Die Varianten müssen sich unterscheiden.",
      hooksError: "Die Satzanfänge müssen sich unterscheiden.",
    });
    expect(markup).toContain("Die Varianten müssen sich unterscheiden.");
    expect(markup).toContain("Die Satzanfänge müssen sich unterscheiden.");
  });

  it("verwendet keine Gedankenstriche in der Copy", () => {
    const markup = renderEditor({ issueTextChanged: true, initialAlternatives: [variantA] });
    expect(markup).not.toMatch(/[–—]/);
  });
});
