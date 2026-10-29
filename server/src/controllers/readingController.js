const readingService = require("../services/readingService");

async function createReading(req, res, next) {
  try {
    const reading = await readingService.createReading(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: "Reading created successfully.",
      data: reading,
    });
  } catch (err) {
    next(err);
  }
}

async function getReadings(req, res, next) {
  try {
    const result = await readingService.getReadings(req.user.id, req.query);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function getReadingById(req, res, next) {
  try {
    const reading = await readingService.getReadingById(req.user.id, req.params.id);
    res.status(200).json({
      success: true,
      data: reading,
    });
  } catch (err) {
    next(err);
  }
}

async function updateReading(req, res, next) {
  try {
    const reading = await readingService.updateReading(
      req.user.id,
      req.params.id,
      req.body
    );
    res.status(200).json({
      success: true,
      message: "Reading updated successfully.",
      data: reading,
    });
  } catch (err) {
    next(err);
  }
}

async function deleteReading(req, res, next) {
  try {
    const result = await readingService.deleteReading(req.user.id, req.params.id);
    res.status(200).json({
      success: true,
      message: "Reading deleted successfully.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createReading,
  getReadings,
  getReadingById,
  updateReading,
  deleteReading,
};
