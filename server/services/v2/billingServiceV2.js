const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function startOfDay(dateInput) {
    const date = new Date(dateInput);
    date.setHours(0, 0, 0, 0);
    return date;
}

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

export function diffDays(fromDate, toDate) {
    const from = startOfDay(fromDate);
    const to = startOfDay(toDate);
    return Math.floor((to.getTime() - from.getTime()) / MS_PER_DAY);
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

export function deriveAccountFromBalance({ balanceAmount, dailyRate, asOfDate }) {
    const balance = Number(balanceAmount || 0);
    const rate = Number(dailyRate || 0);

    if (rate <= 0) {
        return {
            advanceAmount: Math.max(balance, 0),
            dueAmount: Math.max(-balance, 0),
            creditDays: 0,
            dueDays: 0,
            validTill: startOfDay(asOfDate),
            dueFrom: balance < 0 ? startOfDay(asOfDate) : null,
            paymentStatus: balance < 0 ? 'due' : 'paid',
            studentStatus: balance < 0 ? 'pending' : 'active'
        };
    }

    const advanceAmount = Math.max(balance, 0);
    const dueAmount = Math.max(-balance, 0);
    const creditDays = Math.floor(advanceAmount / rate);
    const dueDays = Math.ceil(dueAmount / rate);
    const today = startOfDay(asOfDate);

    let paymentStatus = 'paid';
    if (dueAmount > 0) paymentStatus = balance === 0 ? 'due' : 'due';
    else if (advanceAmount >= rate) paymentStatus = 'advance';

    return {
        advanceAmount,
        dueAmount,
        creditDays,
        dueDays,
        validTill: addDays(today, creditDays),
        dueFrom: dueDays > 0 ? addDays(today, -dueDays) : null,
        paymentStatus,
        studentStatus: dueDays > 0 ? 'pending' : 'active'
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
