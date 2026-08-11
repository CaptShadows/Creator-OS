# Creator OS Data Model

This document defines the initial conceptual model. It is not yet a migration specification.

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
- hook
- script
- caption
- notes
- priority
- plannedFilmDate
- createdAt
- updatedAt

Candidate lifecycle:

```text
idea -> scripting -> ready_to_film -> filmed -> edited -> ready_to_post -> posted -> archived
```

These are domain states, not a requirement for manual advancement through every state.

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
