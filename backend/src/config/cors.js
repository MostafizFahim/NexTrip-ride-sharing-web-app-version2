const defaultAllowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:8081",
  "http://127.0.0.1:8081",
];

function splitOrigins(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function getAllowedOrigins() {
  return Array.from(
    new Set([
      ...defaultAllowedOrigins,
      ...splitOrigins(process.env.FRONTEND_ORIGIN),
      ...splitOrigins(process.env.FRONTEND_ORIGINS),
      ...splitOrigins(process.env.MOBILE_ORIGIN),
      ...splitOrigins(process.env.MOBILE_ORIGINS),
    ])
  );
}

module.exports = { getAllowedOrigins };
