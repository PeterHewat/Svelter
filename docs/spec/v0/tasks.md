# F-01 — Sample tasks

## Acceptance criteria

- Guest or signed-in user can list only their own tasks (`convex/tasks.list`).
- User can create a task with a non-empty title (max 500 chars).
- User can toggle completion and delete owned tasks.
- Unauthenticated `list` / `create` / `update` / `remove` return not authenticated.
- Guest users are limited to **3** tasks; signed-in users have no limit.
- Sign-in runs `users.mergeGuestSessionIntoAccount` (first sign-up upgrades the guest row; returning users merge into the existing account).
- Cross-user update/delete returns not authorized.

## UI (`/tasks`)

- Implemented in `apps/web/src/routes/tasks/+page.svelte` with `convex-svelte` `useQuery` / `useConvexClient().mutation`.
- Open to guests — anonymous Convex JWT issued on first visit; sign-up CTA when guest limit is reached.
- Shows loading while Convex auth (guest or Clerk) is not ready.
- Empty state when no tasks.
- Form uses `SubmitButton` for pending state.
- When `PUBLIC_CONVEX_URL` is missing, home shows backend setup instructions (no Convex hooks on `/tasks`).

## API

| Function                             | Type     | Auth required |
| ------------------------------------ | -------- | ------------- |
| `tasks.list`                         | query    | yes           |
| `tasks.create`                       | mutation | yes           |
| `tasks.update`                       | mutation | yes           |
| `tasks.remove`                       | mutation | yes           |
| `users.accountStatus`                | query    | yes           |
| `users.syncCurrentUser`              | mutation | Clerk only    |
| `users.mergeGuestSessionIntoAccount` | mutation | Clerk only    |

## Edge cases

- Whitespace-only title → validation error.
- Title over max length → `ConvexError` with message.
- Fourth guest task → `Guest task limit reached (3)`.
