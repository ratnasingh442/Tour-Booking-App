const multer = require('multer');
const sharp = require('sharp');
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


const multerStorage = multer.memoryStorage(); //stores image in buffer

const multerFilter = (req,file,cb)=>{
  if(file.mimetype.startsWith('image')){
    cb(null,true);
  }
  else
  {
    cb(new AppError('Only upload image!',404),false);
  }
}


const upload = multer({
  storage:multerStorage,
  fileFilter:multerFilter
});



exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount:1},
  { name: 'images', maxCount:3}
]);

// upload.array('image',5)


exports.resizeTourImages = catchAsyn(async(req,res,next)=>{

  if(!req.files.imageCover || !req.files.images)return next();

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
  .resize(2000,1333)
  .toFormat('jpeg')
  .jpeg({quality:90})
  .toFile(`public/img/tours/${req.body.imageCover}`);

   req.body.images = [];
   await Promise.all(req.files.images.map(async(file, i)=>{
  const filename = `tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`;
  await sharp(file.buffer)
  .resize(2000,1333)
  .toFormat('jpeg')
  .jpeg({quality:90})
  .toFile(`public/img/tours/${filename}`);
  
  req.body.images.push(filename);

   }))

  next();
});

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
