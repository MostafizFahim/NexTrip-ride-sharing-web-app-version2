const router = require("express").Router();

router.get("/", (req, res) => {
  res.status(501).json({ message: "Ride listing endpoint scaffolded." });
});

router.post("/", (req, res) => {
  res.status(501).json({ message: "Publish ride endpoint scaffolded." });
});

router.patch("/:id", (req, res) => {
  res.status(501).json({ message: "Ride update endpoint scaffolded." });
});

module.exports = router;
