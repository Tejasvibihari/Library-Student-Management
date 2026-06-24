import express from "express";
import mongoose from "mongoose";

import Student from "../models/studentModel.js";          // OLD
import Seat from "../models/seatModel.js";                // OLD

import { repairMigratedStudents } from "../controllers/migrationControllerV2.js";

import StudentV2 from "../models/v2/studentModelV2.js";
import SeatV2, { SeatBookingV2 } from "../models/v2/seatModelV2.js";
import ShiftV2 from "../models/v2/shiftModelV2.js";
import Invoice from "../models/invoiceModel.js";        // OLD
import {
    deriveAccount
} from "../services/v2/billingServiceV2.js";

const router = express.Router();

router.post("/migrate-bihari-library", async (req, res) => {
    try {

        // -----------------------------
        // STEP 1 : CREATE SHIFTS
        // -----------------------------

        const shifts = [
            {
                code: "morning",
                label: "Morning",
                startTime: "07:00",
                endTime: "11:00",
                price: 300,
                displayOrder: 10
            },
            {
                code: "afternoon",
                label: "Afternoon",
                startTime: "11:00",
                endTime: "15:00",
                price: 300,
                displayOrder: 20
            },
            {
                code: "evening",
                label: "Evening",
                startTime: "15:00",
                endTime: "19:00",
                price: 300,
                displayOrder: 30
            },
            {
                code: "night",
                label: "Night",
                startTime: "19:00",
                endTime: "23:00",
                price: 300,
                displayOrder: 40
            },
            {
                code: "doublemorning",
                label: "Double Morning",
                startTime: "07:00",
                endTime: "15:00",
                price: 500,
                displayOrder: 50
            },
            {
                code: "doubleevening",
                label: "Double Evening",
                startTime: "11:00",
                endTime: "19:00",
                price: 500,
                displayOrder: 60
            },
            {
                code: "nightlong",
                label: "Night Long",
                startTime: "19:00",
                endTime: "07:00",
                price: 500,
                displayOrder: 70
            },
            {
                code: "morninglong",
                label: "Morning Long",
                startTime: "07:00",
                endTime: "19:00",
                price: 700,
                displayOrder: 80
            },
            {
                code: "fullday",
                label: "24 Hours",
                startTime: "00:00",
                endTime: "00:00",
                price: 1000,
                displayOrder: 90
            }
        ];

        const shiftMap = new Map();

        for (const shift of shifts) {

            const doc = await ShiftV2.findOneAndUpdate(
                { code: shift.code },
                shift,
                {
                    upsert: true,
                    new: true
                }
            );

            shiftMap.set(shift.code, doc);
        }

        // -----------------------------
        // STEP 2 : CREATE SEATS
        // -----------------------------

        const seatMap = new Map();

        for (let i = 1; i <= 47; i++) {

            const seat = await SeatV2.findOneAndUpdate(
                {
                    seatNumber: String(i)
                },
                {
                    seatNumber: String(i),
                    reservedFor: "boy"
                },
                {
                    upsert: true,
                    new: true
                }
            );

            seatMap.set(seat.seatNumber, seat);
        }

        for (let i = 48; i <= 72; i++) {

            const seat = await SeatV2.findOneAndUpdate(
                {
                    seatNumber: `G${i}`
                },
                {
                    seatNumber: `G${i}`,
                    reservedFor: "girl"
                },
                {
                    upsert: true,
                    new: true
                }
            );

            seatMap.set(seat.seatNumber, seat);
        }

        // -----------------------------
        // STEP 3 : STUDENTS
        // -----------------------------

        const students = await Student.find();

        let migratedStudents = 0;
        let migratedBookings = 0;

        for (const oldStudent of students) {

            const existing = await StudentV2.findOne({
                legacyStudent: oldStudent._id
            });

            if (existing) continue;

            // map time -> shift code

            const time = String(oldStudent.time || "")
                .replace(/\s+/g, "")
                .toUpperCase();

            let shiftCode = "morning";

            if (time === "07:00AM-11:00AM")
                shiftCode = "morning";

            else if (time === "11:00AM-03:00PM")
                shiftCode = "afternoon";

            else if (time === "03:00PM-07:00PM")
                shiftCode = "evening";

            else if (time === "07:00PM-11:00PM")
                shiftCode = "night";

            else if (time === "07:00AM-03:00PM")
                shiftCode = "doublemorning";

            else if (time === "11:00AM-07:00PM")
                shiftCode = "doubleevening";

            else if (time === "07:00PM-07:00AM")
                shiftCode = "nightlong";

            else if (time === "07:00AM-07:00PM")
                shiftCode = "morninglong";

            else if (
                oldStudent.shift === "24 Hours" ||
                oldStudent.shift === "24Hours"
            )
                shiftCode = "fullday";

            const shift = shiftMap.get(shiftCode);
            if (!shift) {
                console.log(
                    `Shift not found for SID ${oldStudent.sid}`
                );
                continue;
            }
            let balanceAmount = 0;

            let validTill =
                oldStudent.nextPayment ||
                oldStudent.admissionDate;

            let lastPaymentAt =
                oldStudent.lastPayment || null;
            let currentCycleStart =
                oldStudent.admissionDate;

            let currentCycleEnd =
                validTill;
            const hasInvoice =
                await Invoice.exists({
                    sid: oldStudent.sid
                });

            if (hasInvoice) {

                const latestInvoice =
                    await Invoice.findOne({
                        sid: oldStudent.sid
                    }).sort({
                        cycleEnd: -1
                    });

                currentCycleStart =
                    latestInvoice.cycleStart ||
                    currentCycleStart;

                currentCycleEnd =
                    latestInvoice.cycleEnd ||
                    currentCycleEnd;

                balanceAmount =
                    -(latestInvoice.remainingDue || 0);

                validTill =
                    latestInvoice.cycleEnd ||
                    validTill;

                lastPaymentAt =
                    latestInvoice.paymentDate ||
                    lastPaymentAt;

            } else {

                const legacyDue =
                    (oldStudent.paymentDue || 0) +
                    (oldStudent.extraPaymentDue || 0);

                balanceAmount =
                    -legacyDue;
            }

            const accountState =
                deriveAccount({
                    balanceAmount,
                    validTill,
                    dailyRate:
                        Number(
                            (shift.price / 30).toFixed(2)
                        )
                });

            let paymentStatus =
                accountState.paymentStatus;

            let studentStatus =
                accountState.studentStatus;

            let renewalStatus =
                accountState.renewal;

            let seatStatus =
                oldStudent.seatNumber
                    ? "allotted"
                    : "not_allotted";

            if (oldStudent.status === "Trash") {

                studentStatus = "trash";
                seatStatus = "cancelled";

            } else if (
                oldStudent.status === "Pending"
            ) {

                studentStatus = "pending";
            }



            const seatDoc =
                seatMap.get(oldStudent.seatNumber);

            const student = await StudentV2.create({

                legacyStudent: oldStudent._id,

                sid: oldStudent.sid,
                name: oldStudent.name,
                email:
                    oldStudent.email
                        ? oldStudent.email.toLowerCase()
                        : `sid${oldStudent.sid}@migrated.local`,
                password: oldStudent.password,
                mobile: oldStudent.mobile,
                father: oldStudent.father,
                guardian: oldStudent.guardian,
                gender: oldStudent.gender,
                admissionDate: oldStudent.admissionDate,
                address: oldStudent.address,

                image: oldStudent.image,
                facebook: oldStudent.facebook,
                instagram: oldStudent.instagram,
                youtube: oldStudent.youtube,

                shift: {
                    shift: shift._id,
                    code: shift.code,
                    label: shift.label,
                    displayTime: shift.displayTime,
                    amount: shift.price
                },

                billing: {
                    cycleAnchorDate:
                        oldStudent.admissionDate,
                    cycleDays: 30,
                    netCycleAmount: shift.price,
                    dailyRate:
                        shift.price / 30
                },

                seat: {
                    seat:
                        seatDoc?._id || null,
                    seatNumber:
                        oldStudent.seatNumber ||
                        "Other",
                    status: seatStatus
                },

                statuses: {
                    student: studentStatus,
                    payment: paymentStatus,
                    seat: seatStatus,
                    renewal: renewalStatus
                },

                account: {

                    balanceAmount,

                    validTill,

                    dueFrom:
                        accountState.dueFrom,

                    lastPaymentAt,

                    advanceAmount:
                        accountState.advanceAmount,

                    dueAmount:
                        accountState.dueAmount,

                    remainingDays:
                        accountState.remainingDays,

                    advanceDays:
                        accountState.advanceDays,

                    dueDays:
                        accountState.dueDays,
                    currentCycleStart,

                    currentCycleEnd
                }
            });

            migratedStudents++;

            // -------------------------
            // BOOKING
            // -------------------------

            if (
                seatDoc &&
                oldStudent.seatNumber !== "Other"
            ) {

                const booking =
                    await SeatBookingV2.create({

                        seat: seatDoc._id,
                        seatNumber:
                            seatDoc.seatNumber,

                        student: student._id,
                        sid: student.sid,

                        shift: {
                            code: shift.code,
                            label: shift.label,
                            displayTime:
                                shift.displayTime,
                            startTime:
                                shift.startTime,
                            endTime:
                                shift.endTime
                        },

                        validFrom:
                            oldStudent.admissionDate,

                        validTo: validTill,

                        status:
                            oldStudent.status ===
                                "Trash"
                                ? "cancelled"
                                : "allotted",

                        cancelledReason:
                            oldStudent.status ===
                                "Trash"
                                ? "Migrated Trash Student"
                                : undefined
                    });

                migratedBookings++;

                if (
                    oldStudent.status !==
                    "Trash"
                ) {

                    student.seat.activeAllotment =
                        booking._id;

                    await student.save();
                }
            }
        }

        return res.status(200).json({
            success: true,
            migratedStudents,
            migratedBookings
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// router.post(
//     "/repair-migrated-students",
//     repairMigratedStudents
// );
router.post("/repair-active-students", async (req, res) => {
    try {

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const students = await StudentV2.find({
            "statuses.student": "active"
        });

        let updated = 0;

        for (const student of students) {

            if (!student.account?.validTill) {
                continue;
            }

            const validTill = new Date(student.account.validTill);
            validTill.setHours(0, 0, 0, 0);

            const cycleDays =
                student.billing?.cycleDays || 30;

            const shiftAmount =
                student.shift?.amount ||
                student.billing?.netCycleAmount ||
                0;

            const dailyRate =
                shiftAmount / cycleDays;

            // days left till expiry

            const remainingDays = Math.max(
                0,
                Math.ceil(
                    (validTill - today) /
                    (1000 * 60 * 60 * 24)
                )
            );

            // money represented by remaining days

            const balanceAmount = Number(
                (remainingDays * dailyRate).toFixed(2)
            );

            const advanceAmount = balanceAmount;

            const advanceDays = remainingDays;

            const dueAmount = 0;
            const dueDays = 0;

            // rebuild cycle

            const currentCycleEnd =
                new Date(validTill);

            const currentCycleStart =
                new Date(validTill);

            currentCycleStart.setDate(
                currentCycleStart.getDate() - cycleDays
            );

            await StudentV2.updateOne(
                { _id: student._id },
                {
                    $set: {

                        "billing.dailyRate":
                            Number(
                                dailyRate.toFixed(2)
                            ),

                        "account.balanceAmount":
                            balanceAmount,

                        "account.advanceAmount":
                            advanceAmount,

                        "account.dueAmount":
                            dueAmount,

                        "account.remainingDays":
                            remainingDays,

                        "account.advanceDays":
                            advanceDays,

                        "account.dueDays":
                            dueDays,

                        "account.currentCycleStart":
                            currentCycleStart,

                        "account.currentCycleEnd":
                            currentCycleEnd,

                        "statuses.payment":
                            remainingDays > 0
                                ? "advance"
                                : "paid",

                        "statuses.renewal":
                            remainingDays <= 0
                                ? "expired"
                                : remainingDays <= 3
                                    ? "urgent"
                                    : remainingDays <= 7
                                        ? "warning"
                                        : "safe"
                    }
                }
            );

            updated++;
        }

        return res.status(200).json({
            success: true,
            updated
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


export default router;