import StudentV2 from "../models/v2/studentModelV2.js";
import PaymentV2 from "../models/v2/paymentModelV2.js";
import { deriveAccountFromBalance } from "../services/v2/billingServiceV2.js";

/**
 * dataConsistencyControllerV2.js
 *
 * Replaces the old `repairMigratedStudents`.
 *
 * WHY THE OLD VERSION WAS WRONG
 * ------------------------------
 * The old controller re-derived `creditDays` / `dueDays` / `dueAmount` from
 * `Invoice.cycleEnd` directly, using its own date-math (separate from
 * `deriveAccountFromBalance`). It never touched `account.balanceAmount`.
 *
 * That means: right after running it, `balanceAmount` and the fields the
 * repair just wrote (`dueAmount`, `creditDays`, etc.) could *already*
 * disagree — because nothing in the codebase guarantees
 * `balanceAmount === advanceAmount - dueAmount` afterwards. The next
 * payment, the nightly cron, or any call to `deriveAccountFromBalance`
 * would immediately recompute different numbers from `balanceAmount` and
 * "re-break" what this repair just fixed. Two sources of truth fighting
 * each other is the exact bug class described in the redesign doc
 * (Bug 3 / Bug 4).
 *
 * THE FIX
 * -------
 * `account.balanceAmount` is the single source of truth (per the redesign
 * doc's core mental model). So this repair does the math in the opposite
 * direction:
 *
 *   1. Figure out the CORRECT balanceAmount for each student
 *      (reconstructed from the PaymentV2 ledger when one exists — the
 *      ledger is append-only and authoritative; never re-derive it from
 *      invoice cycle dates).
 *   2. Run that single number through `deriveAccountFromBalance` —
 *      the same function the cron and the live-payment flow use — to get
 *      advanceAmount, dueAmount, creditDays, dueDays, validTill, dueFrom,
 *      paymentStatus, studentStatus.
 *   3. Write back ONLY the derived fields, all from that one derivation,
 *      so nothing can disagree with anything else afterwards.
 *
 * This makes the repair idempotent: running it twice in a row produces no
 * further writes the second time, because the second pass derives the
 * same balance and the same outputs.
 */

function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

/**
 * Reconstruct the canonical balanceAmount for a student.
 *
 * IMPORTANT — read this before changing the priority order below.
 * `getLiveStudentAccount` (a function that would time-decay a balance
 * forward to "now") does NOT exist yet in this codebase. That means
 * NOTHING in this script can correctly compute "what the balance should
 * be today" for a student who hasn't paid in a while — that's a separate,
 * not-yet-built piece of work (the Bug 1/Bug 2 class: staleness).
 *
 * This script only fixes Bug 3/Bug 4: INTERNAL CONSISTENCY between
 * balanceAmount and its dependent fields (advanceAmount/dueAmount both
 * set, creditDays/dueDays both set, statuses disagreeing with the
 * balance sign). It treats whatever balance is already on record as
 * given — it does not attempt to advance it through time.
 *
 * Priority order, and why:
 *   1. `account.balanceAmount` (stored on the student doc) is the PRIMARY
 *      source. It's the number the rest of the live system (payments,
 *      future cron) already treats as current. Using it keeps this
 *      repair from disagreeing with whatever process wrote it last.
 *   2. The latest non-reversed `PaymentV2.balanceAfter` is used ONLY as a
 *      fallback when `account.balanceAmount` is missing or not a finite
 *      number (e.g. true legacy-migration gap). We do NOT prefer the
 *      ledger by default, because `balanceAfter` is a snapshot from
 *      whenever that payment happened — feeding an old snapshot into
 *      `deriveAccountFromBalance({ asOfDate: today })` would make stale
 *      data LOOK fresh (e.g. a payment from 22 days ago would compute
 *      validTill as 22 days later than it should). Without
 *      `getLiveStudentAccount` to decay it first, that's worse than
 *      leaving stale data alone.
 *   3. If a ledger entry exists and DISAGREES with the stored balance,
 *      we don't pick a winner automatically — we surface it in
 *      `ledgerMismatches` in the report for a human to look at. This is
 *      deliberately conservative: silently overwriting one source of
 *      truth with another, with no decay function to reconcile the time
 *      gap between them, risks making things worse.
 *
 * Returns { balanceAmount, source, ledgerEntryId, ledgerBalance }
 */
async function reconstructBalance(student) {
    const storedBalance = Number(student.account?.balanceAmount);
    const hasValidStoredBalance = Number.isFinite(storedBalance);

    const latestEntry = await PaymentV2.findOne({
        sid: student.sid,
        isReversed: { $ne: true }
    })
        .sort({ paymentDate: -1, createdAt: -1 })
        .select("balanceAfter paymentDate createdAt")
        .lean();

    const ledgerBalance = latestEntry ? Number(latestEntry.balanceAfter) : null;
    const hasValidLedgerBalance = Number.isFinite(ledgerBalance);

    if (hasValidStoredBalance) {
        return {
            balanceAmount: storedBalance,
            source: "existing_balance",
            ledgerEntryId: latestEntry?._id || null,
            ledgerBalance: hasValidLedgerBalance ? ledgerBalance : null
        };
    }

    // Stored balance missing/NaN — fall back to ledger if we have one.
    if (hasValidLedgerBalance) {
        return {
            balanceAmount: ledgerBalance,
            source: "ledger_fallback_missing_balance",
            ledgerEntryId: latestEntry._id,
            ledgerBalance
        };
    }

    // No usable number anywhere. Treat as zero so the student at least
    // gets a deterministic, flaggable result rather than crashing the
    // whole batch — this case gets its own report bucket so it's never
    // silently swept in with normal "unchanged" students.
    return {
        balanceAmount: 0,
        source: "no_data_defaulted_to_zero",
        ledgerEntryId: null,
        ledgerBalance: null
    };
}

