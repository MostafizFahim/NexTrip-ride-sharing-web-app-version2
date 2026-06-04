const router = require("express").Router();
const { getMe, updateMe, getUserById } = require("../controllers/user.controller");
const { requireAuth } = require("../middleware/auth");

router.use(requireAuth);

router.get("/me", getMe);
router.patch("/me", updateMe);
router.get("/:id", getUserById);

module.exports = router;
