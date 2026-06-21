/**
 * Pure time-of-day overlap helpers for shift scheduling.
 *
 * Two shifts conflict on the SAME calendar day if their [start, end) windows
 * intersect, regardless of how those windows are labeled (morning/evening/
 * fullday/etc). This module only deals with the time-of-day axis (minutes
 * since midnight, 0-1440). The separate cycle/date-range axis (validFrom/
 * validTo) is handled elsewhere and must ALSO overlap for a real booking
 * conflict — see findConflict in seatModelV2.js.
 *
 * Handles three cases uniformly:
 *   1. Normal same-day range:      "07:00" -> "11:00"   => [420, 660)
 *   2. Overnight wraparound range: "19:00" -> "07:00"   => [1140, 1860)  (end pushed past midnight)
 *   3. Full 24h range:             "00:00" -> "00:00"   => [0, 1440)
 *
 * To compare two ranges that may wrap past midnight, each is normalized to
 * a single contiguous interval on a "doubled" 0-2880 timeline, then one
 * side is also checked shifted by +/-1440 so a wraparound range can be
 * compared correctly against a normal range that sits on the other side of
 * midnight from it.
 */

const MINUTES_PER_DAY = 24 * 60;
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function toMinutes(time) {
    const match = TIME_REGEX.exec(String(time || '').trim());
    if (!match) {
        throw new Error(`Invalid time "${time}", expected HH:MM (24h).`);
    }
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    return (hours * 60) + minutes;
}

/**
 * Normalizes a startTime/endTime pair into a single non-wrapping
 * { start, end } interval in minutes, where end > start always.
 * - If endTime > startTime: same-day range, end stays as-is.
 * - If endTime <= startTime: wraps past midnight (covers both the
 *   genuine overnight case and the "00:00 to 00:00" = full day case),
 *   end is pushed to start + 1440 (or +1440 exactly for the full-day case).
 */
export function normalizeRange(startTime, endTime) {
    const start = toMinutes(startTime);
    let end = toMinutes(endTime);

    if (end <= start) {
        end += MINUTES_PER_DAY;
    }

    return { start, end };
}

/**
 * True if two normalized [start, end) ranges intersect on a repeating
 * 24h clock. Both ranges are checked against each other on the doubled
 * timeline (range B and range B+1440) so a wraparound range correctly
 * collides with a normal range sitting on the other side of midnight.
 */
function intervalsIntersect(aStart, aEnd, bStart, bEnd) {
    return aStart < bEnd && bStart < aEnd;
}

export function rangesOverlap(rangeA, rangeB) {
    const a = typeof rangeA.start === 'number' ? rangeA : normalizeRange(rangeA.startTime, rangeA.endTime);
    const b = typeof rangeB.start === 'number' ? rangeB : normalizeRange(rangeB.startTime, rangeB.endTime);

    // Compare A against B directly, and against B shifted a full day earlier
    // and later, to correctly catch overlaps across the midnight boundary
    // in either direction.
    return (
        intervalsIntersect(a.start, a.end, b.start, b.end) ||
        intervalsIntersect(a.start, a.end, b.start - MINUTES_PER_DAY, b.end - MINUTES_PER_DAY) ||
        intervalsIntersect(a.start, a.end, b.start + MINUTES_PER_DAY, b.end + MINUTES_PER_DAY)
    );
}

/** Convenience wrapper taking raw "HH:MM" strings for both sides. */
export function timeRangesOverlap(startA, endA, startB, endB) {
    return rangesOverlap(normalizeRange(startA, endA), normalizeRange(startB, endB));
}