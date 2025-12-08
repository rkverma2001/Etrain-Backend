const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const {
  create,
  get,
  update,
  remove,
} = require("../controllers/userController");

router.post("/", create);
router.get("/me", auth, get);
router.put("/me", auth, update);
router.delete("/me", auth, remove);

module.exports = router;
