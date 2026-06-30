import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  shouldRebrandFromTemplate,
  TEMPLATE_PRODUCT_NAME,
  type GitHubRepo,
} from "./repo-identity";

/** `.gitignore` entry for setup metadata in the upstream Svelter template repo. */
export const SETUP_JSON_GITIGNORE_ENTRY = ".svelter/setup.json";

export type EnsureSetupJsonCommittableOptions = {
  /** Parsed `origin` remote, when present */
  github?: GitHubRepo | null;
  /** Product name from setup config or wizard */
  productName?: string;
};

/**
 * Whether this checkout is an adopted product repo (not the upstream Svelter template).
 *
 * @param options - GitHub remote and/or configured product name
 */
export function isAdoptedTemplateRepo(
  options: EnsureSetupJsonCommittableOptions,
): boolean {
  if (options.github && shouldRebrandFromTemplate(options.github)) {
    return true;
  }
  const name = options.productName?.trim();
  return Boolean(name && name !== TEMPLATE_PRODUCT_NAME);
}

/**
 * Removes the `.svelter/setup.json` gitignore line from file contents.
 *
 * @param content - Raw `.gitignore` body
 */
export function removeSetupJsonFromGitignore(content: string): {
  content: string;
  removed: boolean;
} {
  const lines = content.split("\n");
  const filtered = lines.filter(
    (line) => line.trim() !== SETUP_JSON_GITIGNORE_ENTRY,
  );
  if (filtered.length === lines.length) {
    return { content, removed: false };
  }
  let next = filtered.join("\n");
  if (content.endsWith("\n") && !next.endsWith("\n")) {
    next += "\n";
  }
  return { content: next, removed: true };
}

/**
 * Drops `.svelter/setup.json` from `.gitignore` on adopted template repos.
 *
 * The upstream Svelter repository keeps the entry gitignored; repos created via
 * GitHub **Use this template** remove it on first setup so teams can commit
 * `setup.json`.
 *
 * @param root - Repository root
 * @param options - Remote and product identity hints
 * @returns Whether `.gitignore` was updated
 */
export function ensureSetupJsonCommittable(
  root: string,
  options: EnsureSetupJsonCommittableOptions,
): boolean {
  if (!isAdoptedTemplateRepo(options)) {
    return false;
  }
  const path = resolve(root, ".gitignore");
  if (!existsSync(path)) {
    return false;
  }
  const before = readFileSync(path, "utf8");
  const { content, removed } = removeSetupJsonFromGitignore(before);
  if (!removed) {
    return false;
  }
  writeFileSync(path, content);
  return true;
}
