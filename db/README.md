# Database boundary

PostgreSQL is the only authoritative Creator OS datastore. Drizzle schema modules live in `db/schema`, generated SQL migrations and their snapshots live in `db/migrations`, and operational scripts live in `db/scripts`.

Application code must use `getDatabase()` rather than creating independent pools. Browser storage must never become a fallback for authoritative creator data.

## Commands

- `npm run db:check` verifies connectivity.
- `npm run db:migrate` applies committed migrations and fails on an incompatible database.
- `npm run db:generate` creates a reviewed migration after a schema change.
- `npm run db:bootstrap-owner` creates the first owner from temporary environment variables.
- `OWNER_EMAIL=... npm run db:seed` loads deterministic development-only relationship fixtures.

Never use `drizzle-kit push` in production; production schema changes flow through reviewed, version-controlled migrations.
