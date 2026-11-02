# Availability maintenance

Blaze approved this process on 2 November 2026.

## Window and schedule

Show the current month in Europe/Warsaw and the next three months. Maintain a fifth month as a rollover buffer, without rendering it before it enters the visible window. Use getAvailabilityMonths and getPreparedAvailabilityMonths from src/utils/availabilityWindow.ts. Calculate the range on every run; never hardcode a year or final month.

Keep the existing cloud task "Update availability calendar" as the only scheduled writer. Run once daily at 06:00 Europe/Warsaw, including weekends, with no end date. Do not add twice-daily runs, publication gates or a separate failure monitor.

## Refresh

Read both personal and work Google calendars across the complete five-month range on every run. Fetch every page and include recurring occurrences, moved events and cancellations. Refresh earlier prepared dates as well as newly entering dates. An empty successful result differs from a failed or incomplete read. If either calendar cannot be read completely, retain the previous snapshot and updatedAt.

Update src/content/availability.ts with an explicit status for every date through the last day of the fifth month. Set existing past dates to unavailable. Update updatedAt to the Warsaw date only after the full refresh succeeds. Both language routes use the shared data and rendering helpers.

Publish only day statuses and date-only protections. Event titles, descriptions, attendees, locations and private reasons must stay out of the repository and website.

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

The existing Git and Netlify publishing workflow remains unchanged. This change adds no automated publication gate or independent monitor.
