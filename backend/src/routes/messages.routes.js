const router = require("express").Router();

router.get("/conversations/:userId", (req, res) => {
  res.status(501).json({ message: "Conversation list endpoint scaffolded." });
});

router.get("/:conversationId", (req, res) => {
  res.status(501).json({ message: "Message list endpoint scaffolded." });
});

router.post("/", (req, res) => {
  res.status(501).json({ message: "Create message endpoint scaffolded." });
});

module.exports = router;
