import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Student from '../models/studentModel.js';
import Seat from '../models/seatModel.js';
import Payment from '../models/paymentModel.js';
import Invoice from '../models/invoiceModel.js';
import StudentV2 from '../models/v2/studentModelV2.js';
import SeatV2, { SeatBookingV2 } from '../models/v2/seatModelV2.js';
import PaymentV2 from '../models/v2/paymentModelV2.js';
import InvoiceV2 from '../models/v2/invoiceModelV2.js';
import ShiftV2, { DEFAULT_SHIFTS_V2 } from '../models/v2/shiftModelV2.js';
import { ensureDefaultShiftsV2 } from '../services/v2/shiftServiceV2.js';
import { calculatePaymentSnapshotV2 } from '../services/v2/statusServiceV2.js';

dotenv.config();

const shouldWrite = process.argv.includes('--write');

function addOneMonth(date) {
    const next = new Date(date);
    next.setMonth(next.getMonth() + 1);
    return next;
}

function normalizeStudentStatus(status) {
    const value = String(status || '').toLowerCase();
    if (value === 'active') return 'active';
    if (value === 'trash') return 'trash';
    if (value === 'deactive' || value === 'inactive') return 'inactive';
    if (value === 'left') return 'left';
    return 'pending';
}

function shiftKeyFromStudent(student) {
    const time = student.time;
    if (time === '07:00AM - 11:00AM') return 'morning';
    if (time === '11:00AM - 03:00PM') return 'afternoon';
    if (time === '03:00PM - 07:00PM') return 'evening';
    if (time === '07:00PM - 11:00PM') return 'night';
    if (time === '07:00PM - 07:00AM') return 'nightlong';
    if (time === '07:00AM - 03:00PM') return 'doublemorning';
    if (time === '11:00AM - 07:00PM') return 'doubleevening';
    if (time === '07:00AM - 07:00PM') return 'morninglong';
    return 'fullday';
}

async function resolveShiftForMigration(code) {
    const normalized = String(code || '').toLowerCase();
    const existing = await ShiftV2.findOne({ code: normalized }).lean();
    if (existing) return existing;

    const fallback = DEFAULT_SHIFTS_V2.find((shift) => shift.code === normalized);
    if (!fallback) throw new Error(`Shift not found for code: ${code}`);
    return fallback;
}

async function migrateSeats(report) {
    const seats = await Seat.find().lean();
    report.oldSeats = seats.length;

    for (const seat of seats) {
        const exists = await SeatV2.findOne({ seatNumber: seat.seatNumber }).lean();
        if (exists) {
            report.skippedSeats += 1;
            continue;
        }

        report.createdSeats += 1;
        if (shouldWrite) {
            await SeatV2.create({
                legacySeat: seat._id,
                seatNumber: seat.seatNumber,
                label: seat.seatNumber,
                isActive: true
            });
        }
    }
}

async function migrateStudents(report) {
    const students = await Student.find().lean();
    report.oldStudents = students.length;

    for (const oldStudent of students) {
        const existing = await StudentV2.findOne({ sid: oldStudent.sid }).lean();
        if (existing) {
            report.skippedStudents += 1;
            continue;
        }

        const shift = await resolveShiftForMigration(shiftKeyFromStudent(oldStudent));
        const feeAmount = Number(oldStudent.paymentAmount || shift.price || shift.feeAmount || 0);
        const cycleStart = oldStudent.lastPayment || oldStudent.admissionDate || new Date();
        const cycleEnd = oldStudent.nextPayment || addOneMonth(cycleStart);
        const balanceDue = Math.max(Math.abs(Number(oldStudent.paymentDue || 0)), 0);
        const advanceBalance = Math.max(Number(oldStudent.extraPaymentDue || 0), 0);
        const password = oldStudent.password || await bcrypt.hash(`${String(oldStudent.name || '').slice(0, 4).toUpperCase()}${String(oldStudent.mobile || '').slice(-4)}`, 12);

        report.createdStudents += 1;
        if (!shouldWrite) continue;

        const created = await StudentV2.create({
            legacyStudent: oldStudent._id,
            sid: oldStudent.sid,
            name: oldStudent.name,
            email: oldStudent.email,
            password,
            mobile: oldStudent.mobile,
            father: oldStudent.father,
            guardian: oldStudent.guardian,
            gender: oldStudent.gender,
            admissionDate: oldStudent.admissionDate,
            address: oldStudent.address,
            image: oldStudent.image,
            instagram: oldStudent.instagram,
            facebook: oldStudent.facebook,
            youtube: oldStudent.youtube,
            isOnline: oldStudent.isOnline,
            shift: {
                code: shift.code,
                label: oldStudent.shift || shift.label,
                displayTime: oldStudent.time || shift.displayTime,
                feeAmount
            },
            seat: {
                seatNumber: oldStudent.seatNumber || 'Other',
                status: oldStudent.seatNumber && oldStudent.seatNumber !== 'Other' ? 'vacant' : 'not_assigned'
            },
            statuses: {
                student: normalizeStudentStatus(oldStudent.status),
                payment: balanceDue > 0 ? 'due' : 'paid',
                seat: oldStudent.seatNumber && oldStudent.seatNumber !== 'Other' ? 'vacant' : 'not_assigned'
            },
            currentCycle: {
                cycleStart,
                cycleEnd,
                cycleFee: feeAmount,
                balanceDue,
                advanceBalance,
                lastPayment: oldStudent.lastPayment,
                nextPayment: oldStudent.nextPayment
            }
        });

        if (oldStudent.seatNumber && oldStudent.seatNumber !== 'Other') {
            const seat = await SeatV2.findOne({ seatNumber: oldStudent.seatNumber });
            if (!seat) continue;

            const conflict = await SeatBookingV2.findConflict({
                seat: seat._id,
                occupiedSlots: shift.occupiedSlots,
                validFrom: new Date(cycleStart),
                validTo: new Date(cycleEnd)
            });

            if (conflict) {
                report.skippedBookings += 1;
                continue;
            }

            const booking = await SeatBookingV2.create({
                seat: seat._id,
                seatNumber: seat.seatNumber,
                student: created._id,
                sid: created.sid,
                shift: {
                    code: shift.code,
                    label: shift.label,
                    displayTime: shift.displayTime,
                    occupiedSlots: shift.occupiedSlots
                },
                validFrom: cycleStart,
                validTo: cycleEnd
            });

            await StudentV2.findByIdAndUpdate(created._id, {
                $set: {
                    'seat.seat': seat._id,
                    'seat.activeBooking': booking._id,
                    'seat.status': 'booked',
                    'statuses.seat': 'booked'
                }
            });
            report.createdBookings += 1;
        }
    }
}

