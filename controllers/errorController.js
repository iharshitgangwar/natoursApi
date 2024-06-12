/* eslint-disable no-param-reassign */
const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
     const message = `Invalid ${err.path}: ${err.name}`;
     return new AppError(message, 404);
};
const handleDuplicateErrorDB = (err) => {
     const value = err.message.match(/{ (.*?): "(.*?)" }/)[2];
     const message = `${value} Already exists`;
     return new AppError(message, 404);
};

const handleValidatorErrorDB = (err) => {
     const errors = Object.values(err.errors).map((el) => el.message);
     const message = `Invalid input Data ${errors.join(', ')}`;
     return new AppError(message, 404);
};

const jwtTokenError = (err) => new AppError('Invalid Token Login Again', 401);
const jwtTokenExpiredError = (err) =>
     new AppError('Token Expired Login Again', 401);
const sendErrorDev = (req, res, err) => {
     if (req.originalUrl.startsWith('/api')) {
          res.status(err.statusCode).json({
               error: err,
               status: err.status,
               message: err.message,
               stack: err.stack,
          });
     } else {
          res.status(err.statusCode).render('error', {
               title: 'Something went Wrong',
               msg: err.message,
          });
     }
};
const sendErrorPro = (req, res, err) => {
     if (req.originalUrl.startsWith('/api')) {
          if (err.isOperational) {
               res.status(err.statusCode).json({
                    status: err.status,
                    message: err.message,
               });
          } else {
               res.status(500).json({
                    status: 'Error',
                    message: 'something Got Very Wrong',
               });
          }
     } else {
          res.status(err.statusCode).render('error', {
               title: 'Not Found',
               msg: 'Please Try Again',
          });
     }
};
module.exports = (err, req, res, next) => {
     err.statusCode = err.statusCode || 500;
     err.status = err.status || 'error';
     if (process.env.NODE_ENV === 'development') {
          sendErrorDev(req, res, err);
     } else if (process.env.NODE_ENV === 'production') {
          let error = { ...err };
          error.message = err.message;
          error.name = err.name;
          error.statusCode = err.statusCode;
          if (err.name === 'CastError') {
               error = handleCastErrorDB(error);
          }
          if (err.code === 11000) {
               error = handleDuplicateErrorDB(error);
          }
          if (error.name === 'ValidationError') {
               error = handleValidatorErrorDB(error);
          }
          if (err.name === 'jsonWebTokenError') {
               error = jwtTokenError(error);
          }
          if (err.name === 'TokenExpiredError') {
               error = jwtTokenExpiredError(error);
          }
          sendErrorPro(req, res, error);
     }
};
