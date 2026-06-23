const MS_PER_DAY = 24 * 60 * 60 * 1000;



export function addDays(dateInput, days) {
    const date = startOfDay(dateInput);
    date.setDate(date.getDate() + Number(days || 0));
    return date;
}

export function addMonths(dateInput, months = 1) {
    const date = startOfDay(dateInput);
    date.setMonth(date.getMonth() + Number(months || 1));
    return date;
}



export function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

export function diffDays(from, to) {
    return Math.floor(
        (startOfDay(to) - startOfDay(from)) / MS_PER_DAY
    );
}



export function deriveAccount({
    balanceAmount = 0,
    validTill,
    dailyRate,
    today = new Date()
}) {

    const now = startOfDay(today);
    const validDate = validTill
        ? startOfDay(validTill)
        : now;

    const advanceAmount =
        balanceAmount > 0
            ? balanceAmount
            : 0;

    const dueAmount =
        balanceAmount < 0
            ? Math.abs(balanceAmount)
            : 0;

    const cycleDaysLeft =
        validDate > now
            ? diffDays(now, validDate)
            : 0;

    const advanceDays =
        dailyRate > 0
            ? Math.floor(
                advanceAmount / dailyRate
            )
            : 0;

    const dueDays =
        dailyRate > 0
            ? Math.ceil(
                dueAmount / dailyRate
            )
            : 0;

    const remainingDays =
        cycleDaysLeft +
        advanceDays;

    let paymentStatus = "paid";

    if (dueAmount > 0)
        paymentStatus = "due";
    else if (advanceAmount > 0)
        paymentStatus = "advance";

    let studentStatus =
        paymentStatus === "due"
            ? "pending"
            : "active";

    let renewal = "safe";

    if (remainingDays <= 0)
        renewal = "expired";
    else if (remainingDays <= 3)
        renewal = "urgent";
    else if (remainingDays <= 7)
        renewal = "warning";

    return {

        advanceAmount,
        dueAmount,

        remainingDays,
        advanceDays,
        dueDays,

        dueFrom:
            dueAmount > 0
                ? validDate
                : null,

        paymentStatus,
        studentStatus,
        renewal
    };
}

export function getCycleForDate(anchorDate, targetDate) {
    const anchor = startOfDay(anchorDate);
    const target = startOfDay(targetDate);

    let cycleStart = new Date(anchor);
    while (addMonths(cycleStart, 1) <= target) {
        cycleStart = addMonths(cycleStart, 1);
    }

    return {
        cycleStart,
        cycleEnd: addMonths(cycleStart, 1)
    };
}

export function calculateStudentBilling({ shiftAmount, fixedDiscountAmount = 0, cycleDays = 30 }) {
    const netCycleAmount = Math.max(Number(shiftAmount || 0) - Number(fixedDiscountAmount || 0), 0);
    const dailyRate = cycleDays > 0 ? netCycleAmount / cycleDays : 0;
    return {
        netCycleAmount,
        dailyRate
    };
}

// FIX (Bug 3): Balance can only be positive OR negative, never both.
// If balance >= 0 → advanceAmount = balance, dueAmount = 0.
// If balance < 0  → dueAmount = -balance, advanceAmount = 0.
export function deriveAccountFromBalance({ balanceAmount, dailyRate, asOfDate }) {
    const balance = Number(balanceAmount || 0);
    const rate = Number(dailyRate || 0);
    const today = startOfDay(asOfDate);

    // Single source of truth: balance sign determines which side we're on
    const advanceAmount = balance > 0 ? balance : 0;
    const dueAmount = balance < 0 ? -balance : 0;

    if (rate <= 0) {
        return {
            advanceAmount,
            dueAmount,
            creditDays: 0,
            dueDays: 0,
            validTill: today,
            dueFrom: dueAmount > 0 ? today : null,
            paymentStatus: dueAmount > 0 ? 'due' : 'paid',
            studentStatus: dueAmount > 0 ? 'pending' : 'active'
        };
    }

    const creditDays = advanceAmount > 0 ? Math.floor(advanceAmount / rate) : 0;
    const dueDays = dueAmount > 0 ? Math.ceil(dueAmount / rate) : 0;

    let paymentStatus;
    if (dueAmount > 0) paymentStatus = 'due';
    else if (advanceAmount >= rate) paymentStatus = 'advance'; // enough for at least one more day
    else if (creditDays > 0) paymentStatus = 'paid';    // has some days left
    else paymentStatus = 'due';     // balance is exactly 0

    return {
        advanceAmount,
        dueAmount,
        creditDays,
        dueDays,
        validTill: addDays(today, creditDays),
        dueFrom: dueDays > 0 ? addDays(today, -dueDays) : null,
        paymentStatus,
        studentStatus: paymentStatus === 'due' ? 'pending' : 'active'
    };
}

export function getLiveStudentAccount(student, asOfDate = new Date()) {
    const rate = Number(student.billing?.dailyRate || 0);
    const storedBalance = Number(student.account?.balanceAmount || 0);
    const validTill = student.account?.validTill || student.admissionDate;
    const dayDelta = diffDays(validTill, asOfDate);

    let liveBalance = storedBalance;
    if (dayDelta > 0 && rate > 0) {
        liveBalance -= dayDelta * rate;
    }

    return {
        balanceAmount: liveBalance,
        ...deriveAccountFromBalance({
            balanceAmount: liveBalance,
            dailyRate: rate,
            asOfDate
        })
    };
}

export function classifyPayment({ amountPaid, oneTimeDiscountAmount, dueAmountBefore, dueAmountAfter, advanceAmountAfter }) {
    const credit = Number(amountPaid || 0) + Number(oneTimeDiscountAmount || 0);
    if (advanceAmountAfter > 0) return { paymentType: 'advance', status: 'advance' };
    if (dueAmountAfter > 0 && credit > 0) return { paymentType: 'partial', status: 'partial' };
    if (dueAmountBefore > 0 && dueAmountAfter === 0) return { paymentType: 'due_clearance', status: 'paid' };
    if (credit === 0 && oneTimeDiscountAmount > 0) return { paymentType: 'discount_adjustment', status: 'paid' };
    return { paymentType: 'normal', status: 'paid' };
}
