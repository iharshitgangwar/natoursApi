const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
const Tour = require('../models/tourModel');
const factory = require(`./moduleFactory`);

// we created this middleware becouse this was insite create function but we made it in factory so we made middleware
// that it will run before create and set id and user id to the params see in routs
exports.setIdsTourUser = (req, res, next) => {
     if (!req.body.tour) req.body.tour = req.params.tourId;
     if (!req.body.user) req.body.user = req.user.id;
     next();
};
exports.checkTour = async (req, res, next) => {
     const bookings = await Booking.find({ user: req.user.id });
     const tour_id = req.params.tourId;
     const TourIds = bookings.map((el) => el.tour.id);
     if (!TourIds.includes(tour_id)) {
          return res.status(400).json({
               status: 'Falied',
               message: 'You Have not Purchased This tour',
          });
     }
     next();
};
exports.createReview = factory.createOne(Review);
exports.getAllReviews = factory.getAll(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
