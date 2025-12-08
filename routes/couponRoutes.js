const express = require("express");
const {
  create,
  get,
  getById,
  getByCode,
  update,
  remove,
  apply,
} = require("../controllers/couponController");
const router = express.Router();

router.post("/", create);
router.get("/", get);
router.get("/:id", getById);
router.get("/code/:code", getByCode);
router.put("/:id", update);
router.delete("/:id", remove);
router.post("/apply", apply);

module.exports = router;
