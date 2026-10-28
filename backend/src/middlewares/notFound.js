function notFound(_request, response) {
  response.status(404).json({ error: "Recurso não encontrado." });
}

module.exports = notFound;
