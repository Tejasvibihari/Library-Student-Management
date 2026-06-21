import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Legacy Models
import Student from '../models/studentModel.js';
import Seat from '../models/seatModel.js';
import Payment from '../models/paymentModel.js';

// V2 Models
import StudentV2 from '../models/v2/studentModelV2.js';
import SeatV2, { SeatBookingV2 } from '../models/v2/seatModelV2.js';
import ShiftV2 from '../models/v2/shiftModelV2.js';
import PaymentV2 from '../models/v2/paymentModelV2.js';
import InvoiceV2 from '../models/v2/invoiceModelV2.js';

// V2 Services
import { ensureDefaultShiftsV2, resolveShiftV2 } from '../services/v2/shiftServiceV2.js';
import { calculateStudentBilling, deriveAccountFromBalance, startOfDay, diffDays, getCycleForDate } from '../services/v2/billingServiceV2.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function runMigration() {
    console.log('Starting V1 to V2 migration...');
    const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/biharilibrary';
    
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB:', mongoUrl);

    // 1. Ensure Shifts exist
    console.log('Ensuring default shifts...');
    await ensureDefaultShiftsV2();
    const allShifts = await ShiftV2.find({ isActive: true, deletedAt: null });
    console.log(`Loaded ${allShifts.length} V2 shifts.`);

    // 2. Migrate Seats
    console.log('Migrating seats...');
    const legacySeats = await Seat.find();
    console.log(`Found ${legacySeats.length} legacy seats.`);

    let seatMigratedCount = 0;
    for (const legacySeat of legacySeats) {
        const exists = await SeatV2.exists({ seatNumber: legacySeat.seatNumber });
        if (!exists) {
            // Determine row from seatNumber prefix (e.g. "A12" -> "A")
            const match = legacySeat.seatNumber.match(/^([A-Za-z]+)/);
            const row = match ? match[1].toUpperCase() : 'A';
            
            await SeatV2.create({
                seatNumber: legacySeat.seatNumber,
                reservedFor: 'any',
                row,
                isActive: true,
                deletedAt: null
            });
            seatMigratedCount++;
        }
    }
    console.log(`Migrated ${seatMigratedCount} seats to V2.`);

    // 3. Migrate Students
    console.log('Migrating students...');
    const legacyStudents = await Student.find();
    console.log(`Found ${legacyStudents.length} legacy students.`);

    let studentMigratedCount = 0;
    const today = startOfDay(new Date());

    for (const legacyStudent of legacyStudents) {
        const exists = await StudentV2.exists({ sid: legacyStudent.sid });
        if (exists) {
            console.log(`Student with SID ${legacyStudent.sid} already exists in V2. Skipping.`);
            continue;
        }

        // Map legacy shift name to V2 Shift code
        let shiftCode = 'morning';
        const legacyShift = String(legacyStudent.shift || '').toLowerCase();
        if (legacyShift.includes('afternoon')) shiftCode = 'afternoon';
        else if (legacyShift.includes('evening')) shiftCode = 'evening';
        else if (legacyShift.includes('night') && !legacyShift.includes('long')) shiftCode = 'night';
        else if (legacyShift.includes('24') || legacyShift.includes('full')) shiftCode = 'fullday';

        let shiftDoc;
        try {
            shiftDoc = await resolveShiftV2(shiftCode);
        } catch (err) {
            shiftDoc = allShifts[0]; // fallback
        }

        const admission = startOfDay(legacyStudent.admissionDate || new Date());
        
        // Calculate V2 billing details
        const billing = calculateStudentBilling({
            shiftAmount: legacyStudent.paymentAmount || shiftDoc.price,
            fixedDiscountAmount: 0,
            cycleDays: 30
        });

        // Calculate account balances
        let balanceAmount = 0;
        let activeValidTill = admission;

        if (legacyStudent.nextPayment) {
            activeValidTill = startOfDay(legacyStudent.nextPayment);
            const dayDelta = diffDays(today, activeValidTill);
            if (dayDelta > 0) {
                // validity is in future -> credit
                balanceAmount = dayDelta * billing.dailyRate;
            } else {
                // validity is in past -> due
                balanceAmount = dayDelta * billing.dailyRate; // negative balance
            }
        } else {
            // fallback using legacy paymentDue and extraPaymentDue fields
            const due = Number(legacyStudent.paymentDue || 0);
            const extra = Number(legacyStudent.extraPaymentDue || 0);
            balanceAmount = extra - due;
        }

        const liveAccount = deriveAccountFromBalance({
            balanceAmount,
            dailyRate: billing.dailyRate,
            asOfDate: today
        });

        const cycle = getCycleForDate(admission, today);

        // Map V1 status string to V2 status enum
        let studentStatus = 'pending';
        const legStatus = String(legacyStudent.status || '').toLowerCase();
        if (legStatus === 'active') studentStatus = 'active';
        else if (legStatus === 'deactive' || legStatus === 'inactive') studentStatus = 'inactive';
        else if (legStatus === 'left') studentStatus = 'left';
        else if (legStatus === 'trash') studentStatus = 'trash';

        // Retrieve seat ref if assigned
        let seatRef = null;
        let seatNum = legacyStudent.seatNumber || 'Other';
        if (seatNum && seatNum !== 'Other') {
            const seatDoc = await SeatV2.findOne({ seatNumber: seatNum });
            if (seatDoc) seatRef = seatDoc._id;
        }

        const [newStudent] = await StudentV2.create([{
            legacyStudent: legacyStudent._id,
            sid: legacyStudent.sid,
            name: legacyStudent.name,
            email: legacyStudent.email,
            password: legacyStudent.password, // Keep the hashed password
            mobile: legacyStudent.mobile,
            father: legacyStudent.father,
            guardian: legacyStudent.guardian || '',
            gender: legacyStudent.gender,
            admissionDate: admission,
            address: legacyStudent.address,
            image: legacyStudent.image,
            instagram: legacyStudent.instagram,
            facebook: legacyStudent.facebook,
            youtube: legacyStudent.youtube,
            isOnline: legacyStudent.isOnline || false,
            shift: {
                shift: shiftDoc._id,
                code: shiftDoc.code,
                label: shiftDoc.label,
                displayTime: shiftDoc.displayTime || `${shiftDoc.startTime} - ${shiftDoc.endTime}`,
                amount: legacyStudent.paymentAmount || shiftDoc.price
            },
            billing: {
                cycleAnchorDate: admission,
                cycleDays: 30,
                fixedDiscountAmount: 0,
                fixedDiscountReason: '',
                netCycleAmount: billing.netCycleAmount,
                dailyRate: billing.dailyRate
            },
            seat: {
                seat: seatRef,
                seatNumber: seatNum,
                status: seatRef ? 'allotted' : 'not_allotted'
            },
            statuses: {
                student: studentStatus,
                payment: liveAccount.paymentStatus,
                seat: seatRef ? 'allotted' : 'not_allotted'
            },
            account: {
                balanceAmount,
                advanceAmount: liveAccount.advanceAmount,
                dueAmount: liveAccount.dueAmount,
                creditDays: liveAccount.creditDays,
                dueDays: liveAccount.dueDays,
                validTill: activeValidTill,
                dueFrom: liveAccount.dueFrom,
                currentCycleStart: cycle.cycleStart,
                currentCycleEnd: cycle.cycleEnd,
                lastPaymentAt: legacyStudent.lastPayment ? startOfDay(legacyStudent.lastPayment) : null
            }
        }]);

        // Create seat allotment booking in V2 if seat is allotted and active
        if (seatRef && studentStatus === 'active') {
            await SeatBookingV2.create({
                seat: seatRef,
                seatNumber: seatNum,
                student: newStudent._id,
                sid: newStudent.sid,
                shift: {
                    code: shiftDoc.code,
                    label: shiftDoc.label,
                    displayTime: shiftDoc.displayTime || `${shiftDoc.startTime} - ${shiftDoc.endTime}`,
                    occupiedSlots: shiftDoc.occupiedSlots || [shiftDoc.code]
                },
                validFrom: admission,
                validTo: activeValidTill,
                status: 'allotted'
            });
        }

        studentMigratedCount++;
    }
    console.log(`Migrated ${studentMigratedCount} students to V2.`);

    // 4. Migrate Payments & Invoices
    console.log('Migrating payments & invoices...');
    const legacyPayments = await Payment.find().sort({ payment_date: 1 });
    console.log(`Found ${legacyPayments.length} legacy payments.`);

    let paymentMigratedCount = 0;
    for (const legacyPayment of legacyPayments) {
        const exists = await PaymentV2.exists({ legacyPayment: legacyPayment._id });
        if (exists) continue;

        const student = await StudentV2.findOne({ sid: legacyPayment.sid });
        if (!student) {
            console.log(`Skipping payment for SID ${legacyPayment.sid} because student does not exist in V2.`);
            continue;
        }

        const amount = Number(legacyPayment.amount || 0);
        const pDate = startOfDay(legacyPayment.payment_date || new Date());
        
        // Calculate cycle start and end
        const cycle = getCycleForDate(student.billing.cycleAnchorDate, pDate);

        // Create V2 Payment Ledger Entry
        const [newPayment] = await PaymentV2.create([{
            legacyPayment: legacyPayment._id,
            student: student._id,
            sid: student.sid,
            paymentDate: pDate,
            cycleStart: cycle.cycleStart,
            cycleEnd: cycle.cycleEnd,
            shiftSnapshot: {
                code: student.shift.code,
                label: student.shift.label,
                displayTime: student.shift.displayTime,
                amount: student.shift.amount
            },
            grossCycleAmount: student.shift.amount,
            fixedDiscountAmount: student.billing.fixedDiscountAmount,
            oneTimeDiscountAmount: 0,
            netCycleAmount: student.billing.netCycleAmount,
            dailyRate: student.billing.dailyRate,
            amountPaid: amount,
            effectiveCreditAmount: amount,
            balanceBefore: student.account.balanceAmount - amount, // reconstruct previous
            balanceAfter: student.account.balanceAmount,
            paymentType: 'normal',
            status: 'paid',
            method: 'cash'
        }]);

        // Generate V2 Invoice item
        const invoiceNum = legacyPayment.invoiceNumber || await InvoiceV2.getNextInvoiceNumber();
        const [invoice] = await InvoiceV2.create([{
            legacyInvoice: null,
            invoiceNumber: invoiceNum,
            student: student._id,
            sid: student.sid,
            payment: newPayment._id,
            issuedAt: pDate,
            cycleStart: cycle.cycleStart,
            cycleEnd: cycle.cycleEnd,
            items: [
                { label: `${student.shift.label} cycle fee`, amount: student.shift.amount, kind: 'fee' },
                { label: 'Payment received', amount: -amount, kind: 'payment' }
            ],
            grossCycleAmount: student.shift.amount,
            fixedDiscountAmount: 0,
            oneTimeDiscountAmount: 0,
            netCycleAmount: student.billing.netCycleAmount,
            amountPaid: amount,
            status: 'paid'
        }]);

        newPayment.invoice = invoice._id;
        await newPayment.save();

        paymentMigratedCount++;
    }
    console.log(`Migrated ${paymentMigratedCount} payments to V2.`);

    await mongoose.connection.close();
    console.log('Migration completed successfully!');
}

runMigration().catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
});
