const express = require("express");
const reportController = require("../controllers/reportController");
const authenticate = require("../middleware/authMiddleware");
const { validateReportDate } = require("../validators/readingValidator");

const router = express.Router();

// All report endpoints require authentication
router.use(authenticate);

router.get("/daily", validateReportDate, reportController.getDailyReport);
router.get("/month-to-date", validateReportDate, reportController.getMonthToDateReport);
router.get("/monthly", validateReportDate, reportController.getMonthlyReport);

module.exports = router;
