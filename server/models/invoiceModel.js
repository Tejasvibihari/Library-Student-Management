import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const invoiceSchema = new Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    sid: {
        type: Number,
        required: true
    },

    // Payment made on this date
    paymentDate: {
        type: Date,
        default: Date.now
    },

    // Cycle for which payment was made (e.g., 1 Aug - 31 Aug)
    cycleStart: {
        type: Date,
        required: true
    },
    cycleEnd: {
        type: Date,
        required: true
    },

    // Amount paid for the cycle (standard fee)
    amountPaid: {
        type: Number,
        required: true
    },

    // Any extra amount paid voluntarily or as adjustment
    extraAmountPaid: {
        type: Number,
        default: 0
    },

    // If there is any still remaining due after this payment
    remainingDue: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true
});

export default mongoose.model('Invoice', invoiceSchema);
