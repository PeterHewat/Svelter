<script lang="ts">
  import AboutTeamMemberCard from "$lib/components/about-team-member.svelte";
  import Reveal from "$lib/components/reveal.svelte";
  import Section from "$lib/components/section.svelte";
  import { useMarketingT } from "$lib/marketing-context";
  import { marketingContent } from "$lib/marketing-content";

  const t = useMarketingT();
</script>

<Section id="about" title={t("home.aboutTitle")}>
  <Reveal>
    <p
      class="text-muted-foreground mx-auto max-w-3xl text-center text-lg leading-relaxed"
    >
      {marketingContent.about.intro}
    </p>
  </Reveal>

  <ul
    class="mx-auto mt-12 grid max-w-5xl gap-10 sm:grid-cols-2 lg:grid-cols-3"
    role="list"
  >
    {#each marketingContent.about.team as member, index (member.id)}
      <Reveal as="li" delay={index * 80}>
        <AboutTeamMemberCard {member} />
      </Reveal>
    {/each}
  </ul>
</Section>
