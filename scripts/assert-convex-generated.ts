#!/usr/bin/env bun
/* eslint-disable no-console -- CLI output */
/**
 * Exits 1 when `convex/_generated/` is missing and Convex is linked.
 */
import { resolve } from "node:path";
import {
  CONVEX_LINK_HELP,
  hasConvexGenerated,
  isConvexLinked,
} from "./lib/convex-link";

const root = resolve(import.meta.dir, "..");

if (!isConvexLinked(root)) {
  console.log("○ assert-convex-generated skipped (Convex not linked)");
  process.exit(0);
}

if (hasConvexGenerated(root)) {
  process.exit(0);
}

console.error(`\n${CONVEX_LINK_HELP}\n`);
process.exit(1);
