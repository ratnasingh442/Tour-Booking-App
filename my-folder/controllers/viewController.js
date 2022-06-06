const AppError = require('../utils/appError');
const Tour = require('./../model/tourModel');
const catchAsync = require('./../utils/catchAsyn');


exports.getBase = (req,res) => {
    res.status(200).render('base',{
      tour:'The Forest Hiker',
      user:'Ratna'
    });
}

exports.getOverview = catchAsync(async(req,res,next) => {
    // 1)Get tour data from collections
    const tours = await Tour.find();
    //2)Build template
    //3)Render template using tour data from 1

    res.status(200).render('overview',{
      title:'All Tours',
      tours
    });
    next();
});

exports.getTour = catchAsync(async(req,res,next) => {

  //1)Get the data for requested tour(including the reviews and guide)
  const tour = await Tour.findOne({slug:req.params.slug}).populate({
    path:'reviews',
    fields:'reviews rating user'
  });
  console.log(tour);
  if(!tour){
    return next(new AppError('There is no tour with that name',404));
  }
  //2)Build template
  //3)Render template using the data from 1

    res.status(200).render('tour',{
      title:`${tour.name} Tour`,
      tour
    });
    next();
});

exports.getLoginForm = (req,res) => {
  res.status(200).render('login',{
    title:'Log into your account'
  });
}