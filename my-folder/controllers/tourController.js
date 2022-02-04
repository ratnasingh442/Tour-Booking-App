const fs = require('fs');
const Tour = require('./../model/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('./../utils/appError');
const catchAsyn = require('./../utils/catchAsyn');
const factory = require('./handlerFactory');

// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);

//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID'
//     });
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price'
//     });
//   }
//   next();
// };

exports.alias = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  next();
};
exports.getAllTours = factory.getAllModel(Tour);

exports.getTourStats = catchAsyn(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        minRating: { $min: '$ratingsAverage' },
        maxRating: { $max: '$ratingsAverage' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' }
      }
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getTour = factory.getOne(Tour,{path:'reviews'});

exports.createTour = factory.createOne(Tour);
//);
//};

exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsyn(async (req, res, next) => {
//   const newTour = await Tour.findByIdAndDelete(req.params.id);
//   if (!newTour) {
//     next(new AppError('No tour with given ID exists', 404));
//   }
//   res.status(204).json({
//     status: 'success',
//     data: null
//   });
// });

exports.getMonthlyPlans = catchAsyn(async (req, res) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
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
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tour: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: {
        month: 1
      }
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});

exports.getTourWithin = catchAsyn(async (req,res,next) => {
  const {distance, latlng, unit} = req.params
  const [lat,lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance/3963.2 : distance/6378.1;
  if(!lat || !lng)
  {
    next(new AppError('Please provide latitude and longitude details',400));
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere:[[lng,lat],radius]}}
  });
  res.status(200).json({
    status:"Success",
    results : tours.length,
    data:{
      data: tours
    }
  });
});
