import StudentV2 from "../models/v2/studentModelV2.js";
import Invoice from "../models/invoiceModel.js";
import {
    getLiveStudentAccount
} from "../services/v2/billingServiceV2.js";
function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}
export const repairMigratedStudents = async (req, res) => {
    try {
        const today = new Date();

        const students = await StudentV2.find({
            "statuses.student": {
                $nin: ["trash", "left"]
            }
        });

        let updated = 0;
        let skipped = 0;

        for (const student of students) {

            const lastInvoice = await Invoice.findOne({
                sid: student.sid
            }).sort({ cycleEnd: -1 });

            if (!lastInvoice) {
                skipped++;
                continue;
            }

            const validTill = new Date(lastInvoice.cycleEnd);

            const storedBalance =
                Number(student.account?.balanceAmount || 0);

            const tempStudent = {
                ...student.toObject(),
                account: {
                    ...student.account,
                    validTill
                }
            };

            const live =
                getLiveStudentAccount(
                    tempStudent,
                    today
                );

            await StudentV2.updateOne(
                { _id: student._id },
                {
                    $set: {

                        "statuses.payment":
                            live.paymentStatus,

                        "statuses.student":
                            live.studentStatus,

                        "account.balanceAmount":
                            live.balanceAmount,

                        "account.advanceAmount":
                            live.advanceAmount,

                        "account.dueAmount":
                            live.dueAmount,

                        "account.creditDays":
                            live.creditDays,

                        "account.dueDays":
                            live.dueDays,

                        "account.validTill":
                            live.validTill,

                        "account.dueFrom":
                            live.dueFrom,

                        "account.lastPaymentAt":
                            lastInvoice.paymentDate
                    }
                }
            );

            updated++;
        }

        return res.status(200).json({
            success: true,
            updated,
            skipped
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
