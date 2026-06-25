/**
 * migrationRouteV2.js
 *
 * One-time migration + repair routes.
 * Updated for day-based billing (no advance/partial).
 */

import express from 'express';
import mongoose from 'mongoose';

import Student from '../models/studentModel.js';
import Invoice from '../models/invoiceModel.js';
import StudentV2 from '../models/v2/studentModelV2.js';
import SeatV2, { SeatBookingV2 } from '../models/v2/seatModelV2.js';
import ShiftV2 from '../models/v2/shiftModelV2.js';
import {
    deriveAccountFromDays,
    diffDays,
    startOfDay
} from '../services/v2/billingServiceV2.js';

const router = express.Router();

// ─── Main migration ───────────────────────────────────────────────────────────

router.post('/migrate-bihari-library', async (req, res) => {
    try {
        // STEP 1: Shifts
        const shiftDefs = [
            { code: 'morning', label: 'Morning', startTime: '07:00', endTime: '11:00', price: 300, displayOrder: 10 },
            { code: 'afternoon', label: 'Afternoon', startTime: '11:00', endTime: '15:00', price: 300, displayOrder: 20 },
            { code: 'evening', label: 'Evening', startTime: '15:00', endTime: '19:00', price: 300, displayOrder: 30 },
            { code: 'night', label: 'Night', startTime: '19:00', endTime: '23:00', price: 300, displayOrder: 40 },
            { code: 'doublemorning', label: 'Double Morning', startTime: '07:00', endTime: '15:00', price: 500, displayOrder: 50 },
            { code: 'doubleevening', label: 'Double Evening', startTime: '11:00', endTime: '19:00', price: 500, displayOrder: 60 },
            { code: 'nightlong', label: 'Night Long', startTime: '19:00', endTime: '07:00', price: 500, displayOrder: 70 },
            { code: 'morninglong', label: 'Morning Long', startTime: '07:00', endTime: '19:00', price: 700, displayOrder: 80 },
            { code: 'fullday', label: '24 Hours', startTime: '00:00', endTime: '00:00', price: 1000, displayOrder: 90 }
        ];
        const shiftMap = new Map();
        for (const def of shiftDefs) {
            const doc = await ShiftV2.findOneAndUpdate({ code: def.code }, def, { upsert: true, new: true });
            shiftMap.set(def.code, doc);
        }

        // STEP 2: Seats
        const seatMap = new Map();
        for (let i = 1; i <= 47; i++) {
            const seat = await SeatV2.findOneAndUpdate(
                { seatNumber: String(i) },
                { seatNumber: String(i), reservedFor: 'boy' },
                { upsert: true, new: true }
            );
            seatMap.set(seat.seatNumber, seat);
        }
        for (let i = 48; i <= 72; i++) {
            const seat = await SeatV2.findOneAndUpdate(
                { seatNumber: `G${i}` },
                { seatNumber: `G${i}`, reservedFor: 'girl' },
                { upsert: true, new: true }
            );
            seatMap.set(seat.seatNumber, seat);
        }

        // STEP 3: Students
        const oldStudents = await Student.find();
        let migratedStudents = 0;
        let migratedBookings = 0;

        for (const old of oldStudents) {
            if (await StudentV2.exists({ legacyStudent: old._id })) continue;

            // Map shift
            const time = String(old.time || '').replace(/\s+/g, '').toUpperCase();
            const shiftCodeMap = {
                '07:00AM-11:00AM': 'morning',
                '11:00AM-03:00PM': 'afternoon',
                '03:00PM-07:00PM': 'evening',
                '07:00PM-11:00PM': 'night',
                '07:00AM-03:00PM': 'doublemorning',
                '11:00AM-07:00PM': 'doubleevening',
                '07:00PM-07:00AM': 'nightlong',
                '07:00AM-07:00PM': 'morninglong'
            };
            let shiftCode = shiftCodeMap[time] || 'morning';
            if (old.shift === '24 Hours' || old.shift === '24Hours') shiftCode = 'fullday';

            const shift = shiftMap.get(shiftCode);
            if (!shift) { console.log(`Shift not found for SID ${old.sid}`); continue; }

            const today = startOfDay(new Date());
            const dailyRate = parseFloat((shift.price / 30).toFixed(4));
            let validTill = startOfDay(old.nextPayment || old.admissionDate);
            let lastPaymentAt = old.lastPayment || null;
            let currentCycleStart = startOfDay(old.admissionDate);
            let currentCycleEnd = validTill;

            // Use invoice data if available
            const latestInvoice = await Invoice.findOne({ sid: old.sid }).sort({ cycleEnd: -1 });
            if (latestInvoice) {
                validTill = startOfDay(latestInvoice.cycleEnd);
                currentCycleStart = latestInvoice.cycleStart ? startOfDay(latestInvoice.cycleStart) : currentCycleStart;
                currentCycleEnd = validTill;
                lastPaymentAt = latestInvoice.paymentDate || lastPaymentAt;
            } else {
                const legacyDue = (old.paymentDue || 0) + (old.extraPaymentDue || 0);
                if (legacyDue > 0) {
                    // Push validTill back by due days
                    const dueDays = Math.ceil(legacyDue / dailyRate);
                    validTill = startOfDay(new Date(validTill.getTime() - dueDays * 86400000));
                }
            }

            // Day-based account state
            const remainingDays = diffDays(today, validTill);
            const dueFromDate = remainingDays <= 0 ? validTill : null;
            const account = deriveAccountFromDays({ remainingDays, dailyRate, asOfDate: today, dueFromDate });

            // Status resolution
            let studentStatus = account.studentStatus;
            let paymentStatus = account.paymentStatus;
            let seatStatus = old.seatNumber ? 'allotted' : 'not_allotted';

            if (old.status === 'Trash') {
                studentStatus = 'trash';
                seatStatus = 'cancelled';
            } else if (old.status === 'Pending') {
                studentStatus = 'pending';
            }

            const seatDoc = seatMap.get(old.seatNumber);

            const student = await StudentV2.create({
                legacyStudent: old._id,
                sid: old.sid,
                name: old.name,
                email: old.email ? old.email.toLowerCase() : `sid${old.sid}@migrated.local`,
                password: old.password,
                mobile: old.mobile,
                father: old.father,
                guardian: old.guardian,
                gender: old.gender,
                admissionDate: old.admissionDate,
                address: old.address,
                image: old.image, facebook: old.facebook, instagram: old.instagram, youtube: old.youtube,

                shift: {
                    shift: shift._id, code: shift.code,
                    label: shift.label, displayTime: shift.displayTime, amount: shift.price
                },
                billing: {
                    cycleAnchorDate: old.admissionDate,
                    cycleDays: 30,
                    netCycleAmount: shift.price,
                    dailyRate
                },
                seat: {
                    seat: seatDoc?._id || null,
                    seatNumber: old.seatNumber || 'Other',
                    status: seatStatus
                },
                statuses: {
                    student: studentStatus,
                    payment: paymentStatus,
                    seat: seatStatus,
                    renewal: account.renewal
                },
                account: {
                    remainingDays,
                    validTill: account.validTill,
                    dueFrom: account.dueFrom,
                    dueDays: account.dueDays,
                    dueAmount: account.dueAmount,
                    lastPaymentAt,
                    currentCycleStart,
                    currentCycleEnd
                }
            });

            migratedStudents++;

            if (seatDoc && old.seatNumber !== 'Other') {
                const booking = await SeatBookingV2.create({
                    seat: seatDoc._id,
                    seatNumber: seatDoc.seatNumber,
                    student: student._id,
                    sid: student.sid,
                    shift: {
                        code: shift.code,
                        label: shift.label,
                        displayTime: shift.displayTime,
                        startTime: shift.startTime,
                        endTime: shift.endTime
                    },
                    validFrom: old.admissionDate,
                    validTo: validTill,
                    status: old.status === 'Trash' ? 'cancelled' : 'allotted',
                    cancelledReason: old.status === 'Trash' ? 'Migrated trash student' : undefined
                });

                migratedBookings++;

                if (old.status !== 'Trash') {
                    student.seat.activeAllotment = booking._id;
                    await student.save();
                }
            }
        }

        return res.status(200).json({ success: true, migratedStudents, migratedBookings });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

// ─── Repair: Recalculate all accounts from validTill ─────────────────────────

router.post('/repair-all-accounts', async (req, res) => {
    try {
        const today = startOfDay(new Date());

        const students = await StudentV2.find({
            'statuses.student': { $nin: ['trash', 'left'] }
        });

        let updated = 0;
        let skipped = 0;

        for (const student of students) {
            if (!student.account?.validTill) { skipped++; continue; }

            const validTill = startOfDay(student.account.validTill);
            const dailyRate = Number(student.billing?.dailyRate || 0);
            const remainingDays = diffDays(today, validTill);
            const dueFromDate = remainingDays <= 0 ? validTill : null;
            const account = deriveAccountFromDays({ remainingDays, dailyRate, asOfDate: today, dueFromDate });

            await StudentV2.updateOne(
                { _id: student._id },
                {
                    $set: {
                        'account.remainingDays': remainingDays,
                        'account.dueDays': account.dueDays,
                        'account.dueAmount': account.dueAmount,
                        'account.dueFrom': account.dueFrom,
                        'statuses.payment': account.paymentStatus,
                        'statuses.student': account.studentStatus,
                        'statuses.renewal': account.renewal
                    }
                }
            );
            updated++;
        }

        return res.status(200).json({ success: true, updated, skipped });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
});

export default router;