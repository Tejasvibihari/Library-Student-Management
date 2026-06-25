/**
 * cronServiceV2.js
 *
 * Daily cron: update all active/pending student account snapshots.
 *
 * This just re-derives `remainingDays` from `validTill` for every student
 * so the stored snapshot reflects today. The `validTill` field is the real
 * source of truth — we never change it here, only re-compute the days delta.
 *
 * Run this at midnight every day (e.g. via node-cron or a cloud scheduler).
 */

import StudentV2 from '../models/v2/studentModelV2.js';
import { getLiveStudentAccount, startOfDay } from '../services/v2/billingServiceV2.js';

export async function runDailyAccountSync() {
    const today = startOfDay(new Date());
    console.log(`[CRON] Daily account sync — ${today.toISOString()}`);

    const students = await StudentV2.find({
        'statuses.student': { $nin: ['trash', 'left', 'inactive'] }
    });

    let updated = 0;
    let errors = 0;

    for (const student of students) {
        try {
            const live = getLiveStudentAccount(student, today);

            await StudentV2.updateOne(
                { _id: student._id },
                {
                    $set: {
                        'account.remainingDays': live.remainingDays,
                        'account.dueDays': live.dueDays,
                        'account.dueAmount': live.dueAmount,
                        'account.dueFrom': live.dueFrom,
                        // validTill not updated here — it's the source of truth
                        'statuses.payment': live.paymentStatus,
                        'statuses.student': live.studentStatus,
                        'statuses.renewal': live.renewal
                    }
                }
            );
            updated++;
        } catch (err) {
            console.error(`[CRON] Failed to sync student SID ${student.sid}:`, err.message);
            errors++;
        }
    }

    console.log(`[CRON] Done — updated: ${updated}, errors: ${errors}`);
    return { updated, errors };
}