const express = require("express");
const router = express.Router();
const { create, get, getId, update, remove } = require("../controllers/categoryController");

router.post("/", create);
router.get("/", get);
router.get("/:idOrSlug", getId);
router.put("/:id", update);
router.delete("/:id", remove);

module.exports = router;
