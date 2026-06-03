const router = require("express").Router();

router.get("/me", (req, res) => {
  res.status(501).json({ message: "Current user endpoint scaffolded." });
});

router.get("/:id", (req, res) => {
  res.status(501).json({ message: "User details endpoint scaffolded." });
});

router.patch("/:id", (req, res) => {
  res.status(501).json({ message: "User update endpoint scaffolded." });
});

module.exports = router;
