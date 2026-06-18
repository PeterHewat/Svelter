<script lang="ts">
  import { onMount } from "svelte";
  import { useTranslation } from "$lib/i18n";
  import BackendSetup from "$lib/components/backend-setup.svelte";
  import { openAuthModal } from "$lib/auth-ui.svelte";
  import { isAuthEnabled } from "$lib/backend";
  import { mayHaveClerkSession } from "$lib/clerk-session-hint";
  import { focusRing } from "@repo/utils/focus";

  const { t } = useTranslation();

  /** Cookie heuristic — home renders before ClerkProvider mounts on `/`. */
  let hasSessionHint = $state(false);

  onMount(() => {
    hasSessionHint = mayHaveClerkSession();
  });
</script>

<div class="mx-auto max-w-2xl text-center">
  <h1 class="mb-2 text-4xl font-bold">{t("home.title")}</h1>
  <p class="text-muted-foreground mb-8">{t("home.subtitle")}</p>

  <section class="text-left">
    <h2 class="mb-4 text-xl font-semibold">{t("home.features.title")}</h2>
    <ul class="text-muted-foreground list-disc space-y-2 pl-5 text-sm">
      <li>{t("home.features.svelte")}</li>
      <li>{t("home.features.convex")}</li>
      <li>{t("home.features.auth")}</li>
      <li>{t("home.features.tailwind")}</li>
      <li>{t("home.features.i18n")}</li>
      <li>{t("home.features.themes")}</li>
    </ul>
  </section>

  <BackendSetup />

  {#if isAuthEnabled()}
    <p class="mt-8">
      {#if hasSessionHint}
        <a href="/tasks" class="text-primary underline {focusRing}">
          {t("nav.tasks")} →
        </a>
      {:else}
        <button
          type="button"
          class="text-primary cursor-pointer underline {focusRing}"
          onclick={() => openAuthModal("/tasks")}
        >
          {t("nav.tasks")} →
        </button>
      {/if}
    </p>
  {/if}
</div>
