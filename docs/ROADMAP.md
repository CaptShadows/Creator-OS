# Creator OS Roadmap

This roadmap is capability-based. Dates should be added only when there is a real delivery constraint.

## Implementation status — audited August 30, 2026

Phase 1 is deployed on the Windows production host. Issues #2–#12 are complete, including the application foundation, PostgreSQL/authentication, canonical domain model, responsive client profiles, Create workflow, campaigns/payments, products/samples, calendar, Overview command center, platform placeholders, and tested deployment/backup/restore/rollback procedures.

Additional delivered capabilities:

- configurable Overview layouts (#30)
- authenticated host-backed attachments (#23)
- PDF, PNG, JPG, and JPEG uploads with safe remote redirects (#68, #76, #80, #81)
- content/product priorities and priority-ordered Samples Needing Action (#71, #76–#79)
- Brand Deals workspace with Calendar milestones, optional Overview summaries, and selective campaign migration (#70, #74–#75, #82–#83)
- confirmed deletion, duplicate warnings, archive/recovery, account settings, Windows desktop shortcut, and background deployment

Live external platform adapters, opportunity discovery, and full cross-platform analytics remain future work.

## Phase 0 — Workflow validation

Completed enough to move forward.

Validated pain points:

- filming priorities currently live in memory
- spontaneous ideas/scripts live in memory
- brand briefs/deadlines live in messages
- deliverable completion is not centrally tracked
- completed brand videos are moved into Google Drive until posted
- samples require daily manual checking
- campaign payment tracking is needed
- revenue/commission should be surfaced where possible
- morning context is scattered across samples, commissions, campaigns, deadlines, and trending products

Primary jobs Creator OS should eliminate:

1. Track samples and required videos
2. Build a usable filming plan
3. Surface trending/up-and-coming product opportunities

Validated product north star:

**Open Creator OS -> see exactly what matters today -> do the work -> Creator OS records/derives progress.**

## Phase 1 — Reliable creator operations core

### Foundation

- Application shell
- Workflow-first navigation
- Authentication/session/trusted-device foundation
- PostgreSQL + Drizzle migrations
- Mobile/tablet/desktop/wall client profiles
- Core health checks
- Audit/event history where operationally useful
- `.env.example` and secret-handling policy

### Core domain models

Implement skeletal but correct models for:

- User
- PlatformAccount
- Content
- Publication
- Brand
- Campaign
- Deliverable
- Product
- ProductPlatformListing
- Sample
- Compensation
- Payment
- AssetReference
- Integration/sync state

Campaign/product/sample/payment entities are Phase 1 because they directly determine what content gets created and what requires attention.

### Overview / Morning Command Center

- What Needs Attention projection
- Film Today queue
- due/overdue deliverables
- sample status summary
- ready-to-post content
- upcoming campaign deadlines
- outstanding payment summary
- platform/sync health
- revenue/commission snapshot when data exists

Overview must query canonical domain state; it must not own duplicate task/progress data.

### Create / Content workflow

- ultra-low-friction `+ Idea` capture
- script/hook/caption workspace
- content create/edit/archive flows
- content lifecycle support
- link content to campaigns, deliverables, products, and publications
- manual state controls where automation is not reliable
- resilient draft/autosave behavior

Working content lifecycle:

```text
Idea -> Scripting -> Ready to Film -> Filmed -> Edited -> Ready to Post -> Posted
```

Do not require a manual click for every internal state if it can be derived reliably.

### Calendar

- month/week views
- content and campaign deadlines
- planned film dates
- publication schedules
- filters without duplicating underlying records

### Campaigns

- campaign create/edit/archive
- brief/reference storage
- deadlines
- multiple deliverables
- deliverable completion progress such as 3/5
- compensation components
- payment state
- links to products/content/publications/assets

### Samples

- requested/pending/approved/shipped/arrived/content-needed/completed tracking
- surface samples needing action
- link sample to canonical Product

### Reliability before first production use

- tested backup procedure
- tested restore procedure
- deployment SOP
- rollback SOP
- troubleshooting paths for core app/database/integration/client failures

**Exit condition:** Creator OS is useful for planning, content, campaigns, samples, and payments with zero live platform APIs, and can be restored after failure using documented procedures.

## Phase 2 — Commerce and asset workflow

- richer Product management
- platform product/listing mappings
- affiliate links/commission metadata
- Amazon-oriented product/content workflow
- ShopMy-oriented product workflow
- Tribe-oriented opportunity/campaign workflow
- TikTok Shop commerce capability under TikTok
- Google Drive or approved asset-provider integration
- expose linked briefs/raw/final assets through Creator OS
- keep large binary storage external unless a real requirement changes that decision

**Exit condition:** Creator OS owns the operational context for products, campaign assets, and commerce work without forcing repeated app/message hunting.

## Phase 3 — Platform adapters and live ingestion

Implement one adapter at a time based on value and API feasibility. Do not build all seven in parallel.

For every adapter:

- document authentication method
- document scopes/permissions
- document token expiry/refresh behavior
- document rate limits
- document account/publication/product/commerce data availability
- document historical limitations
- implement behind internal contract
- record last attempt / last success / error state
- implement stale-data behavior
- provide manual/import fallback where practical
- write reconnect SOP
- add regression tests

Platform backlog:

- Instagram
- Facebook
- TikTok (multiple accounts)
- YouTube
- Amazon Influencer / Storefront
- ShopMy
- Tribe

Viral Vue remains explicitly out of scope.

**Exit condition:** Live integrations reduce context switching but can fail individually without taking down creator operations.

## Phase 4 — Opportunity and product discovery

Goal: surface useful, trustworthy opportunities without inventing fake trend intelligence.

- ingest official/approved trend or opportunity sources where available
- sample opportunities
- campaigns/opportunities
- high-commission products
- seasonal opportunities
- trending/up-and-coming products
- source/provenance for every signal
- niche/performance ranking only after enough reliable data exists

Do not use brittle scraping or fabricated trend scores as a core dependency.

**Exit condition:** Product discovery saves meaningful manual checking and every recommendation can explain where its signal came from.

## Phase 5 — Cross-platform analytics and intelligence

- historical account growth
- publication performance history
- cross-platform content comparisons
- content pillar analysis
- format analysis
- posting-frequency analysis
- top-content reporting
- platform growth comparison
- campaign performance summaries
- commerce/revenue/commission views where supported
- data-quality and staleness indicators

Stats should answer decisions such as "what changed?" rather than merely show vanity metrics.

## Phase 6 — Wall display experience

- dedicated Wall composition using shared data/routes
- large touch targets
- Film Today
- upcoming deadlines
- sample status
- campaign progress
- ready-to-post content
- platform/sync health
- glanceable KPIs/revenue where useful
- minimal typing
- wall-client recovery SOP
- hardware-specific burn-in/always-on considerations

**Exit condition:** The wall answers "What do I need to do today?" without behaving like a stretched desktop dashboard.

## Phase 7 — Assisted intelligence

Only after Creator OS has enough reliable first-party operational/performance history.

- content-gap suggestions
- performance-informed content ideas
- filming-plan assistance
- campaign deadline assistance
- reusable hook/script/caption assistance
- brand/content context store
- optional AI integration through narrow server-side contracts
- explicit review/edit flow before generated material becomes canonical data

**Rule:** AI consumes Creator OS data. AI does not become the authoritative datastore.

## Ongoing operating requirements

These apply throughout development:

- keep troubleshooting docs current
- add undocumented recovery actions to SOPs
- record known-good production versions
- verify backups through restore tests
- isolate platform failures
- preserve user-created data during outages
- prefer archive/recovery over destructive deletion
- keep secrets out of client code and Git
- document infrastructure dependencies
- enforce a manual-entry budget
- avoid requiring information Creator OS already has or can reliably derive

## Context-switch target

Target at least 80% of normal creator operations inside Creator OS.

Expected 100% internal targets where practical:

- morning planning
- idea capture
- filming plan
- campaign tracking
- sample tracking
- payment tracking
- content calendar
- scripts/captions

External specialist handoffs are acceptable for tasks such as advanced video/image editing and binary storage.

## Current working navigation

- Overview
- Calendar
- Create
- Campaigns
- Brand Deals
- Products & Samples
- Analytics
- Platforms
- Account

Platforms contains specialized views for Instagram, Facebook, TikTok, YouTube, Amazon, ShopMy, and Tribe.

## Anti-roadmap

Do not prioritize these without demonstrated need:

- public multi-tenant SaaS
- complex enterprise RBAC
- all seven platform integrations simultaneously
- automated posting everywhere simply because an API exists
- recreating Canva/CapCut/Google Drive poorly inside Creator OS
- monorepo extraction solely for architectural aesthetics
- high availability infrastructure for a single-user LAN app
- platform-specific duplicate Content/Product models
- brittle scraping as a core dependency
- AI features before reliable data/workflows exist
