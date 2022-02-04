const User = require('./../model/userModel');
const AppError = require('./../utils/appError');
const catchAsyn = require('./../utils/catchAsyn');
const factory = require('./handlerFactory');

const filterObject = (obj, ...allowedFields) => {
  const filteredBody = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) {
      filteredBody[el] = obj[el];
    }
  });
  return filteredBody;
};
exports.getMe = (req,res,next) => {
  req.params.id = req.user.id;
  next();
}
exports.getAllUsers = factory.getAllModel(User);
exports.updateUser = async (req, res, next) => {
  //1)Create error if user tries to post data about password
  if (req.body.password || req.body.confirmPassword)
    return next(new AppError('You cannot change password from here!', 400));
  //2)Update user document
  const filteredBody = filterObject(req.body, 'name', 'email');
  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser
    }
  });
};
exports.deleteMe = catchAsyn(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null
  });
});
exports.deleteUser = factory.deleteOne(User);
exports.getUser = factory.getOne(User);
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!Please use signup'
  });
};
