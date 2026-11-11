# Availability maintenance

Blaze approved the calendar policy on 2 November 2026 and the naming, authorization clarification and independent freshness monitor on 11 November 2026.

## Window and schedule

Show the current month in Europe/Warsaw and the next three months. Maintain a fifth month as a rollover buffer, without rendering it before it enters the visible window. Use getAvailabilityMonths and getPreparedAvailabilityMonths from src/utils/availabilityWindow.ts. Calculate the range on every run; never hardcode a year or final month.

Keep the existing cloud task "Refresh kunkeconsulting.pl availability" as the only scheduled writer. Its parent chat is "^Kunke website updater - keep active". Run once daily at 06:00 Europe/Warsaw, including weekends, with no end date. Do not add twice-daily updates or publication gates.

Recurring publication of the date/status snapshot is authorized. Instructions such as "do not change the website in this maintenance turn" apply to that maintenance turn, not subsequent scheduled refreshes. Respect later explicit changes or stop requests. For temporary calendar/network failures, preserve the previous snapshot and timestamps, report the failure, and leave future runs enabled. For a genuine approval or safety block, stop the blocked action and report its exact reason; never bypass it. Do not disable or reschedule tasks as a routine error-handling step. Changes to a recurring schedule require an explicit user request or an applicable platform requirement.

## Refresh

Read both personal and work Google calendars across the complete five-month range on every run. Fetch every page and include recurring occurrences, moved events and cancellations. Refresh earlier prepared dates as well as newly entering dates. An empty successful result differs from a failed or incomplete read. If either calendar cannot be read completely, retain the previous snapshot, updatedAt and checkedAt.

Update src/content/availability.ts with an explicit status for every date through the last day of the fifth month. Set existing past dates to unavailable. Only after the full refresh succeeds, set checkedAt to the actual current UTC timestamp (ISO 8601 with Z) and updatedAt to that instant's Warsaw date, even when statuses did not change. Never advance either timestamp for a failed read or a deployment-only change. Both language routes expose the exact checkedAt timestamp in their time element's data-availability-checked-at attribute; the visible date stays unchanged in format.

Publish only day statuses, date-only protections and refresh timestamps. Event titles, descriptions, attendees, locations and private reasons must stay out of the repository and website.

## Rules and protections

- Every Sunday is unavailable.
- Every December 20 through January 3, inclusive, is unavailable, across every year boundary.
- Additional protections belong in availabilityProtectedRanges in src/content/availability.ts as inclusive ISO date ranges. Add, change or remove them only at Blaze's explicit request. Keep their reasons private. Preserve them on every refresh; an empty calendar does not cancel a protection.
- Preserve isAvailabilityWorkingDay and isAvailabilityProtectedDate. Protected dates override calendar-derived entries in both month grids and the next-free-days summary.
- Saturdays are unavailable when blocked, otherwise partially available; never fully available.
- Preserve the existing weekday policy: ignore transparent personal events, routine reminders/placeholders and isolated short events of about two hours or less. Consider meaningful non-transparent commitments from both calendars, without double-counting overlapping copies.
- Keep reasonably open weekdays available. Meaningful commitments of roughly two to four hours, or a limited usable working window, make a day partially available. Full-day commitments, travel, workshops/trainings, substantial commitments of four or more hours, heavily booked days or uncertainty about actual workability make it unavailable.
- A failed calendar read is not evidence that a day is unavailable. Keep the existing snapshot when the source read fails.
- Keep exactly three public statuses. Missing future data retains the existing month-level unpublished notice. Do not introduce a fourth status or an earlier-month archive.

## Independent freshness monitor

The separate cloud task "Kunke availability freshness watch" checks both public language URLs each morning, after the updater's usual run. It does not read private calendars, publish website changes, resume the updater, or share its parent chat. It uses the live data-availability-checked-at timestamps, not the page's HTTP Last-Modified header, a search-engine cache or unrelated GitHub commits.

Use scripts/check-availability-freshness.mjs (Node 24+; in managed cloud run node --use-env-proxy scripts/check-availability-freshness.mjs). It reports fresh, stale or unverifiable. Stale means strictly more than 48 elapsed hours. Missing/invalid/future timestamps, failed page fetches or inconsistent language versions cannot be reported as healthy. Exit codes: 0 fresh, 1 stale, 2 unverifiable.

Notify Blaze once per unresolved stale snapshot or verification problem, with the affected URL and last successful check time in Europe/Warsaw. Keep healthy checks and unchanged incidents quiet. Reset the incident state silently after recovery. Keep this small deduplication state in the monitor's own saved prompt, not in the updater or public repository. Do not pause the monitor because of a transient read error. Genuine approval blocks must be respected and reported.

The existing GitHub main and Netlify publishing workflow remains unchanged. The monitor is an independent scheduled task, not an additional publisher or a publication gate.
