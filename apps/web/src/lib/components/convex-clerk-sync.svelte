<script lang="ts">
  import { useConvexClient } from "convex-svelte";
  import { useClerkContext } from "svelte-clerk/client";
  import { convexClerkReady } from "$lib/convex-clerk-ready.svelte";
  import { isAuthEnabled } from "$lib/backend";

  if (!isAuthEnabled()) {
    convexClerkReady.ready = true;
  } else {
    const client = useConvexClient();
    const clerk = useClerkContext();

    $effect(() => {
      const { isLoaded, auth, session } = clerk;
      void auth.userId;
      void auth.orgId;
      void auth.orgRole;

      if (!isLoaded || !auth.userId || !session) {
        convexClerkReady.ready = false;
        client.setAuth(
          async () => null,
          () => {
            convexClerkReady.ready = false;
          },
        );
        return;
      }

      let active = true;
      convexClerkReady.ready = false;

      client.setAuth(
        async ({ forceRefreshToken }) => {
          try {
            if (auth.sessionClaims?.aud === "convex") {
              return await session.getToken({ skipCache: forceRefreshToken });
            }
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
          convexClerkReady.ready = confirmed;
        },
      );

      return () => {
        active = false;
      };
    });
  }
</script>
