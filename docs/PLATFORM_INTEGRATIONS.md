# Platform Integrations

## Supported platform domains

- Instagram
- Facebook
- TikTok
- YouTube
- Amazon Influencer / Storefront
- ShopMy
- Tribe

Viral Vue is explicitly out of scope.

## Integration rule

Creator OS must not assume every platform provides the same API access or metrics. Each integration should implement a narrow internal contract and document its limitations.

Possible ingestion methods, in preferred order when practical:

1. Official API
2. Official export / report
3. Structured CSV import
4. Manual entry

Do not build brittle scraping into the core architecture merely to make a dashboard appear automated.

## Adapter responsibilities

A platform adapter may:

- resolve account identity
- fetch account metrics
- fetch publication metrics
- normalize supported fields
- preserve platform-specific extension data
- report sync health
- expose rate-limit/authentication failures

A platform adapter must not:

- own canonical Content records
- delete user-created data because a remote item disappears
- expose secrets to the browser
- silently substitute fabricated/estimated metrics

## Sync state

Every integration should eventually expose at least:

- enabled/disabled
- last attempted sync
- last successful sync
- current health state
- last error category
- whether displayed data is stale

## Platform notes

### Instagram / Facebook

Likely share Meta integration infrastructure where official access permits, but remain distinct PlatformAccounts and publication destinations.

### TikTok

Must support multiple accounts. TikTok Shop commerce data should initially be treated as a TikTok capability rather than a separate top-level platform.

### YouTube

Primary early focus is Shorts performance and channel growth.

### Amazon

Commerce-oriented presentation. Product/content relationships, clicks, conversion, and commission are more important than forcing Amazon into a social-network metric template.

### ShopMy

Commerce/affiliate-oriented presentation. Exact ingestion capabilities require validation before implementation.

### Tribe

Campaign/opportunity-oriented presentation may be more useful than traditional social analytics. Exact workflow and data access require validation.

## Before implementing any adapter

Document:

1. Authentication method
2. Permissions/scopes
3. Token lifetime/refresh behavior
4. Rate limits
5. Available account metrics
6. Available publication metrics
7. Historical-data limitations
8. Failure modes
9. Manual fallback
10. Reconnect SOP
