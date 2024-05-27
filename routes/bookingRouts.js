const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();
router.use(authController.protect);
router.get('/bookingsSessions/:tourId', bookingController.bookingSession);

router.use(authController.restrictTo('admin', 'lead-guide'));
router
     .route('/:id')
     .get(bookingController.getBooking)
     .delete(bookingController.deleteBooking)
     .patch(bookingController.updateBooking);
router
     .route('/')
     .post(bookingController.newBooking)
     .get(bookingController.getAllBooking);

module.exports = router;
