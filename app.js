const path = require("path");
const express = require("express");
const logger = require("morgan");
const sanitizer = require("express-mongo-sanitize");
const { xss } = require("express-xss-sanitizer");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const compression = require("compression");

// Routers
const tourRouter = require("./Routes/tourRoutes");
const userRouter = require("./Routes/userRoutes");
const reviewRouter = require("./Routes/reviewRoutes");
const viewRouter = require("./Routes/viewRoutes");
const bookingRouter = require("./Routes/bookingRoutes");
const bookingController = require("./Controller/bookingController");
const { uncaughtRoutes } = require("./Controller/tourController");
const globalErrorHandler = require("./Controller/errorController");

const app = express();

if (process.env.NODE_ENV === "production") app.enable("trust proxy");

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "Views"));

// 1) GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors());

// // Use CORS middleware for specific origin
// app.use(
//   cors({
//     origin: "http://localhost:8001",
//     credentials: true
//   })
// );

// Handle preflight requests for all routes
app.options("*", cors());

// Serving static files
app.use(express.static(path.join(__dirname, "public")));

// Set security HTTP headers
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://unpkg.com", "https://js.stripe.com/v3/"],
      imgSrc: [
        "'self'",
        "data:",
        "https://tile.openstreetmap.fr",
        "https://unpkg.com",
        "https://*.tile.openstreetmap.org",
        "https://*.openstreetmap.fr",
        "https://*.openstreetmap.org"
      ],
      styleSrc: ["'self'", "https://unpkg.com", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", process.env.API_URL],
      frameSrc: ["'self'", "https://js.stripe.com/"]
    }
  })
);

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(logger("dev"));
}

// Limit requests from same API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  message:
    "You have reach the  request limit for this round. Wait for 15 minutes before making another request",
  standardHeaders: "draft-7",
  legacyHeaders: false
});
app.use("/api", limiter);

// Stripe webhook, BEFORE body-parser, because stripe needs the body as stream
app.post(
  "/webhook-checkout",
  express.raw({ type: "application/json" }),
  bookingController.webhookCheckout
);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(sanitizer());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
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

app.use(compression());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// 3) ROUTES
app.use("/", viewRouter);
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRouter);

app.all("*", uncaughtRoutes);

app.use(globalErrorHandler);

module.exports = app;
