import cron from 'node-cron';
import StudentV2 from '../../models/v2/studentModelV2.js';
import { getCycleForDate, getLiveStudentAccount } from '../../services/v2/billingServiceV2.js';
import { sendMail } from '../mailer.js';

export async function updatePaymentStatusV2({ sendEmails = true } = {}) {
    const today = new Date();
    const students = await StudentV2.find({ 'statuses.student': { $nin: ['trash', 'left'] } });
    const updated = [];

    for (const student of students) {
        const live = getLiveStudentAccount(student, today);
        const cycle = getCycleForDate(student.billing.cycleAnchorDate, today);

        student.statuses.payment = live.paymentStatus;
        student.statuses.student = live.studentStatus;
        student.account.balanceAmount = live.balanceAmount;
        student.account.advanceAmount = live.advanceAmount;
        student.account.dueAmount = live.dueAmount;
        student.account.creditDays = live.creditDays;
        student.account.dueDays = live.dueDays;
        student.account.validTill = live.validTill;
        student.account.dueFrom = live.dueFrom;
        student.account.currentCycleStart = cycle.cycleStart;
        student.account.currentCycleEnd = cycle.cycleEnd;

        await student.save();
        updated.push({ sid: student.sid, dueDays: live.dueDays, creditDays: live.creditDays });

        if (sendEmails && live.dueDays > 0 && student.email) {
            await sendMail({
                to: student.email,
                subject: 'Payment Due Reminder - Bihari Library',
                body: `
                    <p>Dear ${student.name},</p>
                    <p>Your library fee has been due for ${live.dueDays} day(s).</p>
                    <p><strong>Due amount:</strong> Rs ${Math.ceil(live.dueAmount)}</p>
                    <p><strong>Due from:</strong> ${live.dueFrom ? live.dueFrom.toLocaleDateString('en-IN') : 'N/A'}</p>
                    <p>Please contact the library desk to clear your pending balance.</p>
                `
            });
        }
    }

    return updated;
}

cron.schedule('0 6 * * *', () => {
    updatePaymentStatusV2().catch((error) => {
        console.error('paymentStatusV2 cron failed:', error);
    });
}, {
    timezone: 'Asia/Kolkata'
});
