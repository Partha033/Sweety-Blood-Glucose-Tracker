const express = require("express");
const readingController = require("../controllers/readingController");
const authenticate = require("../middleware/authMiddleware");
const { validateGlucoseReading } = require("../validators/readingValidator");

const router = express.Router();

// All reading endpoints require authentication
router.use(authenticate);

router.post("/", validateGlucoseReading, readingController.createReading);
router.get("/", readingController.getReadings);
router.get("/:id", readingController.getReadingById);
router.put("/:id", validateGlucoseReading, readingController.updateReading);
router.delete("/:id", readingController.deleteReading);

module.exports = router;
