<script lang="ts">
  import { chromeIconClass } from "../icon-chrome";

  let { class: className }: { class?: string } = $props();
</script>

<!-- Material Design "translate" icon (文 + A) -->
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="currentColor"
  class={chromeIconClass(className)}
  aria-hidden="true"
>
  <path
    d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v2h11.17c-.67 1.92-1.73 3.75-3.17 5.35-.93-1.03-1.7-2.16-2.31-3.35H4.69c.73 1.63 1.73 3.17 2.98 4.56L2.58 17.58 4 19l5-5 3.11 3.11.76-2.04zm5.63-5.07h-2l-4.5 12h1.5l1.12-3h4.75l1.13 3H23l-4.5-12zm-2.62 7-1.62-4.33L13.88 17h3.12z"
  />
</svg>
