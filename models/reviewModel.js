const mongoose = require('mongoose');
const validator = require('validator');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
     {
          review: {
               type: String,
               required: [true, 'Review can Not be Empty'],
          },
          rating: {
               type: Number,
               min: 1,
               Max: 5,
               required: true,
          },
          createdAt: {
               type: Date,
               default: Date.now,
          },
          tour: {
               type: mongoose.Schema.ObjectId,
               ref: 'Tour',
               required: [true, 'Review Must Belong To a Tour'],
          },

          user: {
               type: mongoose.Schema.ObjectId,
               ref: 'User',
               required: [true, 'Review Must Belong To a User'],
          },

          // here thos is activating vertual schema
     },
     {
          toJSON: { virtuals: true },
          toObject: { virtuals: true },
     },
);

// setting unique so one oser can post only one tour review we can achive this by indexing  by compund index
reviewSchema.index({ user: 1, tour: 1 }, { unique: true });
reviewSchema.pre(/^find/, function (next) {
     this.populate({
          path: 'tour',
          select: ' ratingsAverage ratingQuantity',
     }).populate({
          path: 'user',
          select: 'name photo',
     });
     next();
});

// creating a static function to calculate average reviews when each user will be save

reviewSchema.statics.calcReviews = async function (tourId) {
     const stats = await this.aggregate([
          {
               $match: { tour: tourId },
          },
          {
               $group: {
                    _id: '$tour',
                    nRating: { $sum: 1 },
                    avgRating: { $avg: '$rating' },
               },
          },
     ]);
     if (stats.length > 0) {
          // stats[0] becouse both stored in stats array
          await Tour.findByIdAndUpdate(tourId, {
               ratingsAverage: stats[0].avgRating,
               ratingQuantity: stats[0].nRating,
          });
     } else {
          await Tour.findByIdAndUpdate(tourId, {
               ratingsAverage: 0,
               ratingQuantity: 4.5,
          });
     }
};

reviewSchema.post('save', function () {
     this.constructor.calcReviews(this.tour);
});
// this query for deleted and update user that time rating
// reviewSchema.pre(/^findOneAnd/, async function (next) {
//    this.r = await this.findOne();
//    // we are passing the value to the post below becouse find will not update current data it will exicute and give nrew is
//    //this.calcReviews(this.tour); we are not using here this fucntion becouse it will calculate pre dfata not updated
//    next();
// });

reviewSchema.post(/^findOneAnd/, async function (doc) {
     // here find query will not work because it is exicuted
     await doc.constructor.calcReviews(doc.tour);
     console.log(doc.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
