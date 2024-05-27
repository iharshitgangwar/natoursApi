const mongoose = require('mongoose');
const { default: slugify } = require('slugify');
const validator = require('validator');
const User = require('./userModels');

// defining mongoose schema
// here required and other values are pre defined schemas
const tourSchema = new mongoose.Schema(
     {
          name: {
               type: String,
               required: [true, 'A tour Must have a Name'],
               unique: true,
               minLength: [
                    10,
                    'Character length must be greater than 10 chars',
               ],
          },
          slug: {
               type: String,
          },
          secrateTour: {
               type: Boolean,
               default: false,
          },
          startLocation: {
               // GeoJSON
               type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point'],
               },
               coordinates: [Number],
               address: String,
               description: String,
          },
          locations: [
               {
                    type: {
                         type: String,
                         default: 'Point',
                         enum: ['Point'],
                    },
                    coordinates: [Number],
                    address: String,
                    description: String,
                    day: Number,
               },
          ],
          // guides:[Array],
          guides: [
               {
                    type: mongoose.Schema.ObjectId,
                    ref: 'User',
               },
          ],
          duration: {
               type: Number,
               requred: [true, 'A tour must have a duration'],
          },
          maxGroupSize: {
               type: Number,
               requred: [true, 'A tour must have a Group Size'],
          },
          difficulty: {
               type: String,
               requred: [true, 'A tour must have a difficulty'],
          },
          ratingsAverage: { type: Number, default: 4.5 },
          ratingQuantity: { type: Number, default: 0 },
          price: { type: Number, required: [true, 'A tour must have a Price'] },
          discount: { type: Number },
          summary: {
               type: String,
               trim: true,
               required: [true, 'A tour must have a Summary'],
          },
          priceDiscount: {
               type: Number,
               validate: {
                    validator: function (e) {
                         return e < this.price;
                    },
                    message: 'A tour Discount ({VALUE}) More than  Price above price',
               },
          },
          description: { type: String, trim: true },
          imageCover: {
               type: String,
               required: [true, 'A tour must have a Cover Images'],
          },
          images: [String],
          createdAt: {
               type: Date,
               default: Date.now(),
               select: false,
          },
          startDates: [Date],
     },
     // here thos is activating vertual schema
     {
          toJSON: { virtuals: true },
          toObject: { virtuals: true },
     },
);
// select will hide in db show
// creating model it will be the document of the database natours tours from Tour
// first we create schema then model then we use it
// vertual property
// here we have not defind funtion in arrow function becouse herevwe need this property this is directing to current
// we use this to show calcution in the data without sh=aving in db
tourSchema.virtual('durationWeeks').get(function () {
     return this.duration / 7;
});
tourSchema.virtual('MaxGroup').get(function () {
     return this.maxGroupSize / 5;
});
// tourSchema.index({price:1}); we have to delete it manually from compass so itafter removing it

// this is combined index
tourSchema.index({ price: 1, ratingsAverage: -1 });
// here thisb geolocation indexing in 2dsphare it is importen while using geolocation
tourSchema.index({ startLocation: '2dsphere' });
tourSchema.index({ slug: 1 });
// here this will not show in the postman go and populate it in get one tour
// defining vertual schema to get reviews data from reviews collection by taking id in reviews tour field
tourSchema.virtual('reviews', {
     ref: 'Review',
     foreignField: 'tour',
     localField: '_id',
});

// here because of async map it is returnig promises not the value so we need to resolve it by below line
// Only For save embading
// tourSchema.pre('save' ,async function(next){
//    const tourGuidePromices=this.guides.map(async el=> await User.findById(el));
//    this.guides=await Promise.all(tourGuidePromices);
//    next();
// });

// document middleware: runs before save command & create command but not on insertmany
tourSchema.pre('save', function (next) {
     this.slug = slugify(this.name, { lower: true });
     next();
});

tourSchema.pre(/^find/, function (next) {
     this.populate({
          path: 'guides',
          select: 'name',
     });
     next();
});

// Query Middleware
tourSchema.pre(/^find/, function (next) {
     this.find({ secrateTour: { $ne: true } });
     this.start = Date.now();
     next();
});

// We are using /^find regular expression becouse we can exicute onklye
// one time find so here we can exicute all operatuon starting with find by the use of regular expression/
// for working for all find queries l=eg findOne we will use regular expression

tourSchema.post(/^find/, function (docs, next) {
     next();
});

// aggrgate middleware  here ushift is js function to add element in last of array
tourSchema.pre('aggregate', function (next) {
     const pipeline = this.pipeline();
     const ifGeoNear =
          pipeline.length > 0 && pipeline[0].$geoNear !== undefined;

     if (ifGeoNear) {
          // splice(1, 0, ...) inserts the specified element(s) at index 1 of the array without removing any elements. It effectively inserts the $match stage at the specified position in the pipeline array. at 0 already an arraygeonear
          pipeline.splice(1, 0, {
               $match: {
                    secrateTour: { $ne: true },
               },
          });
     } else {
          // unshift() is a JavaScript array method that adds one or more elements to the beginning of an array and returns the new length of the array. It modifies the original array.
          pipeline.unshift({
               $match: {
                    secrateTour: { $ne: true },
               },
          });
     }
     next();
});

// script for import json data
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
