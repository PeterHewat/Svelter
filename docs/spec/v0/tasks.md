# F-01 — Sample tasks

## Acceptance criteria

- Signed-in user can list only their own tasks (`convex/tasks.list`).
- User can create a task with a non-empty title (max 500 chars).
- User can toggle completion and delete owned tasks.
- Unauthenticated `list` / `create` / `update` / `remove` return not authenticated.
- Cross-user update/delete returns not authorized.

## UI (`/tasks`)

- Implemented in `apps/web/src/routes/tasks/+page.svelte` with `convex-svelte` `useQuery` / `useConvexClient().mutation`.
- Wrapped in `RequireAuth` — redirects unauthenticated users to `/login`.
- Shows loading while `useQuery` is undefined.
- Empty state when no tasks.
- Form uses `SubmitButton` for pending state.
- When `PUBLIC_CONVEX_URL` is missing, home shows backend setup instructions (no Convex hooks on `/tasks`).

## API

| Function       | Type     | Auth required |
| -------------- | -------- | ------------- |
| `tasks.list`   | query    | yes           |
| `tasks.create` | mutation | yes           |
| `tasks.update` | mutation | yes           |
| `tasks.remove` | mutation | yes           |

## Edge cases

- Whitespace-only title → validation error.
- Title over max length → `ConvexError` with message.
