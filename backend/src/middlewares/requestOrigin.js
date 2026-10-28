const { appOrigin, isProduction } = require("../config/env");

function validateRequestOrigin(request, response, next) {
  const fetchSite = request.get("sec-fetch-site");
  if (fetchSite === "cross-site") {
    return response.status(403).json({ error: "Origem da solicitação não permitida." });
  }

  const requestOrigin = request.get("origin");
  if (requestOrigin) {
    let parsedOrigin;
    try {
      parsedOrigin = new URL(requestOrigin).origin;
    } catch {
      return response.status(403).json({ error: "Origem da solicitação não permitida." });
    }

    const expectedOrigin = isProduction
      ? appOrigin
      : `${request.protocol}://${request.get("host")}`;
    if (parsedOrigin !== expectedOrigin) {
      return response.status(403).json({ error: "Origem da solicitação não permitida." });
    }
  }

  return next();
}

module.exports = validateRequestOrigin;
