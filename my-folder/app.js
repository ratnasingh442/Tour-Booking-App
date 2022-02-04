const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}




//Security middleware
app.use(helmet()); //set security http header
app.use(express.json());

app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//Serving static files
app.use(express.static(path.join(__dirname,'public')));

// 3) ROUTES
app.get('/',(req,res) => {
  res.status(200).render('base')
});
app.use('/app/v1/tours', tourRouter);
app.use('/app/v1/users', userRouter);
app.use('/app/v1/review', reviewRouter);

app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;
  next(new AppError(`Can't find ${req.originalUrl} on this server`));
});
app.use(globalErrorHandler);
module.exports = app;
