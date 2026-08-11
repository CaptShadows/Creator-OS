# Architectural decisions

## Foundation (issue #2)

- **Next.js App Router:** provides the React/TypeScript application, server routes, metadata, and route-level failure boundaries in one production-shaped runtime.
- **Tailwind CSS:** supplies responsive utilities while the small set of product tokens remains explicit in `app/globals.css`.
- **Vitest + Testing Library:** fast unit/component coverage without coupling tests to the production server.
- **Server configuration boundary:** server environment access lives under `lib/server/` and imports `server-only`. Browser components must not import from this directory.
- **Domain-free navigation:** the shell reads static workflow destinations from `lib/navigation.ts`; it does not depend on persistence or platform adapters.
- **No premature persistence:** `db/` is an explicit boundary only. PostgreSQL and Drizzle arrive with the dedicated persistence issue.

Future work must keep external integrations behind adapters, preserve workflow operation during integration failure, and treat Overview as a projection rather than a source of truth.
