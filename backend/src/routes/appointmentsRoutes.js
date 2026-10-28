const express = require("express");
const { createAppointment } = require("../controllers/appointmentsController");
const { appointmentRateLimit } = require("../middlewares/apiRateLimit");
const validateRequestOrigin = require("../middlewares/requestOrigin");

const router = express.Router();

router.post("/", appointmentRateLimit, validateRequestOrigin, createAppointment);

module.exports = router;
