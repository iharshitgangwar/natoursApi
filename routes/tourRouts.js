const express = require('express');

const tourController = require(`${__dirname}/../controllers/tourController`);
const authController = require(`${__dirname}/../controllers/authController`);
const reviewRoutes = require('../routes/reviewRouts');
const router = express.Router(); //we created new router and saved in a variable

// this middle ware will return id only for tour
// router.param('id', tourController.Checkid);

//for this route because this belong to review routes so we are using  mergeparams technique
// router.route('/:tourId/createreview')
// .post(authController.protect,authController.restrictTo('user'),reviewController.createReview);

// here when it will found this url then it will use tour route
router.use('/:tourId/reviews', reviewRoutes);

// create a checkBody middleware that
// check if body contains the name and price property
// if not, send back 400() back request
// Add it to the post handler stack    //tourController.checkBody this is it

// all tours conntrolers moved frok here to controller file

// here this rout will show top 5 tours and we are applying
router
     .route('/tour-within/:distance/center/:latlng/unit/:unit')
     .get(tourController.getToursWithIn);
router
     .route('/distances/:latlng/unit/:unit')
     .get(tourController.getToursDistances);
router.route('/tour-stats').get(tourController.getToursStats);
router
     .route('/monthly-Plan/:year')
     .get(
          authController.protect,
          authController.restrictTo('admin', 'lead-guide', 'guide'),
          tourController.monthlyPlan,
     );

//query before searching all tours and middleware will fill all query objects before even searching
router
     .route('/top-5-cheap')
     .get(tourController.aliasTopTours, tourController.getToursStats);

router
     .route('/')
     .get(tourController.getAllTours)
     .post(
          authController.protect,
          authController.restrictTo('admin', 'lead-guide'),
          tourController.newTour,
     ); //it was written like /api/v1/tours' but we used middleware tourRouter to make it more resolved and easy acess
router
     .route('/:id')
     .get(tourController.getTour)
     .patch(
          authController.protect,
          authController.restrictTo('admin', 'lead-guide'),
          tourController.userPhotoUpload,
          tourController.imageResize,
          tourController.updateTour,
     )
     .delete(
          authController.protect,
          authController.restrictTo('admin', 'lead-guide'),
          tourController.deleteTour,
     );

module.exports = router;
