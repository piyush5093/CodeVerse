const express = require("express");
const router = express.Router();   // ✅ THIS LINE WAS MISSING

const { courseDoubtSolver } = require("../controllers/aiController");

// Test route
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "AI route working",
  });
});

// Doubt solver route
router.post("/doubt-solver", courseDoubtSolver);

module.exports = router;
