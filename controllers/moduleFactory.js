const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
     catchAsync(async (req, res, next) => {
          const deletedData = await Model.findByIdAndDelete(req.params.id);
          if (!deletedData) {
               return next(new AppError('Document Not found', 404));
          }
          res.status(200).json({
               status: 'Deleted',
               data: {
                    deletedData,
               },
          });
     });

exports.updateOne = (Model) =>
     catchAsync(async (req, res, next) => {
          const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
               new: true,
               runValidators: true,
          });
          if (!doc) {
               return next(new AppError('Document not found', 404));
          }
          res.status(200).json({
               status: 'success',
               data: {
                    '': doc,
               },
          });
     });

exports.createOne = (Model) =>
     catchAsync(async (req, res, next) => {
          const doc = await Model.create(req.body);
          if (!doc) {
               return next(new AppError('Duplicate', err.status));
          }
          res.status(201).json({
               status: 'success',
               data: {
                    '': doc,
               },
          });
     });

exports.getOne = (Model, populateOptions) =>
     catchAsync(async (req, res, next) => {
          // we writeit like this becouse if populate exist or not
          const query = Model.findById(req.params.id);
          if (populateOptions) query.populate(populateOptions);
          const doc = await query;
          // here populates will show query of the referace we provided
          // we can hide by -
          //it is changed with above code    const doc = await Model.findById(req.params.id).populate('reviews');
          // Tour.findOne({_id:req.params.id}) is same as above
          if (!doc) {
               return next(new AppError('Document not found', 404));
          }

          res.status(200).json({
               status: 'success',
               data: {
                    '': doc,
               },
          });
     });

exports.getAll = (Model) =>
     catchAsync(async (req, res, next) => {
          // here we are checking if id is avilable in route then show reviews of that id
          //     this is only for review not right but we can ssay a hack top two lines
          let filter = {};
          if (req.params.tourId) filter = { tours: req.params.tourId };
          const features = new APIFeatures(Model.find(filter), req.query)
               .filter()
               .sorting()
               .limitFields()
               .paginationS();
          const doc = await features.query;

          res.status(200).json({
               status: 'sucess',
               Count: doc.length,
               time: req.requestTime,
               data: {
                    doc,
               },
          });
     });
