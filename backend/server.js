const { host, port } = require("./src/config/env");
const app = require("./src/app");
const database = require("./src/config/database");

const server = app.listen(port, host, () => {
  console.log(`Site disponível em http://${host}:${port}`);
});

server.on("error", (error) => {
  console.error("Não foi possível iniciar o servidor:", error.code || error.name);
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
