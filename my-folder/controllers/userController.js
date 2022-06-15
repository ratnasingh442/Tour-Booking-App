const multer = require('multer');
const sharp = require('sharp');
const User = require('./../model/userModel');
const AppError = require('./../utils/appError');
const catchAsyn = require('./../utils/catchAsyn');
const factory = require('./handlerFactory');

// const multerStorage = multer.diskStorage({
//   destination: (req,file,cb) => {
//     cb(null,'public/img/users')
//   },
//   filename:(req,file,cb) => {
     
//     const ext = file.mimetype.split('/')[1];
//     cb(null,`user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });

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




exports.resizeUserPhoto = catchAsyn(async(req,res,next)=>{

  if(!req.file)return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
  .resize(500,500)
  .toFormat('jpeg')
  .jpeg({quality:90})
  .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObject = (obj, ...allowedFields) => {
  const filteredBody = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) {
      filteredBody[el] = obj[el];
    }
  });
  return filteredBody;
};
exports.uploadUserPhoto = upload.single('photo');
exports.getMe = (req,res,next) => {
  req.params.id = req.user.id;
  next();
}
exports.getAllUsers = factory.getAllModel(User);
exports.updateUser = async (req, res, next) => {
  //1)Create error if user tries to post data about password
  console.log(req.file);
  console.log(req.body);
  
  if (req.body.password || req.body.confirmPassword)
    return next(new AppError('You cannot change password from here!', 400));
  //2)Update user document
  const filteredBody = filterObject(req.body, 'name', 'email');
  if(req.file)filteredBody.photo = req.file.filename;
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
