const express = require('express');
const userController = require(`${__dirname}/../controllers/userController`);
const authController = require(`${__dirname}/../controllers/authController`);

const router = express.Router(); //we created new router and saved in a variable

// all users conntrolers moved from here to controller file
// user routes
router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.get('/logout', authController.logout);
router.post('/forgotpassword', authController.forgotPassword);
router.patch('/resetpassword/:token', authController.resetPassword);

router.use(authController.protect);
router.patch('/updatepassword', authController.updatePassword);
router.patch(
     '/updateme/',
     userController.userPhotoUpload,
     userController.resizePhoto,
     userController.Update_current_user,
);
router.delete('/deleteme', userController.deletecurrentUser);
router.get('/me', userController.setuserIdToreq, userController.getMe);
// applymiddleware on below all
router.use(authController.restrictTo('admin'));
router
     .route('/')
     .get(userController.getAllUsers)
     .post(userController.createUser);
router
     .route('/:id')
     .get(userController.getUser)
     .patch(userController.updateUser)
     .delete(userController.deleteUser);

module.exports = router;
