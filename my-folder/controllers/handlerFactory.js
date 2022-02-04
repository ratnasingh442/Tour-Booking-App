const AppError = require('./../utils/appError');
const catchAsyn = require('./../utils/catchAsyn');
const APIFeatures = require('./../utils/apiFeatures');
exports.deleteOne = Model => catchAsyn(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      next(new AppError('No document with given ID exists', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null
    });
  });

exports.updateOne = Model => catchAsyn(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

  exports.createOne = Model => catchAsyn(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

  exports.getOne = (Model,popOptions) => catchAsyn(async (req, res, next) => {
    console.log(req.requestTime);

    let query = Model.findById(req.params.id);
    if(popOptions)query = query.populate(popOptions);
    const doc = await query;
    //Tour.findOne({_id:req.params.id});
  
    if (!doc) {
      return next(new AppError('No document with given ID exists', 404));
    }
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: doc.length,
      data: {
        doc
      }
    });
  });

  exports.getAllModel  = Model =>  catchAsyn(async (req, res, next) => {
    console.log(req.requestTime);
    let filter = {}
  if(req.params.tourId)filter = {tour:req.params.tourId};
    //BUILD QUERY
    // const queryObj = { ...req.query };
    // const excludeField = ['sort', 'limit', 'page', 'fields'];
    // excludeField.forEach(el => {
    //   delete queryObj[el];
    // });
    // console.log(req.query);
  
    //ADVANCE FILTERING
    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    // console.log(JSON.parse(queryStr));
    // let query = Tour.find(JSON.parse(queryStr));
  
    //SORTING
  
    // if (req.query.sort) {
    //   const sortBy = req.query.sort.split(',').join(' ');
    //   query = query.sort(sortBy);
    //   //query.sort('price ratingAverage');
    // } else {
    //   query.sort('-ratingsAverage');
    // }
  
    //Field Limiting
  
    // if (req.query.fields) {
    //   const fields = req.query.fields.split(',').join(' ');
    //   query = query.select(fields);
    //   //select('name ratingAverage');
    // } else {
    //   query = query.select('-__v');
    // }
  
    //PAGINATION
  
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit;
    // console.log(skip);
    // console.log(limit);
    // query = query.skip(skip).limit(limit);
  
    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('This page does not exits');
    // }
  
    //EXECUTE QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();
    const doc = await features.query;
  
    // const tours = await Tour.find({
    //   duration: 5,
    //   difficulty: 'easy'
    // });
    // duration: { $lte: 5}
  
    // const tours = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');
  
    //if (!tours) return next(new AppError('No tour exist', 404));
  
    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: doc.length,
      data: {
        data:doc
      }
    });
  });
  