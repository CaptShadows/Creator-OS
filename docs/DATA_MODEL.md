# Creator OS Data Model

This document describes the implemented canonical model in `db/schema/domain.ts` and the migrations under `db/migrations`.

## Rule: workflow first, platform second

Creator OS is not seven separate platform databases. A piece of content exists independently from where it is published, a product may appear across multiple platforms, and a campaign may require multiple deliverables.

```text
Content
  |
  +-- Publication -> Instagram account
  +-- Publication -> TikTok account
  +-- Publication -> Facebook account
  +-- Publication -> YouTube account
```

This prevents duplicate content records when one video is repurposed across platforms.

## Core entities

### User

Application identity and ownership boundary.

### PlatformAccount

Represents a specific account/profile on a platform.

Candidate fields:

- id
- ownerUserId
- platform
- displayName
- handle
- externalAccountId
- accountType
- active
- metadata
- createdAt
- updatedAt

Multiple accounts for the same platform are allowed.

### Content

The canonical creative item.

Candidate fields:

- id
- ownerUserId
- title
- concept
- contentType
- contentPillar
- status
- statusBeforeArchive
- hook
- script
- caption
- notes
- priority
- plannedFilmDate
- createdAt
- updatedAt

Implemented lifecycle:

```text
idea -> scripting -> ready_to_film -> filmed -> edited -> ready_to_post -> posted
```

Normal transitions move one step forward or backward. Archive is an explicit action outside the normal lifecycle; `statusBeforeArchive` records the prior state so recovery returns the item to useful work rather than resetting it to Idea.

Content can optionally link to campaigns and products through owner-scoped many-to-many join tables. Platform associations are represented by draft Publication rows, preserving the rule that content exists independently of distribution.

### Publication

Represents distribution of Content to one PlatformAccount.

Candidate fields:

- id
- contentId
- platformAccountId
- status
- scheduledAt
- publishedAt
- externalPostId
- externalUrl
- platformCaptionOverride
- metadata
- createdAt
- updatedAt

### Brand

Canonical brand identity used across campaigns and products.

### Campaign

Represents a commercial or partnership engagement.

Candidate fields:

- id
- brandId
- name
- status
- startDate
- dueDate
- briefReference
- notes
- createdAt
- updatedAt

Campaign should not store all compensation in one opaque field. Compensation/payment components should be modeled separately.

### Deliverable

A required campaign output.

Candidate fields:

- id
- campaignId
- title
- status
- dueDate
- contentId
- requiredPlatformId or platform requirement metadata
- notes
- createdAt
- updatedAt

A campaign may have multiple deliverables. Progress such as 3/5 complete is derived from deliverable state.

### Product

Canonical product identity independent of platform.

Candidate fields:

- id
- brandId
- name
- category
- notes
- active
- createdAt
- updatedAt

Platform-specific listings, affiliate URLs, IDs, and commission metadata should be child mappings rather than separate canonical product tables.

### ProductPlatformListing

Maps Product to a platform-specific listing/opportunity.

Candidate fields:

- id
- productId
- platformAccountId or platform
- externalProductId
- externalUrl
- affiliateUrl
- commission metadata
- status
- metadata

### Sample

Tracks product/sample acquisition and required follow-up.

Candidate lifecycle:

```text
requested -> pending/approved -> shipped -> arrived -> content_needed -> completed
```

Candidate fields:

- id
- productId
- sourcePlatform
- status
- requestedAt
- approvedAt
- shippedAt
- receivedAt
- trackingReference
- notes
- createdAt
- updatedAt

The exact statuses should remain adjustable as real workflow evolves.

### Compensation

Represents one compensation component for a campaign.

Examples:

- fixed fee
- commission percentage
- gifted product
- performance incentive

Candidate fields:

- id
- campaignId
- type
- agreedAmount
- commissionRate
- expectedPaymentDate
- notes

### Payment

Tracks money expected/received against compensation or campaign work.

Candidate fields:

- id
- campaignId
- compensationId
- status
- expectedAmount
- receivedAmount
- dueAt
- receivedAt
- paymentReference
- notes

### AccountMetricSnapshot

Historical observation of account-level metrics.

Candidate fields:

- id
- platformAccountId
- capturedAt
- source
- followers
- views
- engagement values
- revenue/commission where account-level semantics are valid
- raw/extended metrics JSON
- contentHash

### PublicationMetricSnapshot

