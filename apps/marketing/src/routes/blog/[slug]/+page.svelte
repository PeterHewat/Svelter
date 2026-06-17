<!-- Legacy /blog/[slug] redirect is handled by /init.js when JavaScript is enabled. -->
<script lang="ts">
  import "../../../app.css";
  import LocaleHub from "$lib/components/locale-hub.svelte";

  let { data } = $props();
</script>

<LocaleHub path="blog/{data.slug}" class="min-h-screen" />
