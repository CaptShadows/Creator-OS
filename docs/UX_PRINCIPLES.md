# Creator OS UX Principles

Creator OS succeeds only if it becomes easier than the scattered workflow it replaces.

## Primary user contract

The system should feel predictable. The same action should produce the same result, important state should be visible, and failures should explain themselves without requiring technical knowledge.

The product must reduce mental/admin workload rather than creating another system Tonya has to maintain.

## Manual-entry budget

Creator OS should never require the user to enter information the system already possesses or can reliably derive.

Every manually entered field should justify its existence. Prefer defaults, inheritance, imports, derived state, and progressive disclosure over large forms.

A sophisticated backend is acceptable. A high-friction frontend is not.

## Principles

### 1. Today's work first

Overview should prioritize what needs attention now:

- Film Today queue
- campaign deadlines
- unfinished deliverables
- samples requiring action
- ready-to-post content
- outstanding payments
- meaningful sync warnings

Analytics supports decisions; it does not outrank operational work.

### 2. Creator OS is the workspace

Normal planning, idea capture, content tracking, campaign tracking, sample tracking, payment tracking, and calendar work should happen inside Creator OS whenever technically practical.

External systems should be intentional handoffs, not places the user must repeatedly search for basic operating context.

### 3. Capture first, structure later

Spontaneous ideas currently live in memory. Idea capture should therefore require almost nothing beyond the idea itself.

Do not force platform, campaign, product, status, date, or metadata fields before they are actually needed.

### 4. Do not make analytics block operations

If a platform API is unavailable, calendar, content, campaign, sample, and payment workflows must continue working. Show the last successful metrics with a stale indicator.

### 5. Reduce duplicate entry

A content item should be entered once and distributed to multiple platform publications. Avoid requiring the same title/script/campaign/product information on multiple platform pages.

### 6. Derive state carefully

Domain state may include steps such as Idea, Scripting, Ready to Film, Filmed, Edited, Ready to Post, and Posted.

Do not make the user manually advance every internal state if reliable system signals already exist. Conversely, do not pretend to automate state transitions when the signal is flaky. One explicit tap is better than unreliable magic.

### 7. Preserve drafts automatically

Where practical, long-form user input should be resilient to navigation mistakes, refreshes, and transient failures. Autosave behavior must be deliberate and testable.

The Create editor implements this contract as follows:

- PostgreSQL is authoritative; browser storage is never a second content database.
- Changed editor fields save after an 800 ms idle period.
- Each save includes the version (`updatedAt`) that the editor loaded. A conflicting server update returns `409` and is never silently overwritten.
- `localStorage` holds only an unsynced recovery buffer, scoped by both owner and content ID. A successful save clears it.
- A failed or offline save remains visibly pending and is retried after the next edit or reload rather than being presented as synced.
- Quick capture requires only one idea field. Type, pillar, associations, and long-form copy remain optional.

### 8. Make destructive actions obvious

Archive should usually be preferred over delete. Permanent deletion should be rare and clearly differentiated.

### 9. Keep status understandable

If something is syncing, stale, failed, scheduled, overdue, awaiting payment, shipping, or needing content, expose that state plainly.

### 10. Design per client profile

Mobile, tablet, desktop, and wall should share data but not blindly share density.

Wall design should favor:

- large touch targets
- today's filming plan
- upcoming deadlines
- sample status
- campaign progress
- platform/sync health
- glanceable revenue/commission where available
- minimal typing

The wall should answer: **What do I need to do today?**

### Implemented client profiles

The shared shell implements four presentation-only profiles:

- **Mobile:** one-column content, compact header, horizontally scrollable bottom navigation, and touch-sized controls.
- **Tablet:** two-column workspace density with the compact navigation model.
- **Desktop:** persistent workflow sidebar and full operational density.
- **Wall:** top-level horizontal navigation, larger typography/touch targets, three-column glanceable layout, and reduced secondary copy.

Automatic selection uses viewport width (`<640` Mobile, `<1024` Tablet, `<1920` Desktop, otherwise Wall). A browser-local Display profile control can override Auto for testing or a dedicated device. The preference is stored only in `localStorage` under `creator-os-client-profile`; it is presentation state, never creator/business data, and it does not change backend behavior.

All subsequent UI work should use the primitives under `components/ui` for headers, surfaces, statuses, lists, tables, empty states, errors, and touch actions. Profile-specific density should use the shared profile classes rather than branching application services or queries.

### 11. Do not optimize for developer cleverness

A simpler implementation that is easier to diagnose and recover is preferable to an elegant abstraction that increases operational uncertainty.

### 12. Add features only when they reduce work

A feature that creates another thing Tonya has to maintain is not automatically useful. New features should remove steps, consolidate information, prevent missed obligations, or improve decisions.

### 13. Reliability is UX

A technically recoverable system that frequently appears broken is still a bad product. Integration failures, stale data, loading states, and partial availability must be designed intentionally.

### Calendar projection and dates

Calendar is a projection over Content, Publication, Campaign, and Deliverable records; it does not maintain a duplicate event table. Date-only planning inputs are stored at UTC noon to prevent ordinary North American timezone offsets from shifting the displayed day. Queries use half-open `[start, end)` UTC ranges. Publication rescheduling updates the canonical Publication row.

## Context-switch target

Target at least 80% of routine creator operations inside Creator OS.

This is a product direction, not an excuse to rebuild specialist products such as Canva, CapCut, Google Drive, or accounting software poorly inside Creator OS.
