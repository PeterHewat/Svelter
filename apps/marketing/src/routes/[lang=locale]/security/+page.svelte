<script lang="ts">
  import TemplateStubPage from "$lib/components/template-stub-page.svelte";
  import { useMarketingT } from "$lib/marketing-context";
  import { marketingContent } from "$lib/marketing-content";

  const t = useMarketingT();
  const stub = marketingContent.stubs.security;
</script>

<TemplateStubPage
  titleKey="pages.security.title"
  descriptionKey="meta.securityDescription"
  paragraphs={[stub.intro]}
>
  <section class="mt-12 max-w-3xl overflow-x-auto">
    <h2 class="text-2xl font-semibold">{t("security.subprocessorsTitle")}</h2>
    <table class="mt-4 w-full border-collapse text-left text-sm">
      <thead>
        <tr class="border-b">
          <th class="py-3 pr-4 font-medium">{t("security.subprocessorName")}</th
          >
          <th class="py-3 pr-4 font-medium">
            {t("security.subprocessorPurpose")}
          </th>
          <th class="py-3 font-medium">
            {t("security.subprocessorLocation")}
          </th>
        </tr>
      </thead>
      <tbody>
        {#each stub.subprocessors ?? [] as row (row.name)}
          <tr class="border-b">
            <td class="py-3 pr-4">{row.name}</td>
            <td class="text-muted-foreground py-3 pr-4">{row.purpose}</td>
            <td class="text-muted-foreground py-3">{row.location}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>
</TemplateStubPage>
