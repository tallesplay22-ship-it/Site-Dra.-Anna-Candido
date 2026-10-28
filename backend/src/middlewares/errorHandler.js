function errorHandler(error, _request, response, _next) {
  if (error.type === "entity.parse.failed") {
    return response.status(400).json({ error: "O corpo da solicitação não contém um JSON válido." });
  }
  if (error.type === "entity.too.large") {
    return response.status(413).json({ error: "O corpo da solicitação excede o limite permitido." });
  }

  console.error("Erro interno da aplicação:", error.code || error.name || "UnknownError");
  return response.status(500).json({ error: "Ocorreu um erro. Tente novamente mais tarde." });
}

module.exports = errorHandler;
