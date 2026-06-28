<script lang="ts">
  import Reveal from "$lib/components/reveal.svelte";
  import Section from "$lib/components/section.svelte";
  import { useMarketingT } from "$lib/marketing-context";
  import { marketingContent } from "$lib/marketing-content";

  const t = useMarketingT();
</script>

<Section title={t("home.howItWorksTitle")}>
  <ol class="mx-auto grid max-w-5xl gap-8 md:grid-cols-3" role="list">
    {#each marketingContent.howItWorks.steps as step, index (step.title)}
      <Reveal as="li" delay={index * 80} class="text-center">
        <div
          class="bg-primary text-primary-foreground mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
          aria-hidden="true"
        >
          {index + 1}
        </div>
        <h3 class="mb-2 text-lg font-semibold">{step.title}</h3>
        <p class="text-muted-foreground text-sm leading-relaxed">{step.body}</p>
      </Reveal>
    {/each}
  </ol>
</Section>
