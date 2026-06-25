/**
 * billingServiceV2.js
 *
 * ARCHITECTURE: Pure day-based billing. No "advance" or "partial" concepts.
 *
 * Core idea:
 *   - Every payment converts rupees → days (amount / dailyRate)
 *   - `remainingDays` is the single source of truth for coverage
 *   - `validTill`  = today + remainingDays  (derived, not stored separately)
 *   - `dueFrom`    = date coverage expired  (only meaningful when due)
 *   - Payment status: "paid" (remainingDays > 0) | "due" (remainingDays <= 0)
 *   - Student status: "active" (paid) | "pending" (due) | "inactive" | "left" | "trash"
 *
 * Payment flow:
 *   1. Convert amountPaid → daysFromPayment  = floor(amountPaid / dailyRate)
 *   2. If student is currently due (validTill < today):
 *        dueDaysOwed = diffDays(validTill, today)
 *        netDays     = daysFromPayment - dueDaysOwed   (settle overdue first)
 *        if netDays < 0 → still due, remainingDays = netDays (negative)
 *        if netDays >= 0 → paid, remainingDays = netDays
 *   3. If student is current (validTill >= today):
 *        remainingDays = existingRemainingDays + daysFromPayment
 *   4. New validTill = today + remainingDays
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// ─── Date helpers ─────────────────────────────────────────────────────────────

export function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

/**
 * Whole-day difference: positive = `to` is after `from`, negative = before.
 */
export function diffDays(from, to) {
    return Math.round((startOfDay(to) - startOfDay(from)) / MS_PER_DAY);
}

export function addDays(dateInput, days) {
    const d = startOfDay(dateInput);
    d.setDate(d.getDate() + Number(days || 0));
    return d;
}

export function addMonths(dateInput, months = 1) {
    const d = startOfDay(dateInput);
    d.setMonth(d.getMonth() + Number(months || 1));
    return d;
}

// ─── Billing calculation ──────────────────────────────────────────────────────

/**
 * Given shift amount, discount, and cycle days, return net amounts and daily rate.
 */
export function calculateStudentBilling({
    shiftAmount,
    fixedDiscountAmount = 0,
    cycleDays = 30
}) {
    const net = Math.max(Number(shiftAmount || 0) - Number(fixedDiscountAmount || 0), 0);
    const daily = cycleDays > 0 ? parseFloat((net / cycleDays).toFixed(4)) : 0;
    return { netCycleAmount: net, dailyRate: daily };
}

// ─── Core account derivation ──────────────────────────────────────────────────

/**
 * Derive all account snapshot fields from `remainingDays` and `dailyRate`.
 *
 * @param {number}  remainingDays  - Days of coverage left. Negative = overdue.
 * @param {number}  dailyRate
 * @param {Date}    asOfDate       - The reference "today"
 * @param {Date}    [dueFromDate]  - When coverage expired (only relevant if due)
 * @returns Account snapshot
 */
export function deriveAccountFromDays({ remainingDays, dailyRate, asOfDate, dueFromDate = null }) {
    const today = startOfDay(asOfDate || new Date());
    const days = Math.round(Number(remainingDays || 0));
    const rate = Number(dailyRate || 0);

    const isPaid = days > 0;
    const isDue = days <= 0;

    // validTill: if paid, today + remainingDays; if due, the date when it expired
    const validTill = isPaid
        ? addDays(today, days)
        : (dueFromDate ? startOfDay(dueFromDate) : today);

    // How many rupees overdue (for display)
    const dueDays = isDue ? Math.abs(days) : 0;
    const dueAmount = rate > 0 ? parseFloat((dueDays * rate).toFixed(2)) : 0;

    // dueFrom: when coverage ended
    const dueFrom = isDue
        ? (dueFromDate ? startOfDay(dueFromDate) : today)
        : null;

    // Renewal urgency
    let renewal = 'safe';
    if (isDue || days <= 0) renewal = 'expired';
    else if (days <= 3) renewal = 'urgent';
    else if (days <= 7) renewal = 'warning';

    const paymentStatus = isPaid ? 'paid' : 'due';
    const studentStatus = isPaid ? 'active' : 'pending';

    return {
        remainingDays: days,
        dueDays,
        dueAmount,
        validTill,
        dueFrom,
        paymentStatus,
        studentStatus,
        renewal
    };
}

// ─── Payment days calculation ─────────────────────────────────────────────────

/**
 * Calculate how many days a payment amount buys.
 * Always floors (you only get full days).
 */
export function daysFromAmount(amount, dailyRate) {
    if (!dailyRate || dailyRate <= 0) return 0;
    return Math.floor(Number(amount) / dailyRate);
}

