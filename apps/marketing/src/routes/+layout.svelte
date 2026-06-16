<script lang="ts">
  import "../app.css";
  import { SITE_NAME } from "$lib/site";

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href="/favicon.svg" />
</svelte:head>

<div class="flex min-h-screen flex-col">
  <header class="border-border border-b">
    <nav class="container mx-auto flex items-center justify-between px-4 py-3">
      <a href="/" class="text-lg font-semibold">{SITE_NAME}</a>
      <a
        href="/blog"
        class="text-muted-foreground hover:text-foreground text-sm">Blog</a
      >
    </nav>
  </header>
  <main class="flex-1">
    {@render children()}
  </main>
  <footer
    class="border-border text-muted-foreground border-t py-8 text-center text-sm"
  >
    <p>&copy; {new Date().getFullYear()} {SITE_NAME}</p>
  </footer>
</div>
