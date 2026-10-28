const { appOrigin } = require("../config/env");

function validateRequestOrigin(request, response, next) {
  const fetchSite = request.get("sec-fetch-site");
  if (fetchSite === "cross-site") {
    return response.status(403).json({ error: "Origem da solicitação não permitida." });
  }

  const requestOrigin = request.get("origin");
  if (requestOrigin && appOrigin) {
    let parsedOrigin;
    try {
      parsedOrigin = new URL(requestOrigin).origin;
    } catch {
      return response.status(403).json({ error: "Origem da solicitação não permitida." });
    }

    if (parsedOrigin !== appOrigin) {
      return response.status(403).json({ error: "Origem da solicitação não permitida." });
    }
  }

  return next();
}

module.exports = validateRequestOrigin;
