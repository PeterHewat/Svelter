# Feature Development

Implement this feature following these guidelines:

- **Requirements Analysis**: Break down the feature into clear, testable requirements
- **Component Design**: Create reusable, composable components using our design system
- **Data Flow**: Use `convex-svelte` `useQuery` / `useConvexClient().mutation` — not `fetch` / `useEffect` for server state
- **State Management**: Use Convex for server state; local UI state with Svelte 5 runes (`$state`, `$derived`)
- **Authentication**: Integrate with Clerk via `svelte-clerk`; protect routes with auth gates where needed
- **Styling**: Use Tailwind with our `cn()` utility for class merging
- **Type Safety**: Strict TypeScript, use Convex schema validation with `v.object({})`
- **Error Handling**: Proper error states, loading states, and user feedback
- **Accessibility**: Semantic HTML, ARIA attributes, keyboard navigation
- **Testing**: Write unit tests (Vitest) and E2E tests (Playwright) alongside implementation
- **Documentation**: Update relevant docs in `docs/` for architectural changes

Ensure the implementation:

- Follows the monorepo structure (`apps/web/`, `packages/ui-svelte/`, `packages/utils/`)
- Adheres to Svelte 5 and SvelteKit patterns and best practices
- Is mobile-responsive and follows our design system
- Handles loading and error states gracefully
