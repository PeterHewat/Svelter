<script lang="ts">
  import { siteFooterClass } from "@repo/utils/chrome";

  interface Props {
    /** Localized copyright line, e.g. `© 2026 Svelter`. */
    copyright: string;
  }

  let { copyright }: Props = $props();
</script>

<footer class={siteFooterClass}>
  <p>{copyright}</p>
</footer>
