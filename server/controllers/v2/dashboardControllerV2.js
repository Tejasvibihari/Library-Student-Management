import StudentV2 from '../../models/v2/studentModelV2.js';
import PaymentV2 from '../../models/v2/paymentModelV2.js';
import InvoiceV2 from '../../models/v2/invoiceModelV2.js';
import SeatV2, { SeatBookingV2 } from '../../models/v2/seatModelV2.js';
import ShiftV2 from '../../models/v2/shiftModelV2.js';

// ─── helpers ─────────────────────────────────────────────────────────────────

function startOfDay(d) {
    const dt = new Date(d);
    dt.setHours(0, 0, 0, 0);
    return dt;
}

function endOfDay(d) {
    const dt = new Date(d);
    dt.setHours(23, 59, 59, 999);
    return dt;
}

function monthRange(year, month) {
    // month is 0-indexed (JS convention)
    const from = new Date(year, month, 1);
    const to = new Date(year, month + 1, 0, 23, 59, 59, 999);
    return { from, to };
}

// ─── OVERVIEW — single-call summary for the landing card row ─────────────────

export const getDashboardOverviewV2 = async (req, res) => {
    try {
        const now = new Date();
        const todayStart = startOfDay(now);
        const todayEnd = endOfDay(now);

        // ── students ──────────────────────────────────────────────────────
        const [
            totalStudents,
            activeStudents,
            pendingStudents,
            newTodayStudents,
            dueStudents,
            advanceStudents,
        ] = await Promise.all([
            StudentV2.countDocuments(),
            StudentV2.countDocuments({ 'statuses.student': 'active' }),
            StudentV2.countDocuments({ 'statuses.student': 'pending' }),
            StudentV2.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd } }),
            StudentV2.countDocuments({ 'statuses.payment': 'due' }),
            StudentV2.countDocuments({ 'statuses.payment': 'advance' }),
        ]);

        // ── seats ─────────────────────────────────────────────────────────
        const [totalSeats, activeSeats] = await Promise.all([
            SeatV2.countDocuments({ isActive: true, deletedAt: null }),
            SeatBookingV2.countDocuments({ status: 'allotted' }),
        ]);

        // ── payments today ────────────────────────────────────────────────
        const todayPaymentsAgg = await PaymentV2.aggregate([
            {
                $match: {
                    paymentDate: { $gte: todayStart, $lte: todayEnd },
                    isReversed: false,
                },
            },
            {
                $group: {
                    _id: null,
                    totalCollected: { $sum: '$amountPaid' },
                    count: { $sum: 1 },
                },
            },
        ]);
        const todayCollection = todayPaymentsAgg[0] || { totalCollected: 0, count: 0 };

        // ── current month collections ─────────────────────────────────────
        const { from: monthFrom, to: monthTo } = monthRange(now.getFullYear(), now.getMonth());
        const monthPaymentsAgg = await PaymentV2.aggregate([
            {
                $match: {
                    paymentDate: { $gte: monthFrom, $lte: monthTo },
                    isReversed: false,
                },
            },
            {
                $group: {
                    _id: null,
                    totalCollected: { $sum: '$amountPaid' },
                    count: { $sum: 1 },
                },
            },
        ]);
        const monthCollection = monthPaymentsAgg[0] || { totalCollected: 0, count: 0 };

        // ── total dues outstanding ────────────────────────────────────────
        const dueAgg = await StudentV2.aggregate([
            { $match: { 'statuses.payment': 'due' } },
            { $group: { _id: null, totalDue: { $sum: '$account.dueAmount' } } },
        ]);
        const totalOutstandingDue = dueAgg[0]?.totalDue ?? 0;

        // ── seat occupancy breakdown by shift ─────────────────────────────
        const shiftOccupancyAgg = await SeatBookingV2.aggregate([
            { $match: { status: 'allotted' } },
            { $group: { _id: '$shift.code', label: { $first: '$shift.label' }, count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        res.json({
            students: {
                total: totalStudents,
                active: activeStudents,
                pending: pendingStudents,
                newToday: newTodayStudents,
                due: dueStudents,
                advance: advanceStudents,
            },
            seats: {
                total: totalSeats,
                occupied: activeSeats,
                vacant: totalSeats - activeSeats,
                occupancyRate: totalSeats > 0 ? Math.round((activeSeats / totalSeats) * 100) : 0,
                byShift: shiftOccupancyAgg,
            },
            collections: {
                today: todayCollection,
                thisMonth: monthCollection,
                totalOutstandingDue,
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── REVENUE TREND — last N months of payment collections ────────────────────

export const getRevenueTrendV2 = async (req, res) => {
    try {
        const months = Math.min(parseInt(req.query.months) || 6, 12);
        const now = new Date();

        const pipeline = [];
        const series = [];

        for (let i = months - 1; i >= 0; i--) {
            const year = now.getFullYear();
            const month = now.getMonth() - i;
            const d = new Date(year, month, 1);
            series.push({ year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleString('default', { month: 'short', year: '2-digit' }) });
        }

        const oldest = new Date(series[0].year, series[0].month, 1);
        const newest = endOfDay(new Date(series[series.length - 1].year, series[series.length - 1].month + 1, 0));

        const agg = await PaymentV2.aggregate([
            {
                $match: {
                    paymentDate: { $gte: oldest, $lte: newest },
                    isReversed: false,
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$paymentDate' },
                        month: { $month: '$paymentDate' },
                    },
                    collected: { $sum: '$amountPaid' },
                    count: { $sum: 1 },
                },
            },
        ]);

        const byMonthKey = {};
        for (const entry of agg) {
            byMonthKey[`${entry._id.year}-${entry._id.month - 1}`] = entry;
        }

        const trend = series.map(({ year, month, label }) => {
            const entry = byMonthKey[`${year}-${month}`];
            return {
                label,
                collected: entry?.collected ?? 0,
                count: entry?.count ?? 0,
            };
        });

        res.json({ trend });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── DUE STUDENTS — paginated list for fee recovery ──────────────────────────

export const getDueStudentsV2 = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const sortBy = req.query.sortBy || 'dueAmount'; // dueAmount | dueFrom | name
        const sortDir = req.query.sortDir === 'asc' ? 1 : -1;

        const sortField = {
            dueAmount: 'account.dueAmount',
            dueFrom: 'account.dueFrom',
            name: 'name',
        }[sortBy] || 'account.dueAmount';

        const [students, total] = await Promise.all([
            StudentV2.find({ 'statuses.payment': 'due' })
                .select('sid name mobile gender account.dueAmount account.dueFrom account.validTill seat.seatNumber shift.label image')
                .sort({ [sortField]: sortDir })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            StudentV2.countDocuments({ 'statuses.payment': 'due' }),
        ]);

        res.json({ students, total, page, limit, pages: Math.ceil(total / limit) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── EXPIRY FORECAST — students whose validity ends soon ─────────────────────

export const getExpiryForecastV2 = async (req, res) => {
    try {
        const days = Math.min(parseInt(req.query.days) || 7, 30);
        const now = new Date();
        const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

        const students = await StudentV2.find({
            'statuses.student': 'active',
            'account.validTill': { $gte: now, $lte: cutoff },
        })
            .select('sid name mobile shift.label seat.seatNumber account.validTill account.dueAmount')
            .sort({ 'account.validTill': 1 })
            .lean();

        res.json({ students, days });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── SHIFT OCCUPANCY — live seat count per shift ─────────────────────────────

export const getShiftOccupancyV2 = async (req, res) => {
    try {
        const [shifts, allBookings, totalSeats] = await Promise.all([
            ShiftV2.find({ isActive: true, deletedAt: null }).sort({ displayOrder: 1 }).lean({ virtuals: true }),
            SeatBookingV2.find({ status: 'allotted' }).select('shift').lean(),
            SeatV2.countDocuments({ isActive: true, deletedAt: null }),
        ]);

        const countByCode = {};
        for (const b of allBookings) {
            countByCode[b.shift.code] = (countByCode[b.shift.code] || 0) + 1;
        }

        const occupancy = shifts.map(s => ({
            code: s.code,
            label: s.label,
            displayTime: s.displayTime,
            price: s.price,
            occupied: countByCode[s.code] || 0,
            total: totalSeats,
            vacancyRate: totalSeats > 0 ? Math.round(((totalSeats - (countByCode[s.code] || 0)) / totalSeats) * 100) : 100,
        }));

        res.json({ occupancy, totalSeats });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── RECENT ACTIVITY — latest payments & new students ────────────────────────

export const getRecentActivityV2 = async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 10, 30);

        const [recentPayments, recentStudents] = await Promise.all([
            PaymentV2.find({ isReversed: false })
                .sort({ createdAt: -1 })
                .limit(limit)
                .select('sid amountPaid paymentDate method paymentType shiftSnapshot.label')
                .populate('student', 'name')
                .lean(),
            StudentV2.find()
                .sort({ createdAt: -1 })
                .limit(limit)
                .select('sid name shift.label admissionDate statuses.student image')
                .lean(),
        ]);

        res.json({ recentPayments, recentStudents });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── GENDER & STATUS BREAKDOWN — for pie/donut charts ───────────────────────

export const getStudentBreakdownV2 = async (req, res) => {
    try {
        const [genderAgg, statusAgg, paymentStatusAgg, shiftAgg] = await Promise.all([
            StudentV2.aggregate([
                { $group: { _id: '$gender', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
            StudentV2.aggregate([
                { $group: { _id: '$statuses.student', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
            StudentV2.aggregate([
                { $group: { _id: '$statuses.payment', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
            StudentV2.aggregate([
                { $group: { _id: '$shift.code', label: { $first: '$shift.label' }, count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
        ]);

        res.json({ gender: genderAgg, studentStatus: statusAgg, paymentStatus: paymentStatusAgg, byShift: shiftAgg });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─── COLLECTION SUMMARY — detailed breakdown for a given month ───────────────

export const getCollectionSummaryV2 = async (req, res) => {
    try {
        const now = new Date();
        const year = parseInt(req.query.year) || now.getFullYear();
        const month = parseInt(req.query.month) ?? now.getMonth(); // 0-indexed

        const { from, to } = monthRange(year, month);

        const [byMethod, byType, byShift, dailyAgg] = await Promise.all([
            PaymentV2.aggregate([
                { $match: { paymentDate: { $gte: from, $lte: to }, isReversed: false } },
                { $group: { _id: '$method', total: { $sum: '$amountPaid' }, count: { $sum: 1 } } },
                { $sort: { total: -1 } },
            ]),
            PaymentV2.aggregate([
                { $match: { paymentDate: { $gte: from, $lte: to }, isReversed: false } },
                { $group: { _id: '$paymentType', total: { $sum: '$amountPaid' }, count: { $sum: 1 } } },
                { $sort: { total: -1 } },
            ]),
            PaymentV2.aggregate([
                { $match: { paymentDate: { $gte: from, $lte: to }, isReversed: false } },
                { $group: { _id: '$shiftSnapshot.code', label: { $first: '$shiftSnapshot.label' }, total: { $sum: '$amountPaid' }, count: { $sum: 1 } } },
                { $sort: { total: -1 } },
            ]),
            PaymentV2.aggregate([
                { $match: { paymentDate: { $gte: from, $lte: to }, isReversed: false } },
                {
                    $group: {
                        _id: { $dayOfMonth: '$paymentDate' },
                        total: { $sum: '$amountPaid' },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
        ]);

        // Build a full-month daily array (1..daysInMonth) filling gaps with 0
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const dailyMap = {};
        for (const d of dailyAgg) dailyMap[d._id] = d;

        const daily = Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            return { day, total: dailyMap[day]?.total ?? 0, count: dailyMap[day]?.count ?? 0 };
        });

        res.json({ year, month, byMethod, byType, byShift, daily });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};