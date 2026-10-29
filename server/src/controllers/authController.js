const authService = require("../services/authService");

const isProduction = process.env.NODE_ENV === "production";
const COOKIE_SECURE = process.env.COOKIE_SECURE === "true" || isProduction;
const COOKIE_SAME_SITE = process.env.COOKIE_SAME_SITE || (isProduction ? "none" : "lax");

function setAuthCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAME_SITE,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });
}

async function register(req, res, next) {
  try {
    const { user, token } = await authService.register(req.body);
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: "Registration successful.",
      data: {
        user,
        token,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { user, token } = await authService.login(req.body);
    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        user,
        token,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: COOKIE_SAME_SITE,
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id);
    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  logout,
  getMe,
};
