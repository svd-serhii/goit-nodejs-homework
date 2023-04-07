const express = require("express");

const ctrl = require("../../controllers/contactsControllers");

const { validateBody } = require("../../utils");

const { schemas } = require("../../models/contactModels");

const router = express.Router();

router.get("/", ctrl.listContacts);

router.get("/:id", ctrl.getContactById);

router.post("/", validateBody(schemas.addSchema), ctrl.addContact);

router.delete("/:id", ctrl.removeContact);

router.put("/:id", validateBody(schemas.addSchema), ctrl.updateContact);

router.patch("/:id/favorite", validateBody(schemas.updateFavoriteSchema), ctrl.updateFavoriteContact);

module.exports = router;
