# Creator OS SOP Index

This is the operational entry point when Creator OS is deployed. Procedures should be executable by someone who did not write the feature.

## Required SOPs before production use

| SOP | Purpose | Status |
| --- | --- | --- |
| Initial deployment | Build a known-good host from scratch | Windows procedure defined; host rehearsal pending |
| Standard update | Safely deploy a new version | Windows procedure defined; host rehearsal pending |
| Rollback | Return to last known-good application version | Windows procedure defined; host rehearsal pending |
| Database backup | Produce a verified backup | Automated Windows procedure defined; restore rehearsal pending |
| Database restore | Restore authoritative data | Test procedure defined; host rehearsal pending |
| Secret rotation | Replace compromised/expired credentials | Planned |
| Platform reconnect | Recover an expired/revoked integration | Planned |
| Integration outage | Operate with stale/unavailable platform data | Planned |
| Host recovery | Recover after host/device failure | Core Windows procedure defined; host rehearsal pending |
| Client recovery | Recover a broken browser/client profile | Planned |
| Wall display recovery | Restore wall display operation | Planned |

## SOP writing standard

Every operational SOP should contain:

1. Purpose
2. Preconditions
3. Exact commands/actions
4. Expected result after each critical step
5. Verification procedure
6. Rollback or abort condition
7. Data-loss risk
8. Secret-handling notes
9. Last-tested date

An SOP that says only "restart the service" is not sufficient. It must identify the service, how to verify it restarted, and what to inspect if restart fails.

## Incident priority

1. Protect user-created data.
2. Restore core content/calendar access.
3. Restore application availability.
4. Restore platform integrations.
5. Refresh stale analytics.

Metrics being stale is lower severity than losing access to scripts, content records, campaign deadlines, or the calendar.

## Change discipline

For production-affecting changes:

1. Back up authoritative data when the change can affect persistence.
2. Record the currently deployed commit/version.
3. Validate build/tests before deployment.
4. Deploy one understood change set.
5. Run post-deploy verification.
6. Roll back if acceptance checks fail.
7. Update the relevant SOP when operational behavior changes.

## Documentation rule

If recovery required an undocumented command or manual fix, the incident is not finished until that knowledge is added to the appropriate SOP or troubleshooting document.