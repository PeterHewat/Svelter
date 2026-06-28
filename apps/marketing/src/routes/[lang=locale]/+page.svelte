<script lang="ts">
  import Hero from "$lib/components/hero.svelte";
  import OgMeta from "$lib/components/og-meta.svelte";
  import { useMarketingT } from "$lib/marketing-context";
  import { homepageSections } from "$lib/homepage-sections";
  import { SITE_NAME } from "$lib/site";

  let { data } = $props();

  const t = useMarketingT();
  const title = $derived(`${SITE_NAME} - ${t("home.heroTagline")}`);
  const description = $derived(t("meta.homeDescription"));
  const canonicalUrl = $derived(`${data.origin}${data.pathname}`);
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <OgMeta {title} {description} url={canonicalUrl} />
</svelte:head>

<Hero />

{#each homepageSections as section (section.key)}
  {@const SectionComponent = section.component}
  <SectionComponent {...section.props ?? {}} />
{/each}
