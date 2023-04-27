const express = require("express");

const {
  register,
  login,
  logout,
  getCurrentUser,
  updateSubscriptionUser,
  updateAvatar,
} = require("../../controllers/authControllers");

const { authenticate, upload } = require("../../middlewares");

const { validateBody } = require("../../utils");

const schemas = require("../../utils/validation/userValidationSchemas");

const router = express.Router();

router.post("/register", validateBody(schemas.registerSchema), register);

router.post("/login", validateBody(schemas.loginSchema), login);

router.post("/logout", authenticate, logout);

router.post("/current", authenticate, getCurrentUser);

router.patch("/users", authenticate, validateBody(schemas.updateSubscriptionSchema), updateSubscriptionUser);

router.patch("/avatars", authenticate, upload.single("avatar"), updateAvatar);

module.exports = router;
