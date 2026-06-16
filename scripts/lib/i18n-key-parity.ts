import { readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  flattenTranslations,
  SUPPORTED_LOCALES,
  type Locale,
  type TranslationDictionary,
} from "@repo/utils/i18n";

export const CANONICAL_LOCALE: Locale = "en";
export const WEB_LOCALES_DIR = "apps/web/src/lib/locales";

/**
 * Compare flattened translation keys against a canonical set.
 *
 * @param canonical - Keys from the canonical locale
 * @param localeKeys - Keys from a target locale
 * @returns Missing and extra keys relative to canonical
 */
export function diffTranslationKeys(
  canonical: Set<string>,
  localeKeys: Set<string>,
): { missing: string[]; extra: string[] } {
  const missing = [...canonical].filter((key) => !localeKeys.has(key)).sort();
  const extra = [...localeKeys].filter((key) => !canonical.has(key)).sort();
  return { missing, extra };
}

/**
 * Build human-readable parity errors for every non-canonical locale.
 *
 * @param canonicalLocale - Locale id used as the key source of truth
 * @param locales - Flattened keys per locale
 * @returns Error messages; empty when all locales match canonical keys
 */
export function collectParityErrors(
  canonicalLocale: Locale,
  locales: Record<Locale, Set<string>>,
): string[] {
  const canonical = locales[canonicalLocale];
  if (!canonical) {
    return [`Canonical locale "${canonicalLocale}" has no translation keys`];
  }

  const errors: string[] = [];

  for (const locale of Object.keys(locales) as Locale[]) {
    if (locale === canonicalLocale) continue;

    const keys = locales[locale];
    if (!keys || keys.size === 0) {
      errors.push(`${locale}: no translation keys loaded`);
      continue;
    }

    const { missing, extra } = diffTranslationKeys(canonical, keys);

    if (missing.length > 0) {
      errors.push(
        `${locale}: missing ${missing.length} key(s): ${missing.join(", ")}`,
      );
    }

    if (extra.length > 0) {
      errors.push(
        `${locale}: extra ${extra.length} key(s): ${extra.join(", ")}`,
      );
    }
  }

  return errors;
}

/**
 * Ensure `SUPPORTED_LOCALES` matches locale files on disk.
 *
 * @param supportedLocales - Locale ids from `SUPPORTED_LOCALES`
 * @param localeFiles - Locale ids derived from `apps/web/src/lib/locales/*.ts`
 * @returns Error messages; empty when registry and files align
 */
export function collectRegistryMismatches(
  supportedLocales: readonly Locale[],
  localeFiles: readonly Locale[],
): string[] {
  const supported = new Set(supportedLocales);
  const files = new Set(localeFiles);
  const errors: string[] = [];

  for (const locale of supported) {
    if (!files.has(locale)) {
      errors.push(
        `SUPPORTED_LOCALES includes "${locale}" but ${WEB_LOCALES_DIR}/${locale}.ts is missing`,
      );
    }
  }

  for (const locale of files) {
    if (!supported.has(locale)) {
      errors.push(
        `${WEB_LOCALES_DIR}/${locale}.ts exists but "${locale}" is not in SUPPORTED_LOCALES`,
      );
    }
  }

  return errors;
}

/**
 * Flatten nested locale dictionaries into dot-notation key sets.
 *
 * @param dictionaries - Nested translation trees per locale
 * @returns Flattened key sets per locale
 */
export function flattenLocaleKeySets(
  dictionaries: Record<Locale, TranslationDictionary>,
): Record<Locale, Set<string>> {
  const result = {} as Record<Locale, Set<string>>;

  for (const locale of Object.keys(SUPPORTED_LOCALES) as Locale[]) {
    const dictionary = dictionaries[locale];
    result[locale] = new Set(
      Object.keys(flattenTranslations(dictionary ?? {})),
    );
  }

  return result;
}

/**
 * List locale ids from `apps/web/src/lib/locales/*.ts` basenames.
 *
 * @param rootDir - Repository root
 * @returns Sorted locale ids
 */
export async function listWebLocaleFiles(rootDir: string): Promise<Locale[]> {
  const localesDir = resolve(rootDir, WEB_LOCALES_DIR);
  const entries = await readdir(localesDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".ts"))
    .map((entry) => entry.name.replace(/\.ts$/, "") as Locale)
    .sort();
}

/**
 * Load all web locale dictionaries registered in `SUPPORTED_LOCALES`.
 *
 * @param rootDir - Repository root
 * @returns Nested translation trees per locale
 */
export async function loadWebLocaleDictionaries(
  rootDir: string,
): Promise<Record<Locale, TranslationDictionary>> {
  const localesDir = resolve(rootDir, WEB_LOCALES_DIR);
  const result = {} as Record<Locale, TranslationDictionary>;

  for (const locale of Object.keys(SUPPORTED_LOCALES) as Locale[]) {
    const modulePath = pathToFileURL(join(localesDir, `${locale}.ts`)).href;
    const mod = (await import(modulePath)) as {
      default: TranslationDictionary;
    };
    result[locale] = mod.default;
  }

  return result;
}

export interface I18nKeyParityResult {
  ok: boolean;
  errors: string[];
}

/**
 * Verify locale registry alignment and translation key parity against English.
 *
 * @param rootDir - Repository root
 * @returns Whether parity checks passed and any error messages
 */
export async function checkI18nKeyParity(
  rootDir: string,
): Promise<I18nKeyParityResult> {
  const localeFiles = await listWebLocaleFiles(rootDir);
  const supportedLocales = Object.keys(SUPPORTED_LOCALES) as Locale[];
  const errors = [...collectRegistryMismatches(supportedLocales, localeFiles)];

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const dictionaries = await loadWebLocaleDictionaries(rootDir);
  const keySets = flattenLocaleKeySets(dictionaries);
  errors.push(...collectParityErrors(CANONICAL_LOCALE, keySets));

  return { ok: errors.length === 0, errors };
}
