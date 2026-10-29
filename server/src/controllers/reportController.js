const reportService = require("../services/reportService");

async function getDailyReport(req, res, next) {
  try {
    const { date } = req.query;
    const report = await reportService.getDailyReport(req.user.id, date);
    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (err) {
    next(err);
  }
}

async function getMonthToDateReport(req, res, next) {
  try {
    const { date } = req.query;
    const report = await reportService.getMonthToDateReport(req.user.id, date);
    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (err) {
    next(err);
  }
}

async function getMonthlyReport(req, res, next) {
  try {
    const { date } = req.query;
    const report = await reportService.getMonthlyReport(req.user.id, date);
    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDailyReport,
  getMonthToDateReport,
  getMonthlyReport,
};
