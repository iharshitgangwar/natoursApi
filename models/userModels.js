const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const appError = require('../utils/appError');

const userSchema = new mongoose.Schema({
     name: {
          type: String,
          required: [true, 'Please tell us your name!'],
     },
     email: {
          type: String,
          required: [true, 'Please tell us your email address'],
          unique: true,
          lowercase: true,
          validate: [validator.isEmail, 'Please provide a valid Email'],
     },
     photo: {
          type: String,
          default: 'default.jpg',
     },
     role: {
          type: String,
          enum: ['user', 'guide', 'lead-guide', 'admin'],
          default: 'user',
     },
     password: {
          type: String,
          required: [true, 'Password is required'],
          minlength: [8, 'Password must be at least 8 characters'],
          select: false,
     },
     conPassword: {
          type: String,
          required: true,
          validate: {
               validator: function (el) {
                    return el === this.password;
               },
          },
     },
     passwordChangedat: Date,

     passwordResetToken: String,
     passwordResetExpire: Date,
     activeStatus: {
          type: Boolean,
          default: true,
          select: false,
     },
});

userSchema.pre(/^find/, function (next) {
     // this point to the current query query middleware
     this.find({ activeStatus: { $ne: false } });
     next();
});

// userSchema.pre('save', async function (next) {
//      // this will run only password will modify
//      if (!this.isModified('password')) {
//           return next();
//      }
//      //this will hash the password in cost of 12
//      this.password = await bcrypt.hash(this.password, 12);
//      //    delete password field
//      this.conPassword = undefined;
// });

userSchema.pre('save', function (next) {
     if (!this.isModified('passwordChangedat') || this.isNew) {
          return next();
     }
     // -1000 will make sure that token will be created after if we do not do it then it will cause error
     this.passwordChangedat = Date.now() - 1000;
     next();
});

// check passord instance method
userSchema.methods.correctPassword = async function (
     candidatePassword,
     userPassword,
) {
     return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changePasswordAfter = function (JWTTimesstamp) {
     if (this.passwordChangedat) {
          const passwordTimeStamp = parseInt(
               this.passwordChangedat.getTime() / 1000,
               10,
          );
          return passwordTimeStamp > JWTTimesstamp;
     }
     return false;
};

userSchema.methods.createpasswordToken = function () {
     const resetToken = crypto.randomBytes(32).toString('hex');
     this.passwordResetToken = crypto
          .createHash('sha256')
          .update(resetToken)
          .digest('hex');
     this.passwordResetExpire = Date.now() + 10 * 60 * 1000;
     return resetToken;
};
const User = mongoose.model('User', userSchema);

module.exports = User;
