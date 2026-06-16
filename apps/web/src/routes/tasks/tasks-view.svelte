<script lang="ts">
  import type { Id } from "$convex/_generated/dataModel";
  import { api } from "$convex/_generated/api";
  import { Button, SubmitButton } from "@repo/ui-svelte";
  import { cn } from "@repo/utils";
  import { useConvexClient, useQuery } from "convex-svelte";
  import { convexClerkReady } from "$lib/convex-clerk-ready.svelte";
  import { useTranslation } from "$lib/i18n";

  const { t } = useTranslation();

  const tasksQuery = useQuery(api.tasks.list, () =>
    convexClerkReady.ready ? {} : "skip",
  );
  const client = useConvexClient();

  let pending = $state(false);

  async function createFromForm(event: SubmitEvent) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const title = String(data.get("title") ?? "").trim();
    if (!title) return;
    pending = true;
    try {
      await client.mutation(api.tasks.create, { title });
      form.reset();
    } finally {
      pending = false;
    }
  }

  async function toggleCompleted(id: Id<"tasks">, completed: boolean) {
    await client.mutation(api.tasks.update, { id, completed: !completed });
  }

  async function deleteTask(id: Id<"tasks">) {
    await client.mutation(api.tasks.remove, { id });
  }

  const tasks = $derived(tasksQuery.data);
  const queryError = $derived(tasksQuery.error?.message ?? null);
  const isAuthError = $derived(
    queryError?.includes("Not authenticated") ?? false,
  );

  const isWaitingForTasks = $derived(
    !convexClerkReady.ready ||
      tasksQuery.isLoading ||
      (tasks === undefined && (queryError === null || isAuthError)),
  );
</script>

{#if tasksQuery.error && !isAuthError}
  <p class="text-destructive mt-24 text-center text-sm" role="alert">
    {t("common.error")}
  </p>
{:else if isWaitingForTasks}
  <p class="text-muted-foreground mt-24 text-center" role="status">
    {t("common.loading")}
  </p>
{:else}
  <div class="mx-auto w-full max-w-lg">
    <h1 class="mb-2 text-3xl font-bold">{t("tasks.title")}</h1>
    <p class="text-muted-foreground mb-8 text-sm">{t("tasks.subtitle")}</p>

    <form class="mb-8 flex gap-2" onsubmit={createFromForm}>
      <label class="sr-only" for="task-title">{t("tasks.newPlaceholder")}</label
      >
      <input
        id="task-title"
        name="title"
        type="text"
        required
        maxlength={500}
        placeholder={t("tasks.newPlaceholder")}
        class="border-input bg-background focus-visible:ring-ring flex-1 rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
      />
      <SubmitButton
        variant="primary"
        size="md"
        {pending}
        pendingLabel={t("common.loading")}
      >
        {t("tasks.add")}
      </SubmitButton>
    </form>

    {#if tasks!.length === 0}
      <p class="text-muted-foreground text-center text-sm">
        {t("tasks.empty")}
      </p>
    {:else}
      <ul class="space-y-2" aria-label={t("tasks.listLabel")}>
        {#each tasks! as task (task._id)}
          <li
            class="border-border bg-card flex items-center gap-3 rounded-md border px-3 py-2"
          >
            <input
              id="task-complete-{task._id}"
              name="task-complete-{task._id}"
              type="checkbox"
              checked={task.completed}
              onchange={() => void toggleCompleted(task._id, task.completed)}
              aria-label={t("tasks.toggleComplete", { title: task.title })}
              class="border-input size-4 rounded"
            />
            <span
              class={cn(
                "flex-1 text-sm",
                task.completed && "text-muted-foreground line-through",
              )}
            >
              {task.title}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onclick={() => void deleteTask(task._id)}
              aria-label={t("tasks.delete", { title: task.title })}
            >
              {t("common.delete")}
            </Button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
{/if}
