import { describe, expect, test } from "bun:test";
import { resolve } from "node:path";
import {
  CANONICAL_LOCALE,
  checkI18nKeyParity,
  collectParityErrors,
  collectRegistryMismatches,
  diffTranslationKeys,
  flattenLocaleKeySets,
} from "./i18n-key-parity";

const root = resolve(import.meta.dir, "../..");

describe("diffTranslationKeys", () => {
  test("reports missing and extra keys", () => {
    const canonical = new Set(["a", "b", "c"]);
    const locale = new Set(["b", "c", "d"]);

    expect(diffTranslationKeys(canonical, locale)).toEqual({
      missing: ["a"],
      extra: ["d"],
    });
  });
});

describe("collectRegistryMismatches", () => {
  test("flags supported locales without files and orphan files", () => {
    const errors = collectRegistryMismatches(["en", "es"], ["en", "fr"]);

    expect(errors).toEqual([
      'SUPPORTED_LOCALES includes "es" but apps/web/src/lib/locales/es.ts is missing',
      'apps/web/src/lib/locales/fr.ts exists but "fr" is not in SUPPORTED_LOCALES',
    ]);
  });
});

describe("collectParityErrors", () => {
  test("flags missing and extra keys per locale", () => {
    const errors = collectParityErrors(CANONICAL_LOCALE, {
      en: new Set(["common.hello", "common.goodbye"]),
      es: new Set(["common.hello", "common.extra"]),
    } as never);

    expect(errors).toEqual([
      "es: missing 1 key(s): common.goodbye",
      "es: extra 1 key(s): common.extra",
    ]);
  });
});

describe("flattenLocaleKeySets", () => {
  test("flattens nested dictionaries", () => {
    const keySets = flattenLocaleKeySets({
      en: { common: { hello: "Hello" }, nav: { home: "Home" } },
      es: { common: { hello: "Hola" }, nav: { home: "Inicio" } },
    } as never);

    expect(keySets.en).toEqual(new Set(["common.hello", "nav.home"]));
    expect(keySets.es).toEqual(new Set(["common.hello", "nav.home"]));
  });
});

describe("checkI18nKeyParity", () => {
  test("passes for the repository locale files", async () => {
    const result = await checkI18nKeyParity(root);

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
