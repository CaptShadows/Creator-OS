# Creator OS Data Model

This document defines the initial conceptual model. It is not yet a migration specification.

## Rule: content is not a platform post

A piece of content exists independently from where it is published.

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
- campaignId
- createdAt
- updatedAt

Candidate workflow:

```text
idea -> scripted -> filmed -> editing -> ready -> scheduled -> published -> archived
```

Do not hard-code this workflow until actual usage validates it.

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
- compensation
- notes
- brief reference

### Deliverable

A required campaign output. A deliverable may link to Content when creative work begins.

### Product

Represents an item promoted through Amazon, TikTok Shop, ShopMy, Tribe, brand campaigns, or other approved channels.

A Product should not be owned by one platform. Platform-specific listings/affiliate links should be child records or mappings.

## Metrics strategy

Never assume metrics are semantically identical across platforms. Normalize only metrics with sufficiently similar meaning. Preserve platform-specific values in typed extension fields or validated JSON when necessary.

Store provenance:

- where the value came from
- when it was captured
- which external object it represents
- whether the snapshot is complete

## Deletion strategy

User-created content should favor recoverable/archive semantics over destructive deletion. External records may require tombstones or sync markers when APIs report deletion.

## Open questions

- Exact campaign/payment model
- Affiliate commission granularity
- Whether assets/B-roll need first-class records in v1
- Which content statuses Tonya actually uses
- Whether manual metric entry is needed for every platform
- Retention policy for high-frequency metric snapshots
