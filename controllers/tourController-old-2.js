const Tour = require(`../models/tourModel`);

// we removed database dependency from file

exports.aliasTopTours = (req, res, next) => {
   req.query.limit = '5';
   req.query.sort = '-ratingsAverage,price';
   req.query.fields = 'name,price,ratingsAverage,summery,difficulty';
   next();
};

class APIFeatures {
   constructor(query, queryString) {
      this.query = query;
      this.queryString = queryString;
   }

   filter() {}
}
exports.getAllTours = async (req, res) => {
   try {
      const queryObj = { ...req.query };

      // 1) filtering

      const excludeField = ['page', 'sort', 'limit', 'fields'];
      // here we are removing extre variables we need for diffrent purposes not for data filtering
      excludeField.forEach((el) => delete queryObj[el]);
      // console.log(req.query); this will return ?difficulty='easy like methods

      //2) advance filtering
      let queryString = JSON.stringify(queryObj);
      // here we are geting query like duration:{gte:5} but we need like $gte so we are replacing
      queryString = queryString.replace(
         /(gte|gt|lte|lt)\b/g,
         (match) => `$${match}`,
      );
      //3) perform all task before searchin in data becouse it will take time
      let query = Tour.find(JSON.parse(queryString));
      //here we are removed await becouse if await will be remain then
      //we can not process nesxt tasks until tis finisef

      //4) Sorting

      if (req.query.sort) {
         const sortBy = req.query.sort.split(',').join(' ');
         query = query.sort(sortBy);
      } else {
         // here we are soring by created latest
         query = query.sort('-createdAt');
      }
      //5) field selecting only
      if (req.query.fields) {
         const fields = req.query.fields.split(',').join(' ');
         query = query.select(fields);
      } else {
         query = query.select('-__v'); //this will be excluded
      }

      //6) pagination

      const page = req.query.page * 1 || 1;
      const limit = req.query.limit * 1 || 100;
      const skip = (page - 1) * limit;
      // here skip is the value which will be skipped by the query eg first page 10 then we choose 2 page it will skip 10 values
      // skip is like 0-10 10-20 20-30 if gap is 10
      query = query.skip(skip).limit(limit);
      if (req.query.page) {
         const numTours = await Tour.countDocuments();
         console.log(numTours);
         console.log(skip);
         if (skip > numTours) throw new Error('This page dows not exist');
      }

      // can be written as
      // const tours = await Tour()
      //    .where('duration')
      //    .equals(5)
      //    .where('difficulty')
      //    .equals('easy');

      // const tours = await Tour.find(); //this will return all tours
      const tours = await query;
      res.status(200).json({
         status: 'sucess',
         Count: tours.length,
         time: req.requestTime,
         data: {
            tours,
         },
      });
   } catch (err) {
      res.status(404).json({ error: 'failed', message: err });
   }
};

exports.getTour = async (req, res) => {
   try {
      const tour = await Tour.findById(req.params.id);
      //  Tour.findOne({_id:req.params.id}) is same as above
      res.status(200).json({
         status: 'success',
         data: {
            tour,
         },
      });
   } catch (err) {
      res.status(404).json({ error: 'failed', message: err });
   }
};

exports.updateTour = async (req, res) => {
   try {
      const updatedTour = await Tour.findByIdAndUpdate(
         req.params.id,
         req.body,
         { new: true },
      );
      res.status(200).json({
         status: 'success',
         data: {
            updatedTour,
         },
      });
   } catch (err) {
      res.status(404).json({ error: 'failed', message: err });
   }
};

exports.newTour = async (req, res) => {
   try {
      //here we are calling tour directoly previously we called it on new object
      const newTour = await Tour.create(req.body);

      res.status(201).json({
         status: 'success',
         data: {
            tour: newTour,
         },
      });
   } catch (err) {
      res.status(400).json({ message: 'There was an error', errmsg: err });
   }
};

exports.deleteTour = async (req, res) => {
   try {
      const deletedData = await Tour.findByIdAndDelete(req.params.id);
      res.status(200).json({
         status: 'Deleted',
         data: {
            deletedData,
         },
      });
   } catch (err) {
      res.status(400).json({ message: 'There was an error', errmg: err });
   }
};
