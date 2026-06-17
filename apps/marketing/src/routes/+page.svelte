<!-- Root locale redirect is handled by /init.js when JavaScript is enabled. -->
<script lang="ts">
  import "../app.css";
  import LocaleHub from "$lib/components/locale-hub.svelte";
  import { mt } from "$lib/i18n";
  import { SITE_NAME } from "$lib/site";
</script>

<svelte:head>
  <title>{SITE_NAME} — {mt("language.hubTitle", "en")}</title>
</svelte:head>

<LocaleHub class="min-h-screen" />
