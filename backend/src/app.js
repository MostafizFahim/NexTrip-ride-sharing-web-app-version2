require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./routes");
const { notFound, errorHandler } = require("./middleware/error");

const app = express();

app.use(
  cors({
    origin: [
      process.env.FRONTEND_ORIGIN || "http://localhost:5173",
      process.env.MOBILE_ORIGIN || "http://localhost:8081",
    ],
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
