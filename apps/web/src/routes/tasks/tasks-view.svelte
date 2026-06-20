<script lang="ts">
  import type { Id } from "$convex/_generated/dataModel";
  import { api } from "$convex/_generated/api";
  import { Button, SubmitButton } from "@repo/ui-svelte";
  import { cn } from "@repo/utils";
  import { focusRing } from "@repo/utils/focus";
  import { useConvexClient, useQuery } from "convex-svelte";
  import { openAuthModal } from "$lib/auth-ui.svelte";
  import { convexAuthReady } from "$lib/convex-clerk-ready.svelte";
  import { useTranslation } from "$lib/i18n";

  const { t } = useTranslation();

  const tasksQuery = useQuery(api.tasks.list, () =>
    convexAuthReady.ready ? {} : "skip",
  );
  const accountQuery = useQuery(api.users.accountStatus, () =>
    convexAuthReady.ready ? {} : "skip",
  );
  const client = useConvexClient();

  let pending = $state(false);
  let createError = $state<string | null>(null);

  async function createFromForm(event: SubmitEvent) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const title = String(data.get("title") ?? "").trim();
    if (!title) return;
    pending = true;
    createError = null;
    try {
      await client.mutation(api.tasks.create, { title });
      form.reset();
    } catch (error) {
      createError = error instanceof Error ? error.message : t("common.error");
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

  function handleSignUp() {
    openAuthModal("/tasks");
  }

  const tasks = $derived(tasksQuery.data);
  const account = $derived(accountQuery.data);
  const queryError = $derived(tasksQuery.error?.message ?? null);
  const isAuthError = $derived(
    queryError?.includes("Not authenticated") ?? false,
  );

  const isWaitingForTasks = $derived(
    !convexAuthReady.ready ||
      tasksQuery.isLoading ||
      (tasks === undefined && (queryError === null || isAuthError)),
  );

  const isGuest = $derived(account?.isGuest ?? false);
  const atGuestLimit = $derived(
    isGuest &&
      account !== undefined &&
      account.taskLimit !== null &&
      account.taskCount >= account.taskLimit,
  );
  const limitMessage = $derived(
    account?.taskLimit !== null && account?.taskLimit !== undefined
      ? t("tasks.guestLimit", {
          count: account?.taskCount ?? 0,
          limit: account.taskLimit,
        })
      : null,
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
    <p class="text-muted-foreground mb-4 text-sm">{t("tasks.subtitle")}</p>

    {#if account}
      <section
        class="border-border bg-muted/30 mb-6 flex gap-3 rounded-md border p-4"
        aria-label={t("tasks.accountConvexLabel")}
      >
        {#if !isGuest && account.imageUrl}
          <img
            src={account.imageUrl}
            alt=""
            class="size-10 shrink-0 rounded-full object-cover"
          />
        {:else}
          <div
            class="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-medium"
            aria-hidden="true"
          >
            {isGuest ? "?" : (account.displayName?.[0] ?? "?").toUpperCase()}
          </div>
        {/if}
        <div class="min-w-0">
          <p class="text-sm font-medium">
            {isGuest
              ? t("tasks.anonymous")
              : (account.displayName ?? t("tasks.anonymous"))}
          </p>
          <p class="text-muted-foreground truncate text-sm">
            {isGuest
              ? t("tasks.guestSession")
              : (account.email ?? t("tasks.noEmail"))}
          </p>
        </div>
      </section>
    {/if}

    {#if isGuest && limitMessage}
      <p class="text-muted-foreground mb-4 text-sm" role="status">
        {limitMessage}
      </p>
    {/if}

    {#if atGuestLimit}
      <div
        class="border-border bg-muted/50 mb-6 rounded-md border px-4 py-3 text-sm"
        role="status"
      >
        <p class="mb-2">
          {t("tasks.guestLimitReached", { limit: account!.taskLimit! })}
        </p>
        <button
          type="button"
          class={cn("text-primary font-medium underline", focusRing)}
          onclick={handleSignUp}
        >
          {t("tasks.signUpToContinue")}
        </button>
      </div>
    {/if}

    <form class="mb-4 flex gap-2" onsubmit={createFromForm}>
      <label class="sr-only" for="task-title">{t("tasks.newPlaceholder")}</label
      >
      <input
        id="task-title"
        name="title"
        type="text"
        required
        maxlength={500}
        disabled={atGuestLimit}
        placeholder={t("tasks.newPlaceholder")}
        class="border-input bg-background focus-visible:ring-ring flex-1 rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      />
      <SubmitButton
        variant="primary"
        size="md"
        {pending}
        disabled={atGuestLimit}
        pendingLabel={t("common.loading")}
      >
        {t("tasks.add")}
      </SubmitButton>
    </form>

    {#if createError}
      <p class="text-destructive mb-4 text-sm" role="alert">
        {createError.includes("Guest task limit")
          ? t("tasks.guestLimitReached", { limit: account?.taskLimit ?? 3 })
          : createError}
      </p>
    {/if}

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
