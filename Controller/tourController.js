/////////////////////////////////////////////////////////////
//      USING MONGODB AS OUR DATABASE
/////////////////////////////////////////////////////////////
// const APIFeatures = require("../Utils/apiFeatures");
const Tours = require("../Model/tourModel");
const catchAsync = require("../Utils/catchAsync");
const { AppError } = require("../Utils/appErrors");
const factory = require("./handlerFactory");

exports.aliasTopTours = (req, res, next) => {
  req.query.fields = "name,price,summary,ratingsAverage,difficulty";
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage,price";
  next();
};

exports.getAllTours = factory.getAll(Tours);
exports.getTour = factory.getOne(Tours, { path: "reviews" });
exports.addTour = factory.createOne(Tours);
exports.updateTour = factory.updateOne(Tours);
exports.deleteTour = factory.deleteOne(Tours);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tours.aggregate([
    { $match: { ratingAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: `$difficulty` },
        numTours: { $sum: 1 },
        numRatings: { $avg: `$ratingQuantity` },
        avgRatings: { $avg: `$ratingAverage` },
        avgPrice: { $avg: `$price` },
        maxPrice: { $max: `$price` },
        minPrice: { $min: `$price` }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
    // {
    //   $match: { _id: { $ne: 'EASY' } }
    // }
  ]);

  res.status(200).json({
    status: "success",
    body: { stats }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // 2021

  const plan = await Tours.aggregate([
    {
      $unwind: "$startDates"
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" }
      }
    },
    {
      $addFields: { month: "$_id" }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { month: -1 }
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    status: "success",
    data: {
      plan
    }
  });
});

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/34.111745,-118.113491/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        "Please provide latitutr and longitude in the format lat,lng.",
        400
      )
    );
  }

  const tours = await Tours.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      data: tours
    }
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  const multiplier = unit === "mi" ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        "Please provide latitutr and longitude in the format lat,lng.",
        400
      )
    );
  }

  const distances = await Tours.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: "distance",
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: "success",
    data: {
      data: distances
    }
  });
});

exports.uncaughtRoutes = (req, res, next) => {
  next(new AppError(`Can't find the ${req.originalUrl} in the server`, 404));
};

//////////////////
//  Before Refactoring
////////////////////////
// exports.getAllTours = catchAsync(async (req, res, next) => {
//   const features = new APIFeatures(Tours.find(), req.query)
//     .filter()
//     .sort()
//     .limit()
//     .paginate();
//   const tours = await features.query;

//   res.status(200).json({
//     status: "success",
//     result: tours.length,
//     data: { tours }
//   });
// });

// exports.getTour = catchAsync(async (req, res, next) => {
//   const tour = await Tours.findById(req.params.id);

//   if (!tour) {
//     return next(new AppError("Can't find any tour with that ID", 404));
//   }

//   res.status(200).json({
//     status: "success",
//     data: { tour }
//   });
// });

// exports.addTour = catchAsync(async (req, res, next) => {
//   // NEW WAY OF CREATING DOCUMENT
//   const newTour = await Tours.create(req.body);

//   res.status(201).json({
//     status: "success",
//     data: { tour: newTour }
//   });

//   // OLD WAY OF CREATING A DOCUMENT
//   // const testTour = new Tours({ name: "First", price: 453, rating: 4.7 });
//   // testTour
//   //   .save()
//   //   .then(doc => {
//   //     console.log(doc);
//   //   })
//   //   .catch(err => console.log(err));
// });

// exports.updateTour = catchAsync(async (req, res, next) => {
//   const UpdatedTour = await Tours.findByIdAndUpdate(req.params.id, {
//     new: true,
//     runValidators: true
//   });

//   if (!UpdatedTour) {
//     return next(new AppError("Can't find any tour with that ID", 404));
//   }

//   res.status(200).json({
//     status: "success",
//     body: { UpdatedTour }
//   });
// });

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tours.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError("Can't find any tour with that ID", 404));
//   }

//   res.status(204).json({
//     status: "success",
//     data: null
//   });
// });

/////////////////////////////////////////////////////////////
// USING OUR OWN DATABASE(data.json)
/////////////////////////////////////////////////////////////
// const fs = require("fs");

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.checkID = (req, res, next, val) => {
//   const id = +req.params.id;
//   const tour = tours.find(el => el.id === id);

//   if (!tour) {
//     return res.status(404).json({
//       status: "fail",
//       message: "Invalid ID"
//     });
//   }
//   next();
// };

// exports.checkTour = (req, res, next) => {
//   const { body } = req;
//   if (!body.name || !body.price) {
//     return res.status(400).json({
//       status: "bad request",
//       message: "Data does not contain a name and price property"
//     });
//   }
//   next();
// };

// exports.getAllTours = (req, res) => {
//   res.status(200).json({
//     status: "success",
//     requestedAt: req.requestTime,
//     results: tours.length,
//     data: { tours }
//   });
// };

// exports.getTour = (req, res) => {
//   const id = +req.params.id;
//   const tour = tours.find(el => el.id === id);

//   res.status(200).json({
//     status: "success",
//     data: { tour }
//   });
// };

// exports.updateTour = (req, res) => {
//   const id = +req.params.id;
//   const tour = tours.find(el => el.id === id);

//   // the code to update the tour...

//   res.status(200).json({
//     status: "success",
//     data: { tour }
//   });
// };

// exports.deleteTour = (req, res) => {
//   const id = +req.params.id;
//   const tour = tours.find(el => el.id === id);

//   // the code to delete the tour...

//   res.status(204).json({
//     status: "success",
//     message: `You have successfully deleted ${tour.name} tour`,
//     data: null
//   });
// };

// exports.addTour = (req, res) => {
//   const newTourId = tours.length;
//   const newTour = Object.assign({ id: newTourId }, req.body);
//   tours.push(newTour);
//   fs.writeFile(
//     `${__dirname}/dev-data/tours-simple.json`,
//     JSON.stringify(tours),
//     err => {
//       res.status(201).json({
//         status: "success",
//         data: {
//           tours: newTour
//         }
//       });
//     }
//   );
// };
