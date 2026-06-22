import express from 'express';
import {
    getDashboardOverviewV2,
    getRevenueTrendV2,
    getDueStudentsV2,
    getExpiryForecastV2,
    getShiftOccupancyV2,
    getRecentActivityV2,
    getStudentBreakdownV2,
    getCollectionSummaryV2,
} from '../../controllers/v2/dashboardControllerV2.js';

// Uncomment and swap in your real auth middleware:
// import { verifyAdmin } from '../../middleware/auth.js';

const dashboardRouterV2 = express.Router();

// ── GET /api/v2/dashboard/overview
// KPI cards: student counts, seat occupancy, today's & this-month's collections, outstanding dues
dashboardRouterV2.get('/overview', getDashboardOverviewV2);

// ── GET /api/v2/dashboard/revenue-trend?months=6
// Monthly collection series for the bar/line chart (1–12 months, default 6)
dashboardRouterV2.get('/revenue-trend', getRevenueTrendV2);

// ── GET /api/v2/dashboard/due-students?page=1&limit=20&sortBy=dueAmount&sortDir=desc
// Paginated due-student list for fee-recovery table (sort: dueAmount | dueFrom | name)
dashboardRouterV2.get('/due-students', getDueStudentsV2);

// ── GET /api/v2/dashboard/expiry-forecast?days=7
// Students whose validity expires within the next N days (max 30)
dashboardRouterV2.get('/expiry-forecast', getExpiryForecastV2);

// ── GET /api/v2/dashboard/shift-occupancy
// Live occupied / vacant count per shift for the occupancy grid
dashboardRouterV2.get('/shift-occupancy', getShiftOccupancyV2);

// ── GET /api/v2/dashboard/recent-activity?limit=10
// Latest payments and newest student enrolments for the activity feed
dashboardRouterV2.get('/recent-activity', getRecentActivityV2);

// ── GET /api/v2/dashboard/student-breakdown
// Aggregated counts by gender, student-status, payment-status, and shift
dashboardRouterV2.get('/student-breakdown', getStudentBreakdownV2);

// ── GET /api/v2/dashboard/collection-summary?year=2025&month=5   (month 0-indexed)
// Full monthly breakdown: by method, by payment type, by shift, and day-by-day series
dashboardRouterV2.get('/collection-summary', getCollectionSummaryV2);

export default dashboardRouterV2;