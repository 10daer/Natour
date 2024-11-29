const mongoose = require("mongoose");

const dotenv = require("dotenv");

process.on("uncaughtException", err => {
  console.log(err.name, err.message, err);
  console.log("UNCAUGHT EXCEPTION! Shutting down...");

  process.exit(1);
});

dotenv.config({ path: "./config.env" });

const app = require("./app");

// For the online mongoDB Atlas
const DB = process.env.DATABASE_CLOUD.replace(
  "<db_password>",
  process.env.DATABASE_PASSWORD
);

// For the Local MongoDB STorage
// const DB = process.env.DATABASE_LOCAL;

mongoose
  .connect(DB, {
    useFindAndModify: false,
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("DB Connection Successful"))
  .catch(err => console.log(`${err.name} connecting to DB: ${err.message}`));

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App is running on port ${port}...`);
});

process.on("unhandledRejection", err => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTIONS! Shutting down...");

  server.close(() => process.exit(1));
});

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED: Shutting down gracefully");
  server.close(() => console.log("🔥 Process Terminated..."));
});
