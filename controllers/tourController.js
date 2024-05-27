const Tour = require(`../models/tourModel`);
const catchAsync = require(`../utils/catchAsync`);
const factory = require(`./moduleFactory`);
const appError = require('../utils/appError');
const multer = require('multer');
const sharp = require('sharp');

// we removed database dependency from file

const multerStorage = multer.memoryStorage();
// this will test given file is image or not
const multerFilter = (req, file, cb) => {
     if (file.mimetype.startsWith('image')) {
          cb(null, true);
     } else
          cb(new appError('Not an Image Please Upload Only Image', 400), false);
};
// calling multer setup
const upload = multer({
     storage: multerStorage,
     fileFilter: multerFilter,
});

exports.userPhotoUpload = upload.fields([
     { name: 'imageCover', maxCount: 1 },
     { name: 'images', maxCount: 3 },
]);

exports.imageResize = async (req, res, next) => {
     const imageCoverFilename = `tour=${req.params.id}-${Date.now()}-cover.jpeg`;
     if (!req.files.imageCover || !req.files.images) return next();
     await sharp(req.files.imageCover[0].buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .toFile(`public/img/${imageCoverFilename}`);
     req.body.imageCover = imageCoverFilename;

     //   images
     req.body.images = [];
     await Promise.all(
          req.files.images.map(async (file, i) => {
               const fileName = `tour=${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
               await sharp(req.files.images[i].buffer)
                    .resize(2000, 1333)
                    .toFormat('jpeg')
                    .toFile(`public/img/${fileName}`);
               req.body.images.push(fileName);
          }),
     );
     next();
};

exports.aliasTopTours = (req, res, next) => {
     req.query.limit = '5';
     req.query.sort = '-ratingsAverage,price';
     req.query.fields = 'name,price,ratingsAverage,summery,difficulty';
     next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.updateTour = factory.updateOne(Tour);
// here we are changing the error handling to simlified async so when error occur it will catch from here
exports.newTour = factory.createOne(Tour);
// we made a module of this function
exports.deleteTour = factory.deleteOne(Tour);
// perform action ondata
// here we can perform operations on data
exports.getToursStats = catchAsync(async (req, res, next) => {
     const stats = await Tour.aggregate([
          {
               $match: { ratingsAverage: { $gte: 4.5 } },
          },
          {
               $group: {
                    _id: { $toUpper: '$difficulty' },
                    numTours: { $sum: 1 },
                    numbRatings: { $sum: 'ratingsQuantity' },
                    avgRating: { $avg: '$ratingsAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
               },
          },
          {
               $sort: { avgPrice: 1 },
          },
          // {
          //    //$match: { _id: { $ne: 'MEDIUM' } },
          // },
          // we can write query as much i we need
     ]);

     res.status(200).json({
          status: 'Done',
          data: {
               stats,
          },
     });
});
// without cachAsync block will be look like this
// here this will show plans by year
exports.monthlyPlan = async (req, res) => {
     try {
          const year = req.params.year * 1;
          const stats = await Tour.aggregate([
               {
                    $unwind: '$startDates',
               },
               {
                    $match: {
                         startDates: {
                              $gte: new Date(`${year}-01-01`),
                              $lte: new Date(`${year}-12-31`),
                         },
                    },
               },
               {
                    $group: {
                         _id: { $month: '$startDates' },
                         // will show total
                         numToursStarts: {
                              $sum: 1,
                         },
                         // here we are sending ames of y=tour in the pipeline
                         tours: {
                              $push: '$name',
                         },
                         difficulty: {
                              $push: '$difficulty',
                         },
                    },
               },
               // will add field
               {
                    $addFields: {
                         month: '$_id',
                    },
               },
               // this will show and hide variable
               {
                    $project: {
                         _id: 0,
                    },
               },
               // /willsort
               {
                    $sort: {
                         numToursStarts: -1,
                    },
               },
               // limit as defind
               {
                    $limit: 12,
               },
          ]);
          res.status(200).json({
               status: 'Done',
               count: stats.length,
               data: {
                    stats,
               },
          });
     } catch (err) {
          res.send(err);
     }
};

exports.getToursWithIn = catchAsync(async (req, res, next) => {
     const { distance, latlng, unit } = req.params;
     const [lat, lng] = latlng.split(',');
     const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
     if (!lat || !lng) {
          return next(
               new appError(
                    'Please provide lat and long in provided format',
                    400,
               ),
          );
     }
     const tours = await Tour.find({
          startLocation: {
               $geoWithin: { $centerSphere: [[lng, lat], radius] },
          },
     });
     console.log(distance, unit, lat, lng);
     res.status(200).json({
          results: tours.length,
          status: 'sucess',
          data: {
               data: tours,
          },
     });
});

exports.getToursDistances = catchAsync(async (req, res, next) => {
     const { latlng, unit } = req.params;
     const [lat, lng] = latlng.split(',');

     const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

     if (!lat || !lng) {
          return next(
               new appError(
                    'Please provide lat and long in provided format',
                    400,
               ),
          );
     }
     // it requires first $geoNew=ar and it required=s on index geo variable
     const distances = await Tour.aggregate([
          {
               $geoNear: {
                    near: {
                         type: 'Point',
                         coordinates: [lng * 1, lat * 1],
                    },
                    distanceField: 'distance',
                    distanceMultiplier: multiplier,
               },
          },
          {
               $project: {
                    distance: 1,
                    name: 1,
               },
          },
     ]);

     res.status(200).json({
          status: 'sucess',
          data: {
               data: distances,
          },
     });
});
