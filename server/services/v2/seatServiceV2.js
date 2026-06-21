import SeatV2, { SeatBookingV2 } from '../../models/v2/seatModelV2.js';
import StudentV2 from '../../models/v2/studentModelV2.js';
import { resolveShiftV2 } from './shiftServiceV2.js';
import { syncStudentSeatSnapshotV2 } from './statusServiceV2.js';
import { timeRangesOverlap } from '../../utils/v2/timeRangeOverlapV2.js';

export async function createSeatV2({ seatNumber, reservedFor = 'any', row, label, floor, section }) {
    return SeatV2.create({ seatNumber, reservedFor, row, label, floor, section });
}

/**
 * Seat.reservedFor uses 'any' | 'boy' | 'girl'. Callers (e.g. the admission
 * form) may send a student-facing gender value instead ('Male' / 'Female' /
 * 'Not to Say' etc). This normalizes either input into the seat enum, or
 * null if the value doesn't map to a specific reservation (in which case no
 * gender filtering is applied and all reservedFor values are shown).
 */
function normalizeReservedForV2(value) {
    const normalized = String(value || '').trim().toLowerCase();
    if (['boy', 'male', 'm', 'man'].includes(normalized)) return 'boy';
    if (['girl', 'female', 'f', 'woman'].includes(normalized)) return 'girl';
    return null;
}

/**
 * A seat is available for the requested shift if NO existing status:
 * 'allotted' booking on that seat has a time-of-day window overlapping the
 * requested shift's window. This is purely status + time-of-day driven —
 * there is intentionally NO date/cycle filtering: a booking occupies its
 * seat+shift slot indefinitely until it is vacated/cancelled/expired,
 * regardless of what validFrom/validTo it was created with. See
 * findConflict in seatModelV2.js for the matching logic used at booking time.
 *
 * E.g. a currently-allotted booking for 07:00-15:00 makes that seat show as
 * unavailable for a 07:00-11:00 (morning) OR 11:00-15:00 (afternoon) lookup,
 * since both sit inside the booked window - and it stays unavailable for as
 * long as that booking remains allotted, no matter what dates were on it.
 *
 * If `gender` is provided and maps to 'boy' or 'girl', seats are further
 * restricted to those with reservedFor === 'any' OR reservedFor === that
 * gender - a 'girl'-reserved seat is never shown to a 'boy' lookup, and
 * vice versa, while unreserved ('any') seats remain visible to everyone.
 */
export async function getSeatAvailabilityV2({ shiftCode, gender }) {
    const shift = await resolveShiftV2(shiftCode);

    const seatQuery = { isActive: true, deletedAt: null };
    const reservedFor = normalizeReservedForV2(gender);
    if (reservedFor) {
        seatQuery.reservedFor = { $in: ['any', reservedFor] };
    }

    const seats = await SeatV2.find(seatQuery).sort({ seatNumber: 1 }).lean();

    // Every currently allotted booking, anywhere, is a candidate blocker -
    // no date filtering. With a reasonably sized seat inventory this is a
    // single small/cheap query (allotted bookings <= total seats), and the
    // time-of-day check below is then done in JS per-candidate.
    const bookings = await SeatBookingV2.find({ status: 'allotted' }).lean();

    const blockingBySeatId = new Map();
    for (const booking of bookings) {
        if (timeRangesOverlap(shift.startTime, shift.endTime, booking.shift.startTime, booking.shift.endTime)) {
            blockingBySeatId.set(String(booking.seat), booking);
        }
    }

    return seats.map((seat) => {
        const booking = blockingBySeatId.get(String(seat._id));
        return {
            ...seat,
            available: !booking,
            blockingBooking: booking || null
        };
    });
}

/**
 * No replica set / transactions available here (single mongod), so this is
 * NOT atomic with the conflict check + create below. There's a small race
 * window if two requests book the same seat/shift at the exact same
 * moment. The unique-ish guard is `findConflict` run immediately before
 * `create`, which covers the common case (sequential admin actions); a
 * true compound unique index on (seat, time-range-overlap) isn't
 * expressible in Mongo, so this is the best available safeguard without a
 * replica set.
 *
 * validFrom/validTo are still required here and stored on the booking for
 * invoicing/cycle reporting, but they play NO role in the conflict check -
 * see findConflict in seatModelV2.js.
 */
export async function bookSeatV2({ studentId, seatNumber, shiftCode, validFrom, validTo, linkedPayment = null }) {
    const shift = await resolveShiftV2(shiftCode);
    const seat = await SeatV2.findOne({ seatNumber, isActive: true, deletedAt: null });
    if (!seat) throw new Error('Seat not found or inactive.');

    const student = await StudentV2.findById(studentId);
    if (!student) throw new Error('Student not found.');

    const fromDate = new Date(validFrom);
    const toDate = new Date(validTo);
    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime()) || fromDate > toDate) {
        throw new Error('Valid validFrom and validTo are required.');
    }

    const conflict = await SeatBookingV2.findConflict({
        seat: seat._id,
        startTime: shift.startTime,
        endTime: shift.endTime
    });

    if (conflict) {
        throw new Error(`Seat ${seatNumber} is already allotted for an overlapping shift (${conflict.shift.label}, ${conflict.shift.displayTime}).`);
    }

    let booking;
    try {
        booking = await SeatBookingV2.create({
            seat: seat._id,
            seatNumber: seat.seatNumber,
            student: student._id,
            sid: student.sid,
            shift: {
                code: shift.code,
                label: shift.label,
                displayTime: shift.displayTime,
                startTime: shift.startTime,
                endTime: shift.endTime
            },
            validFrom: fromDate,
            validTo: toDate,
            linkedPayment
        });

        await syncStudentSeatSnapshotV2({ studentId: student._id, booking, status: 'allotted' });
    } catch (error) {
        // Manual rollback since we have no transaction to wrap this in: if
        // the booking was created but the snapshot sync failed, remove the
        // orphan booking instead of leaving it dangling.
        if (booking?._id) {
            await SeatBookingV2.findByIdAndDelete(booking._id);
        }
        throw error;
    }

    return booking;
}

// Kept as a named export for backward compatibility with any existing
// imports (e.g. paymentServiceV2.js) — no longer wraps in a transaction
// since there's no replica set, just delegates straight to bookSeatV2.
export async function bookSeatWithTransactionV2(payload) {
    return bookSeatV2(payload);
}

export async function vacateBookingV2({ bookingId, reason }) {
    const booking = await SeatBookingV2.findByIdAndUpdate(
        bookingId,
        { $set: { status: 'vacated', cancelledReason: reason } },
        { new: true }
    );

    if (!booking) throw new Error('Booking not found.');
    await syncStudentSeatSnapshotV2({ studentId: booking.student, status: 'vacated' });
    return booking;
}