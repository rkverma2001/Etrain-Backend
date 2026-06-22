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
const auth = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", create);
router.get("/", get);
router.get("/code/:code", getByCode);
router.post("/apply", auth, apply);
router.get("/:id", getById);
router.put("/:id", update);
router.delete("/:id", remove);

module.exports = router;
