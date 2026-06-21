import ShiftV2 from '../../models/v2/shiftModelV2.js';

export async function getActiveShiftsV2() {
    return ShiftV2.find({ isActive: true, deletedAt: null }).sort({ displayOrder: 1, label: 1 }).lean({ virtuals: true });
}

export async function resolveShiftV2(shiftCodeOrTime) {
    const normalized = String(shiftCodeOrTime || '').trim().toLowerCase();
    const shift = await ShiftV2.findOne({
        isActive: true,
        deletedAt: null,
        $or: [
            { code: normalized },
            { displayTime: shiftCodeOrTime }
        ]
    });

    if (!shift) {
        throw new Error('Invalid or inactive shift.');
    }

    return shift.toObject({ virtuals: true });
}