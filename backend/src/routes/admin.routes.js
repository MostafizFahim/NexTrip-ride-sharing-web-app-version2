const router = require("express").Router();
const {
  listDrivers,
  approveDriver,
  suspendDriver,
  rejectDriver,
  liveDrivers,
} = require("../controllers/admin.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

router.use(requireAuth, requireRole("ADMIN"));

router.get("/drivers", listDrivers);
router.put("/drivers/:id/approve", approveDriver);
router.put("/drivers/:id/suspend", suspendDriver);
router.put("/drivers/:id/reject", rejectDriver);
router.get("/live-drivers", liveDrivers);

module.exports = router;
