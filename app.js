const express = require("express");
const logger = require("morgan");
const xss = require("xss");
const sanitizer = require("express-mongo-sanitize");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

// Routers
const tourRouter = require("./Routes/tourRoutes");
const userRouter = require("./Routes/userRoutes");
const { uncaughtRoutes } = require("./Controller/tourController");
const globalErrorHandler = require("./Controller/errorController");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  message:
    "You have reach the  request limit for this round. Wait for 15 minutes before making another request",
  standardHeaders: "draft-7",
  legacyHeaders: false
});
const app = express();

// middleware
app.use(helmet());
app.use("/api", limiter);
app.use(xss());
app.use(sanitizer());
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price"
    ]
  })
);

if (process.env.NODE_ENV === "developement") {
  app.use(logger("dev"));
}

app.use(express.json({ limit: "10kb" }));
app.use(express.static(`${__dirname}/public`));

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

app.all("*", uncaughtRoutes);

app.use(globalErrorHandler);

module.exports = app;
