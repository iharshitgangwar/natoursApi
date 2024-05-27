const User = require('./../models/userModels');
const catchAsync = require(`../utils/catchAsync`);
const appError = require(`../utils/appError`);
const factory = require(`./moduleFactory`);
const multer = require('multer');
const sharp = require('sharp');

// here images will be saved this middleware is used for that

// const multerStorage = multer.diskStorage({
//      destination: (req, file, cb) => {
//           cb(null, 'public/img');
//      },
//      filename: (req, file, cb) => {
//           const ext = file.mimetype.split('/')[1];
//           // setting filename
//           cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//      },
// });

// store image in memory
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

exports.userPhotoUpload = upload.single('photo');

const filterObjDB = (obj, ...allowedField) => {
     const newObj = {};
     Object.keys(obj).forEach((el) => {
          if (allowedField.includes(el)) {
               newObj[el] = obj[el];
          }
     });
     return newObj;
};

exports.createUser = (req, res) => {
     res.status(500).json({
          status: 'error',
          message: 'This route is not defiend You Must Register',
     }); //checking if id exist
};
exports.getAllUsers = factory.getAll(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.getUser = factory.getOne(User);
exports.setuserIdToreq = (req, res, next) => {
     req.params.id = req.user.id;
     next();
};
exports.getMe = factory.getOne(User);

exports.resizePhoto = (req, res, next) => {
     if (!req.file) {
          return next();
     }
     // defining filename becouse we changes diskstorage
     req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
     sharp(req.file.buffer)
          .resize(500, 500)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/${req.file.filename}`);
     next();
};
exports.Update_current_user = catchAsync(async (req, res, next) => {
     // if user tries to update password;
     if (req.body.password || req.body.conPassword) {
          return next(new appError('You can not change password', 400));
     }

     // 2)update user document
     // here we are only updating data by x and seeting valdiatores true

     const filteredBody = filterObjDB(req.body, 'name', 'email');
     if (req.file) {
          filteredBody.photo = req.file.filename;
     }
     const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
          new: true,
          runValidators: true,
     });

     res.status(200).json({
          status: 'success',
          user,
     });
});

exports.deletecurrentUser = catchAsync(async (req, res, next) => {
     const user = await User.findByIdAndUpdate(req.user._id, {
          activeStatus: false,
     });
     res.status(204).json({
          status: 'sucess',
          data: null,
     }); //checking if id exist
});

// here in above at first we were useing function but now we are in diffrent file so we are exporting directly from here