/**
 * Apply a payment to a student's current account state.
 *
 * Returns the new `remainingDays` and derived account fields.
 *
 * @param {object} params
 * @param {number} params.currentRemainingDays  Current days left (can be negative if due)
 * @param {Date}   params.currentValidTill      When coverage currently ends/ended
 * @param {number} params.amountPaid
 * @param {number} params.dailyRate
 * @param {Date}   params.asOfDate              Payment date ("today")
 * @param {Date}   [params.dueFromDate]         When student went overdue
 */
export function applyPayment({
    currentRemainingDays,
    currentValidTill,
    amountPaid,
    dailyRate,
    asOfDate,
    dueFromDate = null
}) {
    const today = startOfDay(asOfDate || new Date());
    const rate = Number(dailyRate || 0);
    const paid = Number(amountPaid || 0);

    // Days this payment purchases
    const purchasedDays = daysFromAmount(paid, rate);

    // Current remaining days (may be negative if overdue)
    const currentDays = Math.round(Number(currentRemainingDays || 0));

    // If student is overdue (validTill in past), we need to account for elapsed days
    // since validTill to today that may not be reflected in currentRemainingDays.
    // Use currentDays directly since it already represents the net position:
    //   positive = still has days left
    //   negative = owes that many days
    // But if student was "paid" but validTill has since passed, recalculate:
    let effectiveCurrentDays = currentDays;
    if (currentDays > 0 && currentValidTill) {
        const daysLeftByValidTill = diffDays(today, startOfDay(currentValidTill));
        // Use the lesser to be conservative (don't give extra days for free)
        effectiveCurrentDays = Math.min(currentDays, daysLeftByValidTill);
    }

    const newRemainingDays = effectiveCurrentDays + purchasedDays;

    // If still due after payment, preserve original dueFrom
    const newDueFrom = newRemainingDays <= 0
        ? (dueFromDate || (currentValidTill ? startOfDay(currentValidTill) : today))
        : null;

    const account = deriveAccountFromDays({
        remainingDays: newRemainingDays,
        dailyRate: rate,
        asOfDate: today,
        dueFromDate: newDueFrom
    });

    return {
        purchasedDays,
        effectiveCurrentDays,
        newRemainingDays,
        ...account
    };
}

// ─── Live account (read from stored state, adjusted for elapsed time) ─────────

/**
 * Get the live account state as of `asOfDate`.
 *
 * If the student's `validTill` has passed since data was last synced,
 * this recalculates `remainingDays` so it's accurate right now.
 */
export function getLiveStudentAccount(student, asOfDate = new Date()) {
    const today = startOfDay(asOfDate);
    const rate = Number(student.billing?.dailyRate || 0);

    // The stored validTill is the ground truth for coverage end.
    const storedValidTill = student.account?.validTill
        ? startOfDay(student.account.validTill)
        : null;

    let remainingDays;
    let dueFromDate;

    if (!storedValidTill) {
        // No coverage info — student is due from admission date
        remainingDays = 0;
        dueFromDate = startOfDay(student.admissionDate || today);
    } else {
        // Days left = how far validTill is from today
        remainingDays = diffDays(today, storedValidTill);
        // If overdue, dueFrom = validTill (when coverage ended)
        dueFromDate = remainingDays <= 0 ? storedValidTill : null;
    }

    return deriveAccountFromDays({ remainingDays, dailyRate: rate, asOfDate: today, dueFromDate });
}

// ─── Cycle helpers ────────────────────────────────────────────────────────────

/**
 * Given an anchor date and a target date, find the billing cycle
 * (monthly boundaries relative to anchor) that contains targetDate.
 */
export function getCycleForDate(anchorDate, targetDate) {
    const anchor = startOfDay(anchorDate);
    const target = startOfDay(targetDate);

    let cycleStart = new Date(anchor);
    while (addMonths(cycleStart, 1) <= target) {
        cycleStart = addMonths(cycleStart, 1);
    }

    return {
        cycleStart,
        cycleEnd: addMonths(cycleStart, 1)
    };
}

/**
 * Classify a payment for invoice/ledger labelling.
 * Only two statuses: "paid" | "due"
 */
export function classifyPayment({ newRemainingDays, previousRemainingDays, amountPaid }) {
    const wasDue = previousRemainingDays <= 0;
    const isClear = newRemainingDays > 0;

    if (amountPaid <= 0) return { paymentType: 'adjustment', status: newRemainingDays > 0 ? 'paid' : 'due' };
    if (wasDue && isClear) return { paymentType: 'due_clearance', status: 'paid' };
    if (wasDue && !isClear) return { paymentType: 'partial_due', status: 'due' };
    return { paymentType: 'renewal', status: 'paid' };
}