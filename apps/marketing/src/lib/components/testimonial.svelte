<script lang="ts">
  import Section from "$lib/components/section.svelte";
  import { marketingContent } from "$lib/marketing-content";
</script>

<Section class="bg-muted/20">
  <figure class="mx-auto max-w-3xl text-center">
    <blockquote class="text-xl leading-relaxed font-medium md:text-2xl">
      “{marketingContent.testimonial.quote}”
    </blockquote>
    <figcaption class="mt-6">
      <p class="font-semibold">{marketingContent.testimonial.name}</p>
      <p class="text-muted-foreground text-sm">
        {marketingContent.testimonial.role}
      </p>
      <p class="text-muted-foreground mt-2 text-xs">
        Placeholder testimonial — replace in v1
      </p>
    </figcaption>
  </figure>
</Section>
