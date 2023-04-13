const express = require("express");

const ctrl = require("../../controllers/authControllers");

const { authenticate } = require("../../middlewares");

const { validateBody } = require("../../utils");

const schemas = require("../../utils/validation/userValidationSchemas");

const router = express.Router();

router.post("/register", validateBody(schemas.registerSchema), ctrl.register);

router.post("/login", validateBody(schemas.loginSchema), ctrl.login);

router.post("/logout", authenticate, ctrl.logout);

router.post("/current", authenticate, ctrl.getCurrentUser);

router.patch("/users", authenticate, validateBody(schemas.updateSubscriptionSchema), ctrl.updateSubscriptionUser);

module.exports = router;
