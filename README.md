# Creator OS

Creator OS is a LAN-first creator operations platform for Tonya's content business. It uses proven architectural lessons from Netrunner OS without inheriting Netrunner-specific domains or visual identity.

The goal is not to build another analytics dashboard. The goal is to replace the workflow currently scattered across memory, messages, platform apps, and Google Drive with one primary workspace.

## Product north star

Creator OS should let Tonya open one place and immediately know:

1. What needs to be filmed today?
2. Which campaigns, deliverables, samples, or payments need attention?
3. What content is ready, scheduled, or already posted?
4. What is performing across platforms?
5. Which products/opportunities are worth acting on?

Normal creator operations should happen inside Creator OS whenever technically practical. External systems should increasingly become integrations, data sources, storage backends, editing tools, or publishing destinations rather than places Tonya must repeatedly visit to understand her business.

## Context-switch target

Target at least 80% of normal operational interactions inside Creator OS.

Expected first-class internal workflows:

- Morning planning
- Idea capture
- Script/caption work
- Filming plan
- Content lifecycle tracking
- Campaign and deliverable tracking
- Sample tracking
- Payment tracking
- Content calendar
- Cross-platform analytics
- Opportunity/product discovery where reliable data exists

Specialist tools may remain external when recreating them would be wasteful or less reliable. Examples include video/image editing and large binary asset storage.

## Working navigation

The earlier platform-first navigation is superseded by a workflow-first model:

- Overview
- Calendar
- Create
- Campaigns
- Products
- Analytics
- Platforms

`Platforms` contains specialized views for:

- Instagram
- Facebook
- TikTok
- YouTube
- Amazon Influencer / Storefront
- ShopMy
- Tribe

TikTok may contain multiple accounts. TikTok Shop is initially treated as a TikTok commerce capability unless requirements justify a separate domain.

Viral Vue is intentionally out of scope.

## Core workflows

### Morning Command Center

Overview should prioritize today's work rather than vanity metrics:

- Film Today queue
- Due/overdue campaign deliverables
- Samples pending/arrived/content needed
- Ready-to-post content
- Upcoming deadlines
- Outstanding payments
- Revenue/commission snapshot where integrations permit
- Opportunity/trend signals where data is trustworthy

### Idea and content pipeline

Idea capture must be extremely low-friction. A spontaneous idea can begin as a single text field and gain structure later.

Conceptual lifecycle:

```text
Idea -> Scripting -> Ready to Film -> Filmed -> Edited -> Ready to Post -> Posted
```

These are domain states, not a requirement that Tonya manually click through every intermediate state. Derive or automate state only when the signal is reliable; otherwise prefer a simple explicit action over flaky automation.

### Campaign workflow

Campaigns are a core domain, not a later add-on. Creator OS should store:

- Brand
- Brief/reference material
- Deadline
- Compensation
- Payment state
- Required deliverables
- Individual deliverable progress
- Associated products/content/publications

A campaign with five required videos must visibly show completion progress and remaining work.

### Sample workflow

Sample tracking is a daily operational need.

Conceptual lifecycle:

```text
Requested -> Pending/Approved -> Shipped -> Arrived -> Content Needed -> Completed
```

Exact terminology should remain adjustable as real usage evolves.

### Payments and revenue

Creator OS should track campaign compensation and payment state. Compensation may contain multiple components such as fixed fees, commission, gifted product, or performance incentives.

Revenue and commission should be surfaced when reliable integrations or imports make that possible.

## Core domains

Creator OS should be organized around reusable domain concepts rather than platform-specific tables:

- Content
- Publications / distribution
- Platform accounts
- Campaigns
- Deliverables
- Brands
- Products
- Samples
- Payments / compensation
- Metric snapshots
- Creator settings
- Authentication / sessions / trusted devices
- Audit history

A single piece of content may publish to multiple platform accounts. A product may appear across multiple platforms and campaigns. Platform metrics should be stored historically rather than overwriting one current value.

