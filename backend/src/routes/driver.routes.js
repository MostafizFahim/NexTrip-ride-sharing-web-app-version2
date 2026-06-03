const router = require("express").Router();
const {
  setupDriver,
  getDriverProfile,
  toggleOnline,
  getEarnings,
} = require("../controllers/driver.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

router.use(requireAuth, requireRole("DRIVER"));

router.post("/setup", setupDriver);
router.get("/profile", getDriverProfile);
router.post("/toggle-online", toggleOnline);
router.get("/earnings", getEarnings);

module.exports = router;
