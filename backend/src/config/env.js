const path = require("node:path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });

const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT precisa ser um número entre 1 e 65535.");
}

let appOrigin = process.env.APP_ORIGIN || "";
if (appOrigin) {
  let parsedOrigin;
  try {
    parsedOrigin = new URL(appOrigin);
  } catch {
    throw new Error("APP_ORIGIN precisa ser uma origem HTTP ou HTTPS válida.");
  }
  if (!["http:", "https:"].includes(parsedOrigin.protocol) ||
      parsedOrigin.origin !== appOrigin.replace(/\/$/, "")) {
    throw new Error("APP_ORIGIN deve conter apenas protocolo, domínio e porta.");
  }
  if (process.env.NODE_ENV === "production" && parsedOrigin.protocol !== "https:") {
    throw new Error("APP_ORIGIN deve usar HTTPS em produção.");
  }
  appOrigin = parsedOrigin.origin;
}

if (process.env.NODE_ENV === "production" && !appOrigin) {
  throw new Error("Configure APP_ORIGIN com a URL HTTPS pública antes de iniciar em produção.");
}

const trustProxyValue = process.env.TRUST_PROXY;
let trustProxy = false;
if (trustProxyValue) {
  if (["true", "yes", "*"].includes(trustProxyValue.toLowerCase())) {
    throw new Error("TRUST_PROXY não pode confiar em todos os proxies. Informe saltos ou IPs confiáveis.");
  }
  trustProxy = /^\d+$/.test(trustProxyValue)
    ? Number(trustProxyValue)
    : trustProxyValue.split(",").map((address) => address.trim());
  if (Array.isArray(trustProxy) &&
      trustProxy.some((address) => !address || ["*", "0.0.0.0/0", "::/0"].includes(address))) {
    throw new Error("TRUST_PROXY contém um endereço vazio ou amplo demais.");
  }
}

module.exports = {
  appOrigin,
  host: process.env.HOST || "127.0.0.1",
  isProduction: process.env.NODE_ENV === "production",
  port,
  trustProxy
};
