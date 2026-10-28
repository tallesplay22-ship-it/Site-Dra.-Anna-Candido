const express = require("express");
const appointmentsRoutes = require("./appointmentsRoutes");

const router = express.Router();

router.get("/health", (_request, response) => {
  response.set("Cache-Control", "no-store");
  response.json({ status: "ok" });
});
router.use("/appointments", appointmentsRoutes);

module.exports = router;
