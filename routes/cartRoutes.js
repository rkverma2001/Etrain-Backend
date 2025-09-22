const express = require("express");
const { get, add, remove, clear, merge} = require("../controllers/cartController");
const auth = require("../middlewares/authMiddleware"); // assuming you have auth


const router = express.Router();

router.get("/", auth, get);
router.post("/add", auth, add);
router.post("/remove", auth, remove);
router.delete("/clear", auth, clear);
router.post("/merge", auth, merge);

module.exports = router;
