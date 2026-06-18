import {
  markClerkLoadRequested,
  shouldEagerLoadClerk,
} from "$lib/clerk-session-hint";
import type { Component } from "svelte";

export type ClerkLoadStatus = "idle" | "loading" | "ready";

export type AuthShellComponent = Component<{
  publishableKey: string;
  children: import("svelte").Snippet;
}>;

export const clerkLoad = $state({
  status: "idle" as ClerkLoadStatus,
  requested: false,
});

let authShellModule: AuthShellComponent | null = null;

/**
 * Begin loading the lazy auth shell (ClerkProvider and related UI).
 */
export function requestClerkLoad(): void {
  if (clerkLoad.status === "ready") return;
  markClerkLoadRequested();
  clerkLoad.requested = true;
  if (clerkLoad.status === "idle") {
    clerkLoad.status = "loading";
  }
}

/**
 * On first client mount, eagerly load Clerk when a session or prior auth flow exists.
 */
export function initClerkLoad(): void {
  if (shouldEagerLoadClerk()) {
    requestClerkLoad();
  }
}

/**
 * @param component - Resolved auth shell default export
 */
export function setAuthShellModule(component: AuthShellComponent): void {
  authShellModule = component;
  clerkLoad.status = "ready";
}

/**
 * Auth shell component after the lazy loader resolves.
 */
export function getAuthShell(): AuthShellComponent | null {
  return authShellModule;
}
