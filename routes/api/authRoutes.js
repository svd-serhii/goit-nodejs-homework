const express = require("express");

const ctrl = require("../../controllers/authControllers");

const { validateBody } = require("../../utils");

const schemas = require("../../utils/validation/userValidationSchemas");

const router = express.Router();

router.post("/register", validateBody(schemas.registerSchema), ctrl.register);

router.post("/login", validateBody(schemas.loginSchema), ctrl.login);

module.exports = router;
