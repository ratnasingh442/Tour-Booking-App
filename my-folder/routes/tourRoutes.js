const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');
const reviewRouter = require('./../routes/reviewRoutes');


const router = express.Router();

//router.param('id', tourController.checkID);


router.use('/:tourId/reviews',reviewRouter);

router
  .route('/')
  .get(tourController.getAllTours)
  //.get(tourController.getAllTours)
  .post(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.createTour);


router
  .route('/top-5-cheap')
  .get(tourController.alias, tourController.getAllTours);

router.route('/monthly-plan/:year').get( authController.protect,
  authController.restrictTo('admin', 'lead-guide','guide'),tourController.getMonthlyPlans);

router.route('/tour-stats')
.get(tourController.getTourStats);
router.route('/tours-within/:distance/center/:latlng/unit/:unit')
.get(tourController.getTourWithin);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch( authController.protect,
    authController.restrictTo('admin', 'lead-guide'),tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

//router.route('/:tourId/reviews').post(authController.protect,authController.restrictTo('user'),reviewController.createReview);

module.exports = router;
