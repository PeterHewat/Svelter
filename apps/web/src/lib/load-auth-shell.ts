import { setAuthShellModule } from "$lib/clerk-load.svelte";

let loadPromise: Promise<void> | null = null;

/**
 * Dynamically import the Clerk auth shell. Kept in its own module so Vite does
 * not attach auth-shell preload dependencies to the initial layout chunk.
 */
export function loadAuthShell(): Promise<void> {
  if (!loadPromise) {
    loadPromise = import("$lib/components/auth-shell.svelte").then((module) => {
      setAuthShellModule(module.default);
    });
  }
  return loadPromise;
}
