<script lang="ts">
  import Section from "$lib/components/section.svelte";
  import { useMarketingT } from "$lib/marketing-context";
  import {
    marketingContent,
    type TestimonialItem,
  } from "$lib/marketing-content";
  import { iconButtonClass } from "@repo/utils/chrome";

  interface Props {
    /** Carousel items — defaults to homepage testimonials. */
    items?: readonly TestimonialItem[];
  }

  let { items = marketingContent.testimonials }: Props = $props();

  const t = useMarketingT();

  const first = $derived(items[0]);
  const testimonialsJson = $derived(JSON.stringify(items));
  const tallestAttribution = $derived(
    items.reduce(
      (longest, item) =>
        item.name.length + item.role.length >
        longest.name.length + longest.role.length
          ? item
          : longest,
      items[0],
    ),
  );
  const showControls = $derived(items.length > 1);
</script>

<Section title={t("home.testimonialTitle")}>
  <div
    class="testimonial-carousel mx-auto flex max-w-4xl items-center gap-2 md:gap-4"
    data-testimonial-carousel
    data-testimonials={testimonialsJson}
    data-testimonial-label-prev={t("home.testimonialPrev")}
    data-testimonial-label-next={t("home.testimonialNext")}
  >
    {#if showControls}
      <button
        type="button"
        class={iconButtonClass("testimonial-nav-btn shrink-0")}
        data-testimonial-prev
        aria-label={t("home.testimonialPrev")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-5 w-5 shrink-0"
          aria-hidden="true"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
    {/if}

    <figure class="min-w-0 flex-1">
      <div class="flex justify-center">
        <blockquote
          class="testimonial-quote text-left text-xl leading-relaxed font-medium md:text-2xl"
        >
          <span
            class="testimonial-quote-ghost invisible select-none"
            aria-hidden="true"
            data-testimonial-quote-ghost
          >
            “{first.quote}”
          </span>
          <span
            class="testimonial-quote-visible"
            data-testimonial-quote
            aria-live="polite"
          >
            {#if first}
              “{first.quote}”
            {/if}
          </span>
        </blockquote>
      </div>
      <figcaption class="testimonial-attribution mt-6 text-center">
        <div
          class="testimonial-attribution-ghost invisible select-none"
          aria-hidden="true"
        >
          <p class="font-semibold">{tallestAttribution.name}</p>
          <p class="text-muted-foreground text-sm">{tallestAttribution.role}</p>
        </div>
        <div
          class="testimonial-attribution-visible is-visible"
          data-testimonial-attribution-visible
        >
          <p class="font-semibold" data-testimonial-name>
            {first?.name ?? ""}
          </p>
          <p class="text-muted-foreground text-sm" data-testimonial-role>
            {first?.role ?? ""}
          </p>
        </div>
      </figcaption>
    </figure>

    {#if showControls}
      <button
        type="button"
        class={iconButtonClass("testimonial-nav-btn shrink-0")}
        data-testimonial-next
        aria-label={t("home.testimonialNext")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-5 w-5 shrink-0"
          aria-hidden="true"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    {/if}
  </div>
</Section>
