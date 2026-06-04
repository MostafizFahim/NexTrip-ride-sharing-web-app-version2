const router = require("express").Router();
const {
  dashboard,
  listDrivers,
  listPassengers,
  listTrips,
  approveDriver,
  suspendDriver,
  rejectDriver,
  liveDrivers,
} = require("../controllers/admin.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

router.use(requireAuth, requireRole("ADMIN"));

router.get("/dashboard", dashboard);
router.get("/drivers", listDrivers);
router.get("/passengers", listPassengers);
router.get("/trips", listTrips);
router.put("/drivers/:id/approve", approveDriver);
router.put("/drivers/:id/suspend", suspendDriver);
router.put("/drivers/:id/reject", rejectDriver);
router.get("/live-drivers", liveDrivers);

module.exports = router;
