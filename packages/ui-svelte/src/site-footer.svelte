<script lang="ts">
  import { siteFooterClass } from "@repo/utils/chrome";

  interface Props {
    /** Localized copyright line, e.g. `© 2026 Svelter`. */
    copyright: string;
    /** Optional marketing site URL for the copyright line. */
    homeHref?: string;
  }

  let { copyright, homeHref }: Props = $props();
</script>

<footer class={siteFooterClass}>
  {#if homeHref}
    <p>
      <a
        href={homeHref}
        class="text-muted-foreground hover:text-foreground transition-colors"
      >
        {copyright}
      </a>
    </p>
  {:else}
    <p>{copyright}</p>
  {/if}
</footer>
