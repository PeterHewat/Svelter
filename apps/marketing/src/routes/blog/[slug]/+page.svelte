<script lang="ts">
  let { data } = $props();
</script>

<svelte:head>
  <title>{data.post.title} — Svelter</title>
  <meta name="description" content={data.post.description} />
</svelte:head>

<article class="container mx-auto max-w-2xl px-4 py-16">
  <header class="mb-8">
    <h1 class="mb-2 text-4xl font-bold">{data.post.title}</h1>
    <p class="text-muted-foreground text-sm">
      {new Date(data.post.pubDate).toLocaleDateString()}
      {#if data.post.author}
        · {data.post.author}
      {/if}
    </p>
  </header>
  <div
    class="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-wrap"
  >
    {data.post.content}
  </div>
  <p class="mt-12">
    <a href="/blog" class="text-primary underline">← Back to blog</a>
  </p>
</article>
