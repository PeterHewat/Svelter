#!/usr/bin/env bun
/* eslint-disable no-console -- CLI output */
/**
 * Exits 1 when web locale files diverge from English keys or `SUPPORTED_LOCALES`.
 */
import { resolve } from "node:path";
import { checkI18nKeyParity } from "./lib/i18n-key-parity";

const root = resolve(import.meta.dir, "..");
const { ok, errors } = await checkI18nKeyParity(root);

if (ok) {
  process.exit(0);
}

console.error("\ni18n key parity check failed:\n");
for (const error of errors) {
  console.error(`  • ${error}`);
}
console.error(
  "\nCanonical keys: apps/web/src/lib/locales/en.ts — add missing keys to every locale file.\n",
);
process.exit(1);
