<script lang="ts">
  import { api } from "$convex/_generated/api";
  import { useQuery } from "convex-svelte";
  import { convexAuthReady } from "$lib/convex-clerk-ready.svelte";
  import { useTranslation } from "$lib/i18n";

  const { t } = useTranslation();

  const accountQuery = useQuery(api.users.accountStatus, () =>
    convexAuthReady.ready ? {} : "skip",
  );

  const account = $derived(accountQuery.data);
  const isGuest = $derived(account?.isGuest ?? false);
  const isWaiting = $derived(
    !convexAuthReady.ready ||
      accountQuery.isLoading ||
      (account === undefined && accountQuery.error === null),
  );
</script>

{#if accountQuery.error}
  <p class="text-destructive mt-24 text-center text-sm" role="alert">
    {t("common.error")}
  </p>
{:else if isWaiting}
  <p class="text-muted-foreground mt-24 text-center" role="status">
    {t("common.loading")}
  </p>
{:else}
  <div class="mx-auto w-full max-w-lg">
    <h1 class="mb-6 text-3xl font-bold">{t("user.title")}</h1>

    <section
      class="border-border bg-muted/30 flex gap-3 rounded-md border p-4"
      aria-label={t("tasks.accountConvexLabel")}
    >
      {#if !isGuest && account!.imageUrl}
        <img
          src={account!.imageUrl}
          alt=""
          class="size-10 shrink-0 rounded-full object-cover"
        />
      {:else}
        <div
          class="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-medium"
          aria-hidden="true"
        >
          {isGuest ? "?" : (account!.displayName?.[0] ?? "?").toUpperCase()}
        </div>
      {/if}
      <div class="min-w-0">
        <p class="text-sm font-medium">
          {isGuest
            ? t("tasks.anonymous")
            : (account!.displayName ?? t("tasks.anonymous"))}
        </p>
        <p class="text-muted-foreground truncate text-sm">
          {isGuest
            ? t("tasks.guestSession")
            : (account!.email ?? t("tasks.noEmail"))}
        </p>
      </div>
    </section>
  </div>
{/if}
