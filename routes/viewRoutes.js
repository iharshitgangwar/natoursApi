const express = require('express');
const cors = require('cors');

const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');
const router = express.Router();

router.get(
     '/',
     // bookingController.createBookingCheckout,
     authController.isLoggedIn,
     viewController.overview,
);
router.get('/tour/:slug', authController.isLoggedIn, viewController.toursView);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/signUp', viewController.getsignUpForm);
router.get('/account', authController.protect, viewController.account);
router.get('/my-tours', authController.protect, viewController.getMyTour);

// router.post(
//      '/submit-user-data',
//      authController.protect,
//      viewController.updateUserData,
// );

module.exports = router;
