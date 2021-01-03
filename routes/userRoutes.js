const express=require('express');
const {getAllUsers,createUser,getUsers,updateUser,deleteUser,updateMe,deleteMe,getMe,uploadUserPhoto,resizeUserPhoto}=require('./../controller/userController');
const {signup,login,protect,forgotPassword,resetPassword,updatePassword, restrictTo,logout}=require('./../controller/authController');

const Router=express.Router();
Router.post('/signup',signup);
Router.post('/login',login);
Router.get('/logout',logout);

Router.post('/forgotPassword',forgotPassword)
Router.patch('/resetPassword/:token',resetPassword);

Router.use(protect);
Router.patch('/updateMyPassword',updatePassword);
Router.get('/me',getMe,getUsers)
Router.patch('/updateMe',uploadUserPhoto,resizeUserPhoto,updateMe);
Router.delete('/deleteMe',deleteMe);

Router.use(restrictTo('admin'));
Router.route('/').get(getAllUsers).post(createUser);
Router.route('/:id').get(getUsers).patch(updateUser).delete(deleteUser);

module.exports=Router;