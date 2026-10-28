const { host, isProduction, port, portIsExplicit } = require("./src/config/env");
const app = require("./src/app");
const database = require("./src/config/database");

const server = app.listen(port, host);
let activePort = port;
let fallbackAttempts = 0;
const maxFallbackAttempts = 20;

server.on("listening", () => {
  const address = server.address();
  const listeningPort = typeof address === "object" && address
    ? address.port
    : activePort;
  console.log(`Site disponível em http://${host}:${listeningPort}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE" && !portIsExplicit && !isProduction &&
      fallbackAttempts < maxFallbackAttempts) {
    fallbackAttempts += 1;
    activePort += 1;
    console.warn(`A porta ${activePort - 1} está ocupada; tentando a porta ${activePort}.`);
    server.listen(activePort, host);
    return;
  }

  if (error.code === "EADDRINUSE") {
    console.error(`A porta ${activePort} já está em uso. Feche o outro servidor ou escolha outra porta em backend/.env.`);
  } else {
    console.error("Não foi possível iniciar o servidor:", error.code || error.name);
  }
  database.close();
  process.exitCode = 1;
});

function shutdown() {
  server.close(() => {
    database.close();
    process.exitCode = 0;
  });
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
