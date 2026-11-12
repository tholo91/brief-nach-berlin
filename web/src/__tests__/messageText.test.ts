import { messageText } from "@/lib/mistral-json";

describe("messageText", () => {
  it("gibt einen String unverändert zurück", () => {
    expect(messageText('{"ok":true}')).toBe('{"ok":true}');
  });

  it("nimmt bei Reasoning-Antworten nur die Text-Blöcke", () => {
    const content = [
      { type: "thinking", thinking: [{ type: "text", text: "Ich überlege ..." }], closed: true },
      { type: "text", text: '{"letter":"Hallo"}' },
    ];
    expect(messageText(content)).toBe('{"letter":"Hallo"}');
  });

  it("gibt null zurück, wenn kein Text da ist", () => {
    expect(messageText([{ type: "thinking", thinking: [], closed: true }])).toBeNull();
    expect(messageText(undefined)).toBeNull();
    expect(messageText(null)).toBeNull();
  });
});
