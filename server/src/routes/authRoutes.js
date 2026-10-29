const express = require("express");
const authController = require("../controllers/authController");
const authenticate = require("../middleware/authMiddleware");
const { validateRegistration, validateLogin } = require("../validators/authValidator");
const { authLimiter } = require("../middleware/rateLimitMiddleware");

const router = express.Router();

router.post("/register", authLimiter, validateRegistration, authController.register);
router.post("/login", authLimiter, validateLogin, authController.login);
router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.getMe);

module.exports = router;
