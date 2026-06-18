<script lang="ts">
  import Section from "$lib/components/section.svelte";
  import { mt, type Locale } from "$lib/i18n";
  import { localizedPath } from "$lib/locale-path";
  import { marketingContent } from "$lib/marketing-content";

  interface Props {
    lang: Locale;
  }

  let { lang }: Props = $props();

  const t = $derived(
    (key: Parameters<typeof mt>[0], vars?: Record<string, string | number>) =>
      mt(key, lang, vars),
  );
  const integrationsHref = $derived(localizedPath(lang, "integrations"));
</script>

<Section title={t("home.integrationsTitle")}>
  <ul
    class="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6"
    role="list"
  >
    {#each marketingContent.integrations.items as item (item.name)}
      <li>
        <div
          class="border-border bg-card text-muted-foreground flex h-16 items-center justify-center rounded-lg border px-2 text-center text-xs font-semibold"
        >
          {item.name}
        </div>
      </li>
    {/each}
  </ul>
  <p class="text-muted-foreground mt-6 text-center text-sm">
    {marketingContent.integrations.note}
  </p>
  <p class="mt-4 text-center">
    <a
      href={integrationsHref}
      class="text-primary text-sm font-medium hover:underline"
    >
      {t("home.integrationsLink")} →
    </a>
  </p>
</Section>
