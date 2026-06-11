require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./routes");
const { getAllowedOrigins } = require("./config/cors");
const { notFound, errorHandler } = require("./middleware/error");

const app = express();

app.use(
  cors({
    origin: getAllowedOrigins(),
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ ok: true, service: "nextrip-api" });
});

app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
