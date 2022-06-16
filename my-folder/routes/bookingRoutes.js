const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');
const Review = require('../model/reviewModel');

const router = express.Router();

router.use(authController.protect);

router.get('/checkout-session/:tourId',bookingController.getCheckoutSession);

router.use(authController.restrictTo('admin','lead-guide'));

router.route('/').get(bookingController.getAllBooking)
.post(bookingController.createOneBooking)

router.route('/:id')
.get(bookingController.getOneBooking)
.patch(bookingController.updateOneBooking)
.delete(bookingController.deleteOneBooking);

module.exports = router;