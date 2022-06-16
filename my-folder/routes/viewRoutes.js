const express = require('express');
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');
const route = express.Router();




// route.use(authController.isLoggedIn);
route.get('/',bookingController.createBookingCheckout,authController.isLoggedIn,viewController.getOverview);
route.get('/tour/:slug',authController.isLoggedIn,viewController.getTour);
route.get('/login',authController.isLoggedIn,viewController.getLoginForm);
route.get('/me',authController.protect, viewController.getAccount);
route.get('/my-bookings',authController.protect, viewController.getBookings);

module.exports = route
  