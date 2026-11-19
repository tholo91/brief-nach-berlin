jest.mock("next/navigation", () => ({ useRouter: () => ({ replace: jest.fn() }) }));
jest.mock("@/lib/mistral", () => ({}));

import { planClassLinkSync } from "@/components/jung/classLinkPersistence";
import {
  CLASS_LINK_STORAGE_KEY,
  clearClassLink,
  readClassLink,
  saveClassLink,
  schuleHref,
  type StoredClassLink,
} from "@/lib/schule/classLinkStorage";

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
  removeItem(key: string) {
    this.values.delete(key);
  }
}

const NOW = 1_800_000_000_000;
const link: StoredClassLink = {
  token: "tok.en",
  klasse: 7,
  plz: "28195",
  delivery: "pdf",
  expiresAt: NOW + 60_000,
};

describe("class link storage (A1)", () => {
  it("restores a saved link until it expires", () => {
    const storage = new MemoryStorage();
    saveClassLink(link, storage);
    expect(readClassLink(NOW, storage)).toEqual(link);
    expect(readClassLink(NOW + 59_999, storage)).toEqual(link);
  });

  it("drops an expired link and removes it", () => {
    const storage = new MemoryStorage();
    saveClassLink(link, storage);
    expect(readClassLink(NOW + 60_000, storage)).toBeNull();
    expect(storage.getItem(CLASS_LINK_STORAGE_KEY)).toBeNull();
  });

  it("ignores and removes broken entries", () => {
    const storage = new MemoryStorage();
    storage.setItem(CLASS_LINK_STORAGE_KEY, "{kaputt");
    expect(readClassLink(NOW, storage)).toBeNull();
    expect(storage.getItem(CLASS_LINK_STORAGE_KEY)).toBeNull();
    storage.setItem(CLASS_LINK_STORAGE_KEY, JSON.stringify({ ...link, klasse: 3 }));
    expect(readClassLink(NOW, storage)).toBeNull();
    storage.setItem(CLASS_LINK_STORAGE_KEY, JSON.stringify({ ...link, plz: "abc" }));
    expect(readClassLink(NOW, storage)).toBeNull();
  });

  it("normalises an unknown delivery to email", () => {
    const storage = new MemoryStorage();
    storage.setItem(CLASS_LINK_STORAGE_KEY, JSON.stringify({ ...link, delivery: "x" }));
    expect(readClassLink(NOW, storage)?.delivery).toBe("email");
  });

  it("clears the link and tolerates a missing storage", () => {
    const storage = new MemoryStorage();
    saveClassLink(link, storage);
    clearClassLink(storage);
    expect(readClassLink(NOW, storage)).toBeNull();
    expect(() => saveClassLink(link, null)).not.toThrow();
    expect(readClassLink(NOW, null)).toBeNull();
    expect(() => clearClassLink(null)).not.toThrow();
  });

  it("survives a storage that throws", () => {
    const broken = {
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
      removeItem: () => {
        throw new Error("denied");
      },
    };
    expect(() => saveClassLink(link, broken)).not.toThrow();
    expect(readClassLink(NOW, broken)).toBeNull();
    expect(() => clearClassLink(broken)).not.toThrow();
  });

  it("builds the /schule link with the token only when there is one", () => {
    expect(schuleHref(null)).toBe("/schule");
    expect(schuleHref(undefined)).toBe("/schule");
    expect(schuleHref("abc.def-_")).toBe("/schule?k=abc.def-_");
    expect(schuleHref("a b")).toBe("/schule?k=a%20b");
  });
});

describe("planClassLinkSync", () => {
  const valid = { status: "valid", klasse: 7, plz: "28195", token: "tok.en", delivery: "pdf", expiresAt: NOW + 5 } as const;

  it("remembers a verified link with the server's expiry", () => {
    expect(planClassLinkSync(valid, null, NOW)).toEqual({
      action: "save",
      link: { token: "tok.en", klasse: 7, plz: "28195", delivery: "pdf", expiresAt: NOW + 5 },
    });
  });

  it("falls back to 14 days when the server sent no expiry", () => {
    const plan = planClassLinkSync({ ...valid, expiresAt: undefined }, null, NOW);
    expect(plan).toMatchObject({ action: "save", link: { expiresAt: NOW + 14 * 24 * 60 * 60 * 1000 } });
  });

  it("forgets the stored link when verification fails", () => {
    expect(planClassLinkSync({ status: "invalid" }, link, NOW)).toEqual({ action: "clear" });
  });

  it("reloads /schule with ?k from storage when the URL has none", () => {
    expect(planClassLinkSync({ status: "none" }, link, NOW)).toEqual({ action: "redirect", href: "/schule?k=tok.en" });
    expect(planClassLinkSync({ status: "none" }, null, NOW)).toEqual({ action: "none" });
  });
});
