const { promisify } = require('util');
const User = require('../models/userModels');
const catchAsync = require(`../utils/catchAsync`);
const jwt = require('jsonwebtoken');
const appError = require('../utils/appError');
const bcrypt = require('bcryptjs');
const { token } = require('morgan');
const Email = require('../utils/email');
const crypto = require('crypto');
const { env } = require('process');
const signToken = (id) => {
     return jwt.sign({ id }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRATION,
     });
};

const createSendToken = (user, statusCode, res) => {
     const token = signToken(user._id);
     const cookieOptions = {
          expires: new Date(
               Date.now() +
                    process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
          ),
          httpOnly: true,
     };

     if (!process.env.NODE_ENV === 'production') {
          cookieOptions.secure = true;
     }
     res.cookie('jwt', token, cookieOptions);

     user.password = undefined;
     res.status(statusCode).json({
          status: 'success',
          token,
          data: {
               user,
          },
     });
};

exports.signup = catchAsync(async (req, res, next) => {
     const newUser = await User.create({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          conPassword: req.body.conPassword,
          role: req.body.role,
     });
     //    here secret is for security purpos
     const url = `${req.protocol}://${req.get('host')}/me`;
     await new Email(newUser, url).sendWelcome();
     // fisrtly it was same then we made function of this
     createSendToken(newUser, 201, res);
});

exports.signin = catchAsync(async (req, res, next) => {
     const { email, password } = req.body;
     // if email and password are not provided
     if (!email || !password) {
          const message = 'please provide email and password';
          return next(new appError(message, 400));
     }
     //    checking email password in db
     const user = await User.findOne({ email }).select('+password');
     // checking user pass by calling function here user is module of user
     if (!user || !(await user.correctPassword(password, user.password))) {
          return next(new appError('Incorrect Email or password', 401));
     }

     //    if everything ok send token
     createSendToken(user, 200, res);
});

// protecting routs from unauthorized user
exports.protect = catchAsync(async (req, res, next) => {
     // get The token
     let token;
     if (
          req.headers.authorization &&
          req.headers.authorization.startsWith('Bearer')
     ) {
          token = req.headers.authorization;
          token = token.split(' ')[1];
     } else if (req.cookies.jwt) {
          token = req.cookies.jwt;
     }
     if (!token) {
          return next(
               new appError('You Are Not Logged In Please Log In First', 401),
          );
     }

     // validate token
     const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
     // check user is valid
     const currentUser = await User.findById(decoded.id);
     if (!currentUser) {
          return next(
               new appError('Invalid TokenPlease Log In or Sign UP', 401),
          );
     }
     // check if user changed password after jwt issued
     if (currentUser.changePasswordAfter(decoded.iat)) {
          return next(new appError('User Changed Password', 401));
     }
     // grant acess to protected route
     req.user = currentUser;
     res.locals.user = currentUser;
     next();
});

//only for renderd pages
exports.isLoggedIn = async (req, res, next) => {
     // get The token

     if (req.cookies.jwt) {
          try {
               // validate token
               const decoded = await promisify(jwt.verify)(
                    req.cookies.jwt,
                    process.env.JWT_SECRET,
               );
               // check user is valid
               const currentUser = await User.findById(decoded.id);
               if (!currentUser) {
                    return next();
               }
               // check if user changed password after jwt issued
               if (currentUser.changePasswordAfter(decoded.iat)) {
                    return next();
               }
               // grant acess to protected route
               res.locals.user = currentUser; //each pug template can acess this
               return next();
          } catch (err) {
               return next();
          }
     }
     next();
};

exports.logout = (req, res) => {
     res.cookie('jwt', 'loggedout', {
          expires: new Date(Date.now() + 1 * 1000),
          httpOnly: true,
     });
     res.status(200).json({ status: 'success' });
};

// restriction for only named posts
exports.restrictTo = (...roles) => {
     return (req, res, next) => {
          // roles is an array
          if (!roles.includes(req.user.role)) {
               return next(new appError('You Do not have permisson', 403));
          }
          next();
     };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
     // get user base on posted email
     const user = await User.findOne({ email: req.body.email });
     if (!user) return next(new appError('No User Found', 404));
     // generate random token  generated in model

     const resetToken = user.createpasswordToken();
     await user.save({ validateBeforeSave: false });

     // send it back as an email

     const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetpassword/${resetToken}`;
     const message = `Forgot Your password? Submit a Patch request with your new password and password Confirm
   passwordConfirm to:${resetUrl}.\n If you did'nt forget your password,Please ignore this email`;
     try {
          // await sendEmail({
          //      email: user.email,
          //      subject: 'Your Password Reset Token Valid for 10 minutes',
          //      message,
          // });

          await new Email(user, resetUrl).sendWelcome();
          return res.status(200).json({
               status: 'success',
               message: 'Token Send to Email',
          });
     } catch (err) {
          user.passwordResetToken = undefined;
          user.passwordResetExpire = undefined;
          await user.save({ validateBeforeSave: false });
          return next(new appError('Email not send', 500));
     }
});
exports.resetPassword = async (req, res, next) => {
     const hashedToken = crypto
          .createHash('sha256')
          .update(req.params.token)
          .digest('hex');
     // get user based on the token

     const user = await User.findOne({
          passwordResetToken: hashedToken,
          passwordResetExpire: { $gt: Date.now() },
     });
     // IF token not expired set new password
     if (!user) {
          return next(new appError('Token is expired', 400));
     }
     // update changed passwerd
     user.password = req.body.password;
     user.conPassword = req.body.conPassword;
     user.passwordResetToken = undefined;
     user.passwordResetExpire = undefined;
     await user.save();

     //log the user id send jwt
     createSendToken(user, 200, res);

     // update changed passwerd status date
};

exports.updatePassword = catchAsync(async (req, res, next) => {
     // 1)Get User from collection
     const user = await User.findById(req.user.id).select('password');

     // 2)Check if password is correct
     if (
          !(await user.correctPassword(req.body.currentPassword, user.password))
     ) {
          return next(new appError('Invalid password'));
     }
     // if password is correct update password
     user.password = req.body.password;
     user.conPassword = req.body.conPassword;
     try {
          await user.save();
     } catch (err) {
          console.log(err);
     }
     // logged user in and jwt new and new password
     createSendToken(user, 200, res);
});
