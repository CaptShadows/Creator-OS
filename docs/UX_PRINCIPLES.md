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

### 11. Do not optimize for developer cleverness

A simpler implementation that is easier to diagnose and recover is preferable to an elegant abstraction that increases operational uncertainty.

### 12. Add features only when they reduce work

A feature that creates another thing Tonya has to maintain is not automatically useful. New features should remove steps, consolidate information, prevent missed obligations, or improve decisions.

### 13. Reliability is UX

A technically recoverable system that frequently appears broken is still a bad product. Integration failures, stale data, loading states, and partial availability must be designed intentionally.

## Context-switch target

Target at least 80% of routine creator operations inside Creator OS.

This is a product direction, not an excuse to rebuild specialist products such as Canva, CapCut, Google Drive, or accounting software poorly inside Creator OS.
