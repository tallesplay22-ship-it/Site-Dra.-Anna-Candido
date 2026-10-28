const express = require("express");
const helmet = require("helmet");
const path = require("node:path");
const securityOptions = require("./config/security");
const apiRoutes = require("./routes/apiRoutes");
const errorHandler = require("./middlewares/errorHandler");
const notFound = require("./middlewares/notFound");
const { apiRateLimit } = require("./middlewares/apiRateLimit");
const { trustProxy } = require("./config/env");

const app = express();
const frontendDirectory = path.resolve(__dirname, "..", "..", "frontend");

app.disable("x-powered-by");
app.set("trust proxy", trustProxy);
app.use(helmet(securityOptions));
app.use(express.json({ limit: "10kb", strict: true }));

app.use("/api", (_request, response, next) => {
  response.set("Cache-Control", "no-store");
  next();
}, apiRateLimit, apiRoutes);
app.use(express.static(frontendDirectory, {
  dotfiles: "deny",
  index: "index.html",
  maxAge: process.env.NODE_ENV === "production" ? "1h" : 0,
  fallthrough: true
}));
app.use(notFound);
app.use(errorHandler);

module.exports = app;