Historical observation of a specific publication.

Candidate fields:

- id
- publicationId
- capturedAt
- source
- views
- likes
- comments
- shares
- saves
- clicks
- conversions
- revenue/commission where applicable
- extended metrics JSON

Not every platform supports every metric. Null/absent metrics are valid.

## Derived operational views

Operational queues should be projections over canonical state rather than separately maintained collections.

### Film Today

Potential inputs:

- unfinished campaign deliverables
- approaching deadlines
- received samples requiring content
- planned organic content
- explicitly prioritized ideas
- content already scripted/ready to film

### Needs Attention

Potential inputs:

- overdue deliverables
- campaigns nearing deadline
- samples awaiting action
- outstanding payments
- failed/stale integrations
- ready-to-post content

### Campaign completion

Derived from campaign deliverable counts/statuses, not a manually maintained progress percentage.

## Asset references

Creator OS should model asset references without necessarily storing large binary media itself.

Potential entity:

### AssetReference

- id
- ownerUserId
- contentId / campaignId / deliverableId as applicable
- type
- provider
- externalId/path
- displayName
- metadata

## Implemented persistence decisions

- Every domain record uses an application-generated UUID primary key. External platform identifiers are ordinary nullable fields and never primary keys.
- Every domain table carries `owner_user_id` for explicit owner-scoped queries, including child records. Application services must verify that linked records share the authenticated owner before writing.
- Monetary fixed amounts are stored as integer cents; commission percentages are stored as integer basis points. This avoids floating-point money errors.
- Content and Sample use PostgreSQL enums for the validated lifecycle values documented above. Other statuses remain text until real workflow use provides enough evidence to freeze their vocabularies.
- Extension metadata is JSONB only at platform/integration boundaries and is validated by contracts in `lib/domain/contracts.ts` before writes.
- All user-created domain tables include `archived_at`. Normal product behavior should archive rather than permanently delete.
- Multiple accounts per platform are allowed. External account uniqueness is scoped to owner + platform + external identifier; platform itself is intentionally not unique.
- Multiple Payment rows may reference the same Compensation, allowing partial and final receipts without conflating expected compensation with received money.

## Foreign-key deletion policy

| Relationship | Behavior | Reason |
| --- | --- | --- |
| Owner → owned domain data | `CASCADE` | Owner removal is a deliberate whole-account operation outside normal UI flows. |
| Content → Publication | `RESTRICT` | Published/distribution history must be resolved or archived before content removal. |
| PlatformAccount → Publication | `RESTRICT` | Publications must not silently lose their distribution identity. |
| Campaign → Deliverable/Compensation/Payment | `RESTRICT` | Commercial obligations and receipts must remain intact. |
| Product → Listing/Sample | `RESTRICT` | Product workflow history must remain intact. |
| Brand → Campaign/Product | `SET NULL` | A duplicate/retired brand can be detached without destroying work. |
| Content → Deliverable | `SET NULL` | A deliverable remains an obligation even if a linked draft is removed. |
| Optional asset/integration links | `SET NULL` | Provider references remain inspectable without blocking parent archival cleanup. |

## Local fixture strategy

`db/fixtures/domain.ts` defines deterministic relationship fixtures, including two TikTok accounts, a campaign with two deliverables, and a product with two listings. After migrations and owner bootstrap, load them only into a non-production database:

```bash
OWNER_EMAIL='owner@example.com' npm run db:seed
```

The seed script refuses to run when `NODE_ENV=production` and uses conflict-safe inserts so it can support repeatable local regression work.

Google Drive or another approved storage system may remain the binary store.

## Metrics strategy

Never assume metrics are semantically identical across platforms. Normalize only metrics with sufficiently similar meaning. Preserve platform-specific values in typed extension fields or validated JSON when necessary.

Store provenance:

- where the value came from
- when it was captured
- which external object it represents
- whether the snapshot is complete
- whether the displayed value is stale

## Deletion strategy

User-created content, campaigns, products, scripts, and payment records should favor recoverable/archive semantics over destructive deletion. External records may require tombstones or sync markers when APIs report deletion.

## Open questions

- Exact payment/commission reconciliation detail
- Which sample statuses best match the source platforms
- Whether raw/edited video assets need richer first-class metadata in v1
- How frequently metric snapshots should be retained
- Which trend/opportunity data sources are reliable enough to ingest
- Which content state transitions can be safely derived automatically
