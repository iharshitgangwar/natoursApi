const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');
// merge params true becouse we are acessing other router param id
const router = express.Router({ mergeParams: true });

// this is router created here and exported in to app.js where i defined it as a middleware and used after the url
// eg app.use('./routes,router);
// here userId router will redirected to here
router.use(authController.protect);

router
     .route('/')
     .get(reviewController.getAllReviews)
     .post(
          authController.restrictTo('user'),
          reviewController.setIdsTourUser,
          reviewController.createReview,
     );
module.exports = router;
router
     .route('/:id')
     .delete(
          authController.restrictTo('user', 'admin'),
          reviewController.deleteReview,
     )
     .patch(
          authController.restrictTo('user', 'admin'),
          reviewController.updateReview,
     );