## Platform role

Platforms are integrations and specialized views, not the center of the product.

```text
Creator OS domain
      |
Integration adapters
      |
Instagram / Facebook / TikTok / YouTube / Amazon / ShopMy / Tribe
```

External integrations must not own the core data model. Creator OS should be able to ingest data through official APIs, official exports, structured imports, or manual fallback without redesigning the creator domain.

## Asset strategy

Creator OS should own workflow metadata and references. Large binary assets may remain in a system such as Google Drive rather than turning Creator OS into a media-storage product.

The user should be able to access those assets through Creator OS even when the underlying file lives elsewhere.

## Client profiles

Creator OS preserves the responsive profile concept proven in Netrunner OS:

- Mobile
- Tablet
- Desktop
- Wall

The Wall profile is a first-class future target for a touch-enabled mounted display. It should answer the question "What do I need to do today?" from across the room using large touch targets and reduced information density.

## Architecture direction

```text
Browser clients
Mobile · tablet · desktop · wall
                    |
                    v
              Creator OS
                    |
      --------------------------------
      |            |        |        |
   Planning     Creation  Business  Analytics
      |            |        |        |
      ------------- Domain -----------
                    |
          Persistence + Adapters
             |              |
         PostgreSQL     External systems
```

Overview should be a projection over canonical domain state, not a separate source of truth. The Film Today queue, for example, should be derived from unfinished deliverables, deadlines, received samples, planned organic content, and explicit priorities.

## UX engineering principles

- Do not make Tonya maintain Creator OS.
- Never require information the system already has or can reliably derive.
- Preserve user-created work even when integrations fail.
- Prefer one-tap explicit state changes over unreliable "magic" detection.
- Never make a third-party API a single point of failure.
- Show stale data explicitly instead of breaking the page.
- Keep destructive actions rare and recoverable.
- Optimize for predictable daily use, not developer cleverness.

## Reliability principles

- Back up authoritative local data.
- Document every production dependency and recovery step.
- Provide tested rollback procedures before risky upgrades.
- Keep secrets server-side and out of Git.
- Isolate integration failures.
- Core content/calendar/campaign workflows must remain usable during platform outages.
- If recovery requires an undocumented action, update the SOP before considering the incident closed.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Data model](docs/DATA_MODEL.md)
- [UX principles](docs/UX_PRINCIPLES.md)
- [Platform integrations](docs/PLATFORM_INTEGRATIONS.md)
- [SOP index](docs/SOPS.md)
- [Deployment and rollback](docs/DEPLOYMENT.md)
- [Backup and recovery](docs/BACKUP_RECOVERY.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Roadmap](docs/ROADMAP.md)

## Development status

**Status: workflow validated / architecture foundation**

The initial workflow interview established the major operational pain points: no structured filming plan, ideas/scripts living in memory, briefs/deadlines buried in messages, no deliverable tracker, daily sample checking, and a need to track payments, commission, campaigns, and product opportunities from one workspace.

## Local development

Requirements: Node.js 22 or newer and npm.

```bash
git clone https://github.com/CaptShadows/Creator-OS.git
cd Creator-OS
npm ci
npm run dev
```

Open `http://localhost:3000`. The application boots without an environment file. Copy `.env.example` to `.env.local` only when optional local configuration is needed.

Run the full foundation checks before opening a pull request:

```bash
npm run lint
npm test
npm run build
```

Run the production build locally with `npm start` after `npm run build`. Deployment verification can call `GET /api/health`; a healthy process returns HTTP 200 with `{"status":"healthy"}` and service metadata.

See [architectural decisions](docs/DECISIONS.md) for foundation constraints future issues must preserve.

## Security

This repository must never contain credentials, access tokens, session cookies, API secrets, private keys, production database dumps, or exported private platform data.

Use environment variables and ignored local configuration for secrets. If the repository remains public, assume every committed line is internet-visible.
