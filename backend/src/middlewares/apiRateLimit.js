const rateLimit = require("express-rate-limit");

const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Muitas solicitações. Aguarde alguns minutos e tente novamente." }
});

const appointmentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Muitas tentativas de agendamento. Aguarde alguns minutos e tente novamente." }
});

module.exports = { apiRateLimit, appointmentRateLimit };
