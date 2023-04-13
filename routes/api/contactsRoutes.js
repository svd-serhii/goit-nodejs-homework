const express = require("express");

const ctrl = require("../../controllers/contactsControllers");

const { validateBody } = require("../../utils");

const { isValidId, authenticate } = require("../../middlewares");

const schemas = require("../../utils/validation/contactValidationSchemas");

const router = express.Router();

router.get("/", authenticate, ctrl.getContacts);

router.get("/:id", authenticate, isValidId, ctrl.getContactById);

router.post("/", authenticate, validateBody(schemas.addSchema), ctrl.addContact);

router.delete("/:id", authenticate, isValidId, ctrl.removeContact);

router.put("/:id", authenticate, isValidId, validateBody(schemas.updateSchema), ctrl.updateContact);

router.patch(
  "/:id/favorite",
  authenticate,
  isValidId,
  validateBody(schemas.updateStatusSchema),
  ctrl.updateFavoriteContact
);

module.exports = router;
