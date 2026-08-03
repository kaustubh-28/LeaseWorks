# LeaseWorks Engineering & Architectural Guidelines

Follow these rules exactly for any future edits, extensions, or refactoring in the LeaseWorks repository.

## 1. Prisma Architecture
- Use the singleton PrismaClient instance exported from `src/lib/server/prisma.ts`.
- **Do NOT** instantiate additional `PrismaClient` objects.
- **Do NOT** call `await prisma.$disconnect()` inside API endpoints, load functions, form actions, hooks, or any request lifecycle handlers. Keep the Prisma client alive for the lifetime of the application.
- Disconnect logic is only allowed in standalone scripts (e.g., `seed.ts`), migration/testing teardowns, or explicit application shutdown hooks.

## 2. Authentication & Route Protection
- Maintain the cookie-based JWT authentication lifecycle.
- **Do NOT trust role information inside the JWT alone.** Always fetch the latest User record from the database using the ID inside the verified JWT token to perform authorization decisions.
- Centralize route protection in `src/hooks.server.ts` to ensure role changes or disabled accounts immediately take effect.

## 3. Server / Client Separation
- Strictly isolate backend responsibilities (Prisma database calls, JWT verification, route authorization, financial/stat aggregates, mutation operations, and authoritative validation) in server-side files (e.g., `+page.server.ts`, `+layout.server.ts`, `+server.ts`, `hooks.server.ts`, or anything under `src/lib/server/`).
- Client-side files (`+page.svelte`, components, etc.) are only responsible for UI state, rendering, input state, animations, modal visibility, and UX-centric inputs.
- Never migrate business logic or direct database-derived calculations into Svelte UI components.

## 4. Repository Organization
- Adhere to SvelteKit conventions.
- Reusable UI elements belong in `src/lib/components` (or aliases like `$lib/components`).
- Server-only code must go into `src/lib/server` (`$lib/server`).
- Never import server-only code (or components calling server-only logic) into client bundles.

## 5. Generic & Schema Architecture
- Continue using the metadata-driven CRUD pattern (e.g. `EntityList.svelte`, `EntityForm.svelte`) for administrative grids.
- Avoid entity-specific list or form implementations unless absolutely necessary.
- When the schema is updated:
  1. Modify `schema.prisma`.
  2. Regenerate Prisma Client definitions.
  3. Update `FormFieldSchema` array definitions in `src/lib/entities.ts`.
  4. Align API endpoint validations.
  5. Adjust UI presentations.

## 6. Shared Validation Layer
- Consolidate validation rules to avoid duplication between form components and REST endpoints.
- Server-side validation is authoritative. Client-side validation exists for user experience (UX) only.
- Transition towards validation layers executing between the HTTP Request and the Prisma Database logic.

## 7. Error Handling Guidelines
- Return consistent JSON structures from API endpoints.
- **Never expose raw database/Prisma errors, SQL strings, stack traces, or internal implementation parameters to the client.**
- Log unexpected errors internally and present clean, user-friendly error messages.

## 8. Data Loading Philosophy
- **Prefer Server-Side Rendering (SSR)**: Fetch initial page data inside `+page.server.ts` or `+layout.server.ts` loaders.
- Minimize layout shifts caused by async data loading inside `onMount` hooks.
- Limit client-side data fetching to polling, live updates, or user-triggered interactions.
- Use SvelteKit invalidation (`invalidateAll()`) to refresh views after mutations instead of manual data refreshing.

## 9. Progressive Form Actions
- Gradually migrate CRUD page operations from client-side REST calls to standard SvelteKit Form Actions with progressive enhancement where applicable, preserving the current user experience.

## 10. Design Philosophy (Lease Works)
- Retain the editorial/financial ledger aesthetics of the "Lease Works" design identity.
- **Do NOT introduce modern SaaS dashboard conventions** like:
  - Glassmorphism, backdrop filters, or neon accents.
  - Large gradients or playful illustrations.
  - Excessive border radii (keep them to `rounded-sm`, 2px/4px).
  - Floating cards or non-hierarchical animations.
- Animation/motion should purely serve to guide hierarchy or user interaction.
