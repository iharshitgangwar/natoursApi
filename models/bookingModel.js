const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
     status: {
          type: Boolean,
          default: true,
     },
     createdAt: {
          type: Date,
          default: Date.now(),
     },
     paid: {
          type: Boolean,
          default: true,
     },
     tour: {
          type: mongoose.Schema.ObjectId,
          ref: 'Tour',
          required: [true, 'Review Must have  a Tour'],
     },
     user: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
          required: [true, 'Booking Must Have a User'],
     },
     price: {
          type: Number,
          required: [true, 'Price is Required'],
     },
});

BookingSchema.pre(/^find/, function (next) {
     this.populate('user').populate({ path: 'tour', select: 'name' });
     next();
});
const Booking = mongoose.model('Booking', BookingSchema);

module.exports = Booking;
