<script lang="ts">
  import { api } from "$convex/_generated/api";
  import { useConvexClient } from "convex-svelte";
  import { useClerkContext } from "svelte-clerk/client";
  import {
    clearAnonymousTokenCache,
    clearStoredAnonUserId,
    convexAuthModeFromClerk,
    readStoredAnonUserId,
    resolveAnonymousConvexToken,
  } from "$lib/anonymous-auth";
  import { isAuthEnabled } from "$lib/backend";
  import { convexAuthReady } from "$lib/convex-clerk-ready.svelte";
  import { convexSiteUrl } from "$lib/convex-site-url";
  import { loadWebEnv } from "$lib/web-env";

  if (!isAuthEnabled()) {
    convexAuthReady.ready = true;
  } else {
    const client = useConvexClient();
    const clerk = useClerkContext();
    const { convexUrl } = loadWebEnv();

    let graduating = $state(false);

    const authMode = $derived.by(() => {
      const { isLoaded, auth, session } = clerk;
      return convexAuthModeFromClerk({
        isLoaded,
        userId: auth.userId,
        hasSession: Boolean(session),
      });
    });

    async function syncClerkUserRow() {
      if (graduating) {
        return;
      }
      graduating = true;
      try {
        const guestTokenIdentifier = readStoredAnonUserId();
        if (guestTokenIdentifier) {
          await client.mutation(api.users.mergeGuestSessionIntoAccount, {
            guestTokenIdentifier,
          });
          clearStoredAnonUserId();
          clearAnonymousTokenCache();
        } else {
          await client.mutation(api.users.syncCurrentUser, {});
        }
      } catch {
        /* invalid guest id or already merged */
        clearStoredAnonUserId();
      } finally {
        graduating = false;
      }
    }

    $effect(() => {
      const mode = authMode;

      if (mode === "idle") {
        convexAuthReady.ready = false;
        return;
      }

      let active = true;
      convexAuthReady.ready = false;

      if (mode === "clerk") {
        clearAnonymousTokenCache();
        client.setAuth(
          async ({ forceRefreshToken }) => {
            const { session } = clerk;
            if (!session) {
              return null;
            }
            try {
              return await session.getToken({
                template: "convex",
                skipCache: forceRefreshToken,
              });
            } catch {
              return null;
            }
          },
          (confirmed) => {
            if (!active) return;
            if (!confirmed) {
              convexAuthReady.ready = false;
              return;
            }
            void syncClerkUserRow().finally(() => {
              if (active) {
                convexAuthReady.ready = true;
              }
            });
          },
        );
      } else if (convexUrl) {
        const siteUrl = convexSiteUrl(convexUrl);
        client.setAuth(
          async ({ forceRefreshToken }) => {
            try {
              return await resolveAnonymousConvexToken(
                siteUrl,
                forceRefreshToken,
              );
            } catch {
              return null;
            }
          },
          (confirmed) => {
            if (!active) return;
            convexAuthReady.ready = confirmed;
          },
        );
      }

      return () => {
        active = false;
      };
    });
  }
</script>
