const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const cookieParser = require('cookie-parser');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}




//Security middleware
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'data:', 'blob:'],
 
      baseUri: ["'self'"],
 
      fontSrc: ["'self'", 'https:', 'data:'],
 
      scriptSrc: ["'self'", 'https://*.cloudflare.com'],
 
      scriptSrc: ["'self'", 'https://*.stripe.com'],
 
      scriptSrc: ["'self'", 'http:', 'https://*.mapbox.com', 'data:'],
 
      frameSrc: ["'self'", 'https://*.stripe.com'],
 
      objectSrc: ["'none'"],
 
      styleSrc: ["'self'", 'https:', 'unsafe-inline'],
 
      workerSrc: ["'self'", 'data:', 'blob:'],
 
      childSrc: ["'self'", 'blob:'],
 
      imgSrc: ["'self'", 'data:', 'blob:'],
 
      connectSrc: ["'self'", 'blob:', 'https://*.mapbox.com'],
 
      upgradeInsecureRequests: [],
    },
  })
); //set security http header
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  next();
});

//Serving static files
app.use(express.static(path.join(__dirname,'public')));

// 3) ROUTES
app.use('/',viewRouter);
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
