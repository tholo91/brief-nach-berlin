/**
 * Unit-Tests für routeToLevel (999.6): Zod-Validierung, Sanitizing,
 * Fehlerpfade. Mistral wird gemockt — kein Netzwerk.
 */

const completeMock = jest.fn();

jest.mock("@/lib/mistral", () => ({
  mistral: { chat: { complete: (...args: unknown[]) => completeMock(...args) } },
  withMistralRetry: async <T,>(_label: string, fn: () => Promise<T>) => fn(),
  MISTRAL_MODELS: {
    letter: "mistral-large-latest",
    moderation: "mistral-moderation-latest",
    transcription: "voxtral-mini-latest",
    levelRouting: "mistral-small-latest",
  },
}));

import { routeToLevel, LevelRouterError, RoutingResultSchema } from "@/lib/lookup/levelRouter";

function mockResponse(payload: unknown) {
  completeMock.mockResolvedValueOnce({
    choices: [{ message: { content: typeof payload === "string" ? payload : JSON.stringify(payload) } }],
  });
}

beforeEach(() => {
  completeMock.mockReset();
});

describe("routeToLevel", () => {
  it("parst ein valides Kommune-Ergebnis", async () => {
    mockResponse({
      primary: { level: "Kommune", confidence: "high" },
      reasoning: "Lokale Straßen sind kommunale Aufgabe.",
    });
    const result = await routeToLevel("Schlaglöcher in unserer Straße");
    expect(result.primary.level).toBe("Kommune");
    expect(result.primary.confidence).toBe("high");
    expect(result.reasoning).toBe("Lokale Straßen sind kommunale Aufgabe.");
  });

  it("verwirft ein secondary-Feld aus der Modell-Antwort", async () => {
    mockResponse({
      primary: { level: "Land", confidence: "high" },
      secondary: { level: "Bund", confidence: "medium" },
      reasoning: "Bildungspolitik ist Ländersache.",
    });
    const result = await routeToLevel("Lehrermangel an meiner Schule");
    expect(result.primary.level).toBe("Land");
    expect("secondary" in result).toBe(false);
  });

  it("nutzt das levelRouting-Modell mit Temperatur 0.1 und XML-Wrap", async () => {
    mockResponse({
      primary: { level: "Bund", confidence: "high" },
      reasoning: "Asylrecht ist ausschließliche Bundeskompetenz.",
    });
    await routeToLevel("Asylpolitik");
    const request = completeMock.mock.calls[0][0] as {
      model: string;
      temperature: number;
      messages: Array<{ role: string; content: string }>;
    };
    expect(request.model).toBe("mistral-small-latest");
    expect(request.temperature).toBe(0.1);
    expect(request.messages[0].content).toContain(
      "warum die gewählte Ebene handeln kann"
    );
    expect(request.messages[0].content).toContain(
      "Nenne die Zuständigkeit statt die Einordnung nur zu wiederholen"
    );
    expect(request.messages[1].content).toBe("<anliegen>Asylpolitik</anliegen>");
  });

  it("kappt das Anliegen bei 1500 Zeichen", async () => {
    mockResponse({
      primary: { level: "Bund", confidence: "medium" },
      reasoning: "Rentenpolitik ist Bundeskompetenz.",
    });
    await routeToLevel("x".repeat(4000));
    const request = completeMock.mock.calls[0][0] as {
      messages: Array<{ role: string; content: string }>;
    };
    // 1500 Zeichen + <anliegen></anliegen> (21 Zeichen)
    expect(request.messages[1].content.length).toBe(1500 + "<anliegen></anliegen>".length);
  });

  it("wirft bei zu kurzem Anliegen ohne Mistral-Call", async () => {
    await expect(routeToLevel("ab")).rejects.toThrow(LevelRouterError);
    expect(completeMock).not.toHaveBeenCalled();
  });

  it("wirft bei ungültigem Level 'Gemeinde' (altes Enum)", async () => {
    mockResponse({
      primary: { level: "Gemeinde", confidence: "high" },
      reasoning: "Spielplätze sind kommunale Infrastruktur.",
    });
    await expect(routeToLevel("Spielplatz kaputt")).rejects.toThrow(LevelRouterError);
  });

  it("wirft, wenn Mistral confidence als Level zurückgibt (primary.level='low')", async () => {
    mockResponse({
      primary: { level: "low", confidence: "low" },
      reasoning: "Anliegen enthält mehrere Themen ohne klare Ebene.",
    });
    await expect(routeToLevel("Lehrer UND Schlaglöcher UND Rente")).rejects.toThrow(
      LevelRouterError
    );
  });

  it("wirft bei Nicht-JSON-Antwort", async () => {
    mockResponse("Hier ist leider kein JSON");
    await expect(routeToLevel("Mindestlohn erhöhen")).rejects.toThrow(LevelRouterError);
  });

  it("sanitized Reasoning mit URL auf leeren String", async () => {
    mockResponse({
      primary: { level: "Bund", confidence: "high" },
      reasoning: "Bildungspolitik http://evil.tld ist Ländersache",
    });
    const result = await routeToLevel("Asylpolitik verschärfen");
    expect(result.reasoning).toBe("");
    expect(result.primary.level).toBe("Bund");
  });

  it("trimmt Reasoning auf 200 Zeichen", () => {
    const parsed = RoutingResultSchema.parse({
      primary: { level: "Land", confidence: "medium" },
      reasoning: "A".repeat(250),
    });
    expect(parsed.reasoning.length).toBe(200);
  });

  it("wirft LevelRouterError, wenn der Mistral-Call fehlschlägt", async () => {
    completeMock.mockRejectedValueOnce(new Error("503"));
    await expect(routeToLevel("Bundeswehr Sondervermögen")).rejects.toThrow(LevelRouterError);
  });
});