async function migratePaymentsAndInvoices(report) {
    const payments = await Payment.find().sort({ payment_date: 1, createdAt: 1 }).lean();
    report.oldPayments = payments.length;

    for (const oldPayment of payments) {
        const existing = await PaymentV2.findOne({ legacyPayment: oldPayment._id }).lean();
        if (existing) {
            report.skippedPayments += 1;
            continue;
        }

        const student = await StudentV2.findOne({ sid: oldPayment.sid });
        if (!student) {
            report.skippedPayments += 1;
            continue;
        }

        const cycleStart = oldPayment.admissionDate || oldPayment.payment_date || student.currentCycle?.cycleStart || student.admissionDate;
        const months = Number(oldPayment.months_paid_for || 1);
        const cycleEnd = addOneMonth(cycleStart);
        cycleEnd.setMonth(new Date(cycleStart).getMonth() + months);
        const cycleFee = Number(student.shift?.feeAmount || oldPayment.amount || 0) * months;
        const amountPaid = Number(oldPayment.amount || 0);
        const snapshot = calculatePaymentSnapshotV2({ cycleFee, amountPaid });

        report.createdPayments += 1;
        if (!shouldWrite) continue;

        const payment = await PaymentV2.create({
            legacyPayment: oldPayment._id,
            student: student._id,
            sid: student.sid,
            paymentDate: oldPayment.payment_date,
            cycleStart,
            cycleEnd,
            cycleFee,
            amountPaid,
            balanceDue: snapshot.balanceDue,
            advanceBalance: snapshot.advanceBalance,
            paymentType: snapshot.paymentType,
            status: snapshot.status
        });

        const legacyInvoice = await Invoice.findOne({
            sid: oldPayment.sid,
            paymentDate: oldPayment.payment_date
        }).lean();
        const invoiceNumber = oldPayment.invoiceNumber || await InvoiceV2.getNextInvoiceNumber();
        const invoice = await InvoiceV2.create({
            legacyInvoice: legacyInvoice?._id,
            invoiceNumber,
            student: student._id,
            sid: student.sid,
            payment: payment._id,
            cycleStart,
            cycleEnd,
            items: [{ label: `${student.shift.label} fee`, amount: cycleFee }],
            cycleFee,
            amountPaid,
            balanceDue: snapshot.balanceDue,
            advanceBalance: snapshot.advanceBalance,
            status: snapshot.status,
            issuedAt: oldPayment.payment_date
        });

        payment.invoice = invoice._id;
        await payment.save();
        report.createdInvoices += 1;
    }
}

async function main() {
    if (!process.env.MONGODB_URL) {
        throw new Error('MONGODB_URL is required.');
    }

    await mongoose.connect(process.env.MONGODB_URL);
    if (shouldWrite) {
        await ensureDefaultShiftsV2();
    }

    const report = {
        mode: shouldWrite ? 'write' : 'dry-run',
        oldSeats: 0,
        oldStudents: 0,
        oldPayments: 0,
        createdSeats: 0,
        createdStudents: 0,
        createdBookings: 0,
        createdPayments: 0,
        createdInvoices: 0,
        skippedSeats: 0,
        skippedStudents: 0,
        skippedBookings: 0,
        skippedPayments: 0
    };

    await migrateSeats(report);
    await migrateStudents(report);
    await migratePaymentsAndInvoices(report);

    console.table(report);
    await mongoose.disconnect();
}

main().catch(async (error) => {
    console.error(error);
    await mongoose.disconnect();
    process.exit(1);
});
