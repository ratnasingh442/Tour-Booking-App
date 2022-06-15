const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('./../model/userModel');
const catchAsyn = require('./../utils/catchAsyn');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};
const cookieOptions = {
  expires: new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  ),
  httpOnly: true
};
if ((process.env.NODE_ENV || '').trim() === 'production') {
  cookieOptions.secure = true;
}
exports.signup = catchAsyn(async (req, res, next) => {
  const newUser = await User.create(req.body);

  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url);
  await new Email(newUser, url).sendWelcome();
  newUser.password = undefined;
  const token = signToken(newUser._id);
  res.cookie('jwt', token, cookieOptions);
  res.status(201).json({
    status: 'success',
    token,
    data: {
      newUser
    }
  });
});

exports.login = catchAsyn(async (req, res, next) => {
  const { email, password } = req.body;

  //1)Check if email and password user has input
  if (!email || !password)
    return next(new AppError('Please enter email and password', 400));
  //2)Check if user exist and password is correct

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Invalid email or password', 401));
  }
  //3)If everything is ok, send the token to the client
  const token = signToken(user._id);
  res.cookie('jwt', token, cookieOptions);
  res.status(200).json({
    status: 'success',
    token
  });
});


exports.logout = (req , res ) => {
  res.cookie('jwt','loggedout',{
       expires: new Date(Date.now()+10*1000),
       httpOnly:true
  });
  res.status(200).json({
    status: 'success'
  });
}
exports.protect = catchAsyn(async (req, res, next) => {
  console.log("Inside protect");
  //1)Get token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    console.log(token);
  }
  else if(req.cookies.jwt && req.cookies.jwt !== 'loggedout'){
    token = req.cookies.jwt;

  }
  if (!token)
    return next(
      new AppError('You are not logged in.Please log in to get access!', 401)
    );
  //2)Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  //3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

//Only for rendered pages and no error
exports.isLoggedIn = async (req, res, next) => {
  //1)Get token and check if it exists
  let token;
 if(req.cookies.jwt){
   try{
    token = req.cookies.jwt;

  //2)Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  //3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next();
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next();
  }
  // // THERE IS A LOGGED IN USER
  res.locals.user = currentUser;
  return next();
}
catch(err) {return next();}
}
next();
}
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError('You donot have permissions to perform this action', 403)
      );
    next();
  };
};

exports.forgotPassword = catchAsyn(async (req, res, next) => {
  //Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('This user does not exists', 404));

  //Generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //Send it back as email
  const resetURL = `${req.protocol}://${req.get('host')}/app/v1/users/resetPassword/${resetToken}`;
  console.log(resetURL);
  const message = `Forgot your password?Click on this url ${resetURL} and create a new password.\n If you have not created this request then ignore this message!`;
  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your password reset token.(Valid for 10 min)',
    //   message
    // });

    await new Email(user, resetURL).sendResetPassword();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Email could not be send', 500));
  }
});
exports.resetPassword = catchAsyn(async (req, res, next) => {
  // 1)Get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gt: Date.now() }
  });
  //2)If token has not expired and there is a user set the new password
  if (!user) return next(new AppError('Token is invalid or expired', 400));
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  await user.save();
  // 3)Update changedPasswordAt property for the user
  // 4)Log the user in, send JWT
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token
  });
});

exports.updatePassword = catchAsyn(async (req, res, next) => {
  // 1)Get user from collection
  const user = await User.findOne(req.user).select('+password');
  console.log(user, req.user);
  if (!user || !(await user.correctPassword(req.body.password, user.password)))
    return next(new AppError('You entered a wrong password', 401));
  // 2)Check if posted current password is correct
  //3)If so, update password
  user.password = req.body.newPassword;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();
  //4)Log user in,send JWT
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token
  });
});
