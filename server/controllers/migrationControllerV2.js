import StudentV2 from "../models/v2/studentModelV2.js";
import Invoice from "../models/invoiceModel.js";

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
        const today = startOfDay(new Date());

        const students = await StudentV2.find({
            "statuses.student": {
                $in: ["active", "pending"]
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

            const validTill = startOfDay(lastInvoice.cycleEnd);

            const cycleStart = startOfDay(validTill);

            const cycleEnd = addDays(
                cycleStart,
                student.billing.cycleDays || 30
            );

            let creditDays = 0;
            let dueDays = 0;
            let dueAmount = 0;
            let dueFrom = null;
            let paymentStatus = "paid";

            if (today <= validTill) {

                creditDays = Math.floor(
                    (validTill - today) /
                    (1000 * 60 * 60 * 24)
                );

                paymentStatus = "paid";

            } else {

                dueDays = Math.floor(
                    (today - validTill) /
                    (1000 * 60 * 60 * 24)
                );

                const missedCycles = Math.max(
                    1,
                    Math.ceil(
                        dueDays /
                        (student.billing.cycleDays || 30)
                    )
                );

                dueAmount =
                    missedCycles *
                    student.billing.netCycleAmount;

                paymentStatus = "due";

                dueFrom = validTill;
            }

            await StudentV2.updateOne(
                { _id: student._id },
                {
                    $set: {
                        "statuses.payment": paymentStatus,

                        "account.validTill": validTill,

                        "account.creditDays": creditDays,
                        "account.dueDays": dueDays,

                        "account.dueAmount": dueAmount,

                        "account.dueFrom": dueFrom,

                        "account.currentCycleStart": cycleStart,
                        "account.currentCycleEnd": cycleEnd
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