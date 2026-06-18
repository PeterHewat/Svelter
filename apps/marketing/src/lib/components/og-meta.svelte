<script lang="ts">
  import { SITE_NAME } from "$lib/site";

  interface Props {
    title: string;
    description: string;
    url: string;
    type?: "website" | "article";
  }

  let { title, description, url, type = "website" }: Props = $props();
</script>

<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={url} />
<meta property="og:type" content={type} />
<meta property="og:site_name" content={SITE_NAME} />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
