import mongoose from 'mongoose';

const { Schema } = mongoose;
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

function timeToMinutes(time) {
    const [hours, minutes] = String(time || '00:00').split(':').map(Number);
    return (hours * 60) + minutes;
}

export function calculateDurationMinutes(startTime, endTime) {
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);
    const duration = end > start ? end - start : (24 * 60) - start + end;
    return duration === 0 ? 24 * 60 : duration;
}

function slugify(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    if (!remainder) return `${hours}h`;
    return `${hours}h ${remainder}m`;
}

const shiftSchemaV2 = new Schema({
    code: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    label: { type: String, required: true, trim: true },
    startTime: { type: String, required: true, match: TIME_REGEX },
    endTime: { type: String, required: true, match: TIME_REGEX },
    durationMinutes: { type: Number, required: true, min: 1 },
    durationLabel: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
    deletedAt: { type: Date, default: null, index: true }
}, {
    collection: 'shifts_v2',
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

shiftSchemaV2.index({ isActive: 1, deletedAt: 1, displayOrder: 1 });

shiftSchemaV2.virtual('displayTime').get(function () {
    return `${this.startTime} - ${this.endTime}`;
});

shiftSchemaV2.pre('validate', function (next) {
    this.code = slugify(this.code || this.label);
    this.durationMinutes = calculateDurationMinutes(this.startTime, this.endTime);
    this.durationLabel = formatDuration(this.durationMinutes);
    next();
});

const ShiftV2 = mongoose.models.ShiftV2 || mongoose.model('ShiftV2', shiftSchemaV2);

export const DEFAULT_SHIFTS_V2 = [
    { code: 'morning', label: 'Morning', startTime: '07:00', endTime: '11:00', price: 300, displayOrder: 10 },
    { code: 'afternoon', label: 'Afternoon', startTime: '11:00', endTime: '15:00', price: 300, displayOrder: 20 },
    { code: 'evening', label: 'Evening', startTime: '15:00', endTime: '19:00', price: 300, displayOrder: 30 },
    { code: 'night', label: 'Night', startTime: '19:00', endTime: '23:00', price: 300, displayOrder: 40 },
    { code: 'fullday', label: '24 Hours', startTime: '00:00', endTime: '00:00', price: 1000, displayOrder: 90 }
];

export default ShiftV2;