import StudentV2 from '../../models/v2/studentModelV2.js';

export async function syncStudentSeatSnapshotV2({ studentId, booking = null, seat = null, status, session = null }) {
    const update = {
        'statuses.seat': status,
        'seat.status': status
    };

    if (booking) {
        update['seat.activeAllotment'] = booking._id;
        update['seat.seat'] = booking.seat;
        update['seat.seatNumber'] = booking.seatNumber;
    } else if (seat) {
        update['seat.seat'] = seat._id;
        update['seat.seatNumber'] = seat.seatNumber;
    }

    return StudentV2.findByIdAndUpdate(studentId, { $set: update }, { new: true, session });
}
