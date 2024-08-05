const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Tours = require("../../Model/tourModel");

dotenv.config({ path: "../../config.env" });

const DB = process.env.DATABASE_CLOUD.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useFindAndModify: false,
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(con => console.log(con.connection))
  .catch(err => console.log(err));

//   Import the dara from local storage file
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, "utf-8")
);

// Reading the file from the database
const importData = async () => {
  try {
    await Tours.create(tours);
    console.log("Data Successfully loaded");
  } catch (error) {
    console.log(error.message);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log("Data Successfully deleted");
  } catch (error) {
    console.log(error.message);
  }
  process.exit();
};

importData();
