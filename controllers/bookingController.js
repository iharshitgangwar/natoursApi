const Tour = require('../models/tourModel');
const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Booking = require('../models/bookingModel');
const factory = require('./moduleFactory');
const stripe = require('stripe')(process.env.STRIPE_KEY);

exports.bookingSession = catchAsync(async (req, res, next) => {
     const tour = await Tour.findById(req.params.tourId);
     if (!tour) return next(new appError('Tour Not Found', 404));

     const product = await stripe.products.create({
          name: `${tour.name} Tour`,
          description: `${tour.summary}`,
          images: [`https://www.natours.dev/img/tours/tour-1-cover.jpg`],
     });
     const price = await stripe.prices.create({
          product: product.id,
          unit_amount: tour.price * 100,
          currency: 'inr',
     });
     const customer = await stripe.customers.create({
          name: 'Jenny Rosen',
          email: req.user.email,
          address: {
               line1: '123 Main St',
               city: 'San Francisco',
               state: 'CA',
               postal_code: '94111',
               country: 'US',
          },
     });
     // this is unsecure anyone can book
     const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          success_url: `${req.protocol}://${req.get('host')}/?tour=${tour.id}&user=${req.user.id}&price=${tour.price}`,
          cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
          customer: customer.id,
          client_reference_id: req.param.tourId,
          line_items: [
               {
                    price: price.id,
                    quantity: 1,
               },
          ],
          mode: 'payment',
     });

     // create checkout session
     res.status(200).json({ status: 'success', session });
});

exports.createBookingCheckout = async (req, res, next) => {
     const { tour, user, price } = req.query;

     if (!tour && !user && !price) {
          return next();
     }

     await Booking.create({ tour, user, price });
     res.redirect(req.originalUrl.split('?')[0]);
};

exports.getAllBooking = factory.getAll(Booking);
exports.getBooking = factory.getOne(Booking);
exports.newBooking = factory.createOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
