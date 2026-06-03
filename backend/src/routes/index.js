const router = require("express").Router();

router.use("/auth", require("./auth.routes"));
router.use("/driver", require("./driver.routes"));
router.use("/admin", require("./admin.routes"));
router.use("/trips", require("./trip.routes"));
router.use("/users", require("./users.routes"));
router.use("/rides", require("./rides.routes"));
router.use("/bookings", require("./bookings.routes"));
router.use("/messages", require("./messages.routes"));

module.exports = router;
