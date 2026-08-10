# Creator OS UX Principles

Creator OS succeeds only if it remains useful enough to become routine.

## Primary user contract

The system should feel predictable. The same action should produce the same result, important state should be visible, and failures should explain themselves without requiring technical knowledge.

## Principles

### 1. Today's work first

The Overview should prioritize what needs attention now: scheduled content, campaign deadlines, unfinished work, and important sync warnings.

### 2. Do not make analytics block operations

If a platform API is unavailable, the calendar and content workflows must continue working. Show the last successful metrics with a stale indicator.

### 3. Reduce duplicate entry

A content item should be entered once and distributed to multiple platform publications. Avoid requiring the same title/script/campaign information on multiple platform pages.

### 4. Preserve drafts automatically

Where practical, long-form user input should be resilient to navigation mistakes, refreshes, and transient failures. The exact autosave design must be deliberate and testable.

### 5. Make destructive actions obvious

Archive should usually be preferred over delete. Permanent deletion should be rare and clearly differentiated.

### 6. Keep status understandable

Avoid hidden automation. If something is syncing, stale, failed, scheduled, or awaiting action, expose that state plainly.

### 7. Design per client profile

Mobile, tablet, desktop, and wall should share data but not blindly share density.

Wall design should favor:

- large touch targets
- today's schedule
- upcoming deadlines
- platform health
- glanceable KPIs
- minimal typing

### 8. Do not optimize for developer cleverness

A simpler implementation that is easier to diagnose and recover is preferable to an elegant abstraction that increases operational uncertainty.

### 9. Add features only when they reduce work

A feature that creates another thing Tonya has to maintain is not automatically useful. New features should remove steps, consolidate information, prevent missed obligations, or improve decisions.

### 10. Reliability is UX

A technically recoverable system that frequently appears broken is still a bad product. Integration failures, stale data, loading states, and partial availability must be designed intentionally.
