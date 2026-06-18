import { setAuthShellModule } from "$lib/clerk-load.svelte";

let loadPromise: Promise<void> | null = null;

/**
 * Dynamically import the Clerk auth shell. Kept in its own module so Vite does
 * not attach auth-shell preload dependencies to the initial layout chunk.
 */
export function loadAuthShell(): Promise<void> {
  if (!loadPromise) {
    loadPromise = Promise.all([
      import("$lib/components/auth-shell.svelte"),
      // Prefetch only — warms the chunk before AppHeader dynamically imports it.
      import("$lib/components/app-header-clerk.svelte"),
    ]).then(([shellModule]) => {
      setAuthShellModule(shellModule.default);
    });
  }
  return loadPromise;
}
