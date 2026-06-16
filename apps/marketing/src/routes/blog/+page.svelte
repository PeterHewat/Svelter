<script lang="ts">
  let { data } = $props();
</script>

<svelte:head>
  <title>Blog — Svelter</title>
</svelte:head>

<div class="container mx-auto px-4 py-16">
  <h1 class="mb-8 text-4xl font-bold">Blog</h1>
  <ul class="space-y-6">
    {#each data.posts as post (post.slug)}
      <li>
        <a href="/blog/{post.slug}" class="group block">
          <h2 class="group-hover:text-primary text-2xl font-semibold">
            {post.title}
          </h2>
          <p class="text-muted-foreground mt-1 text-sm">
            {new Date(post.pubDate).toLocaleDateString()}
            {#if post.author}
              · {post.author}
            {/if}
          </p>
          <p class="text-muted-foreground mt-2">{post.description}</p>
        </a>
      </li>
    {/each}
  </ul>
</div>
