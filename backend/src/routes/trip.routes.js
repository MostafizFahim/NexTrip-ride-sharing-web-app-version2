const router = require("express").Router();
const {
  estimateTrip,
  bookTrip,
  listMyTrips,
  getTrip,
  acceptTrip,
  declineTrip,
  markDriverArrived,
  startTrip,
  completeTrip,
} = require("../controllers/trip.controller");
const { requireAuth, requireRole } = require("../middleware/auth");

router.use(requireAuth);

router.post("/estimate", requireRole("PASSENGER"), estimateTrip);
router.post("/book", requireRole("PASSENGER"), bookTrip);
router.get("/my", listMyTrips);
router.post("/:id/accept", requireRole("DRIVER"), acceptTrip);
router.post("/:id/decline", requireRole("DRIVER"), declineTrip);
router.post("/:id/arrived", requireRole("DRIVER"), markDriverArrived);
router.post("/:id/start", requireRole("DRIVER"), startTrip);
router.post("/:id/complete", requireRole("DRIVER"), completeTrip);
router.get("/:id", getTrip);

module.exports = router;
