const router = require("express").Router();

router.get("/", (req, res) => {
  res.status(501).json({ message: "Booking list endpoint scaffolded." });
});

router.post("/", (req, res) => {
  res.status(501).json({ message: "Booking request endpoint scaffolded." });
});

router.patch("/:id", (req, res) => {
  res.status(501).json({ message: "Booking status endpoint scaffolded." });
});

module.exports = router;