/**
 * Run the repair across all non-terminal students.
 *
 * Query params:
 *   ?dryRun=true   -> compute and report changes WITHOUT writing to the DB
 *   ?sid=12345     -> repair a single student by sid (for spot-checking)
 *
 * Terminal statuses ('left', 'trash') are skipped entirely, matching the
 * nightly cron's own guard — those students are not subject to ongoing
 * billing logic.
 */
export const repairStudentAccountConsistencyV2 = async (req, res) => {
    try {
        const dryRun = String(req.query.dryRun).toLowerCase() === "true";
        const singleSid = req.query.sid ? Number(req.query.sid) : null;

        const now = new Date();
        const today = startOfDay(now);

        const filter = {
            "statuses.student": { $nin: ["left", "trash", "inactive"] }
        };
        if (singleSid) filter.sid = singleSid;

        const students = await StudentV2.find(filter);

        const report = {
            dryRun,
            totalScanned: students.length,
            updated: 0,
            unchanged: 0,
            skippedNoBillingRate: 0,
            skippedInactive: 0,
            noUsableBalanceData: 0,
            markedDue: 0,
            markedActiveOrAdvance: 0,
            ledgerMismatches: [],
            changes: []
        };

        for (const student of students) {
            // `deriveAccountFromBalance` only ever returns 'active' or
            // 'pending' for studentStatus. A student manually set to
            // 'inactive' (e.g. on leave, suspended) is a deliberate admin
            // decision that this script must not override — only 'active'
            // and 'pending' are fields this repair is allowed to rewrite.
            if (student.statuses?.student === "inactive") {
                report.skippedInactive++;
                continue;
            }

            const rate = Number(student.billing?.dailyRate || 0);

            if (rate <= 0) {
                // Can't derive credit/due days without a daily rate.
                // Flag it rather than silently writing zeros — this
                // usually means the shift/billing setup itself is broken
                // for this student and needs a manual look, not a repair.
                report.skippedNoBillingRate++;
                report.changes.push({
                    sid: student.sid,
                    name: student.name,
                    skipped: true,
                    reason: "billing.dailyRate is 0 or missing — cannot derive days. Fix billing setup first."
                });
                continue;
            }

            const { balanceAmount, source, ledgerBalance } =
                await reconstructBalance(student);

            if (source === "no_data_defaulted_to_zero") {
                report.noUsableBalanceData++;
            }

            if (
                source === "existing_balance" &&
                ledgerBalance !== null &&
                Math.abs(ledgerBalance - balanceAmount) > 0
            ) {
                // Stored balance and the latest ledger checkpoint
                // disagree. We still trust the stored balance for THIS
                // pass (see reconstructBalance's doc comment for why),
                // but this mismatch is exactly the signature of a manual
                // DB edit that bypassed recordPaymentV2 — worth a human
                // look, not a silent auto-correction.
                report.ledgerMismatches.push({
                    sid: student.sid,
                    name: student.name,
                    storedBalance: balanceAmount,
                    latestLedgerBalanceAfter: ledgerBalance
                });
            }

            const derived = deriveAccountFromBalance({
                balanceAmount,
                dailyRate: rate,
                asOfDate: today
            });

            const before = {
                balanceAmount: Number(student.account?.balanceAmount || 0),
                advanceAmount: Number(student.account?.advanceAmount || 0),
                dueAmount: Number(student.account?.dueAmount || 0),
                creditDays: Number(student.account?.creditDays || 0),
                dueDays: Number(student.account?.dueDays || 0),
                paymentStatus: student.statuses?.payment,
                studentStatus: student.statuses?.student
            };

            const after = {
                balanceAmount,
                advanceAmount: derived.advanceAmount,
                dueAmount: derived.dueAmount,
                creditDays: derived.creditDays,
                dueDays: derived.dueDays,
                paymentStatus: derived.paymentStatus,
                studentStatus: derived.studentStatus
            };

            const needsUpdate =
                before.balanceAmount !== after.balanceAmount ||
                before.advanceAmount !== after.advanceAmount ||
                before.dueAmount !== after.dueAmount ||
                before.creditDays !== after.creditDays ||
                before.dueDays !== after.dueDays ||
                before.paymentStatus !== after.paymentStatus ||
                before.studentStatus !== after.studentStatus;

            if (!needsUpdate) {
                report.unchanged++;
                continue;
            }

            report.changes.push({
                sid: student.sid,
                name: student.name,
                balanceSource: source,
                before,
                after
            });

            if (!dryRun) {
                await StudentV2.updateOne(
                    { _id: student._id },
                    {
                        $set: {
                            "account.balanceAmount": after.balanceAmount,
                            "account.advanceAmount": after.advanceAmount,
                            "account.dueAmount": after.dueAmount,
                            "account.creditDays": after.creditDays,
                            "account.dueDays": after.dueDays,
                            "account.validTill": derived.validTill,
                            "account.dueFrom": derived.dueFrom,
                            "statuses.payment": after.paymentStatus,
                            "statuses.student": after.studentStatus
                        }
                    }
                );
            }

            report.updated++;
            if (after.paymentStatus === "due") report.markedDue++;
            else report.markedActiveOrAdvance++;
        }

        return res.status(200).json({
            success: true,
            ...report
        });
    } catch (error) {
        console.error("[repairStudentAccountConsistencyV2]", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};