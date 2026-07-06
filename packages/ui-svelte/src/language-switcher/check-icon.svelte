<script lang="ts">
  import { chromeMenuCheckIconClass } from "../icon-chrome";

  let { class: className }: { class?: string } = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  class={chromeMenuCheckIconClass(className)}
  aria-hidden="true"
>
  <path d="M20 6 9 17l-5-5" />
</svg>
