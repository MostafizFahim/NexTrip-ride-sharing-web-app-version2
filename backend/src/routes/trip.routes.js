const router = require("express").Router();
const {
  estimateTrip,
  bookTrip,
  listMyTrips,
  getTrip,
} = require("../controllers/trip.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

router.use(requireAuth);

router.post("/estimate", requireRole("PASSENGER"), estimateTrip);
router.post("/book", requireRole("PASSENGER"), bookTrip);
router.get("/my", listMyTrips);
router.get("/:id", getTrip);

module.exports = router;
