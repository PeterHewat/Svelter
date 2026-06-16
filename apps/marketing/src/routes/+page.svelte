<script lang="ts">
  import { SITE_NAME, SITE_TAGLINE } from "$lib/site";

  const title = `${SITE_NAME} - ${SITE_TAGLINE}`;
  const description =
    "A production-ready monorepo template for product and marketing with SvelteKit, Clerk, Convex, and Tailwind.";
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
</svelte:head>

<section class="bg-primary text-primary-foreground py-20">
  <div class="container mx-auto px-4 text-center">
    <h1 class="mb-4 text-5xl font-bold">Build faster with {SITE_NAME}</h1>
    <p class="mb-8 text-xl opacity-90">
      A production-ready monorepo template for product and marketing.
    </p>
    <a
      href="/blog"
      class="text-primary inline-block rounded-lg bg-white px-8 py-3 font-semibold transition-colors hover:bg-gray-100"
    >
      Read the blog
    </a>
  </div>
</section>

<section class="bg-muted/30 py-20">
  <div class="container mx-auto px-4">
    <h2 class="mb-12 text-center text-3xl font-bold">Features</h2>
    <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
      <div class="text-center">
        <h3 class="mb-4 text-xl font-semibold">SvelteKit Everywhere</h3>
        <p class="text-muted-foreground">
          One framework for your product SPA and static marketing site.
        </p>
      </div>
      <div class="text-center">
        <h3 class="mb-4 text-xl font-semibold">Clerk + Convex</h3>
        <p class="text-muted-foreground">
          Hosted auth with social providers and a realtime Convex backend.
        </p>
      </div>
      <div class="text-center">
        <h3 class="mb-4 text-xl font-semibold">Lean Deploy</h3>
        <p class="text-muted-foreground">
          Static marketing on any CDN; product app on Vercel.
        </p>
      </div>
    </div>
  </div>
</section>
