const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');
const Review = require('../model/reviewModel');

const router = express.Router();

router.get('/checkout-session/:tourId',authController.protect,bookingController.getCheckoutSession);

module.exports = router;