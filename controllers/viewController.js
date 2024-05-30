const Tour = require('../models/tourModel');
const User = require('../models/userModels');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');

exports.overview = catchAsync(async (req, res, next) => {
     const tours = await Tour.find();
     res.status(200).render('overview', {
          title: 'Natours',
          tours,
     });
});
exports.account = (req, res) => {
     res.status(200).render('account_a', {
          status: 'success',
          title: 'Natours',
     });
};

exports.toursView = catchAsync(async (req, res, next) => {
     const tour = await Tour.findOne({ slug: req.params.slug }).populate({
          path: 'reviews',
          select: 'review rating',
     });
     if (!tour) {
          return next(new appError('Not Found Please Try Again!', 404));
     }

     res.status(200).render('tour', {
          title: `${tour.name} Tour`,
          tour,
     });
});
exports.getLoginForm = catchAsync(async (req, res, next) => {
     res.status(200).render('login', {
          title: `Login Please`,
     });
});
exports.getsignUpForm = catchAsync(async (req, res, next) => {
     res.status(200).render('signup', {
          title: `Sign Up Please`,
     });
});

exports.getMyTour = async (req, res, next) => {
     // find all Bookings
     const bookings = await Booking.find({ user: req.user.id });
     // find tours with return ids
     const tourIds = bookings.map((el) => el.tour.id);
     const tours = await Tour.find({ _id: { $in: tourIds } });
     res.status(200).render('overview', { title: 'My Tours', tours });
};
