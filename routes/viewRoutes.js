const express=require('express');
const { isLoggedIn,protect } = require('../controller/authController');
const {createBookingCheckout} = require('../controller/bookingController');

const {getOverview,getTour,getLoginForm,getAccount,updateUserData,getMyTours}=require('../controller/viewsController')  
const Router=express.Router();

Router.get('/me',protect,getAccount);
// Router.get('/my-tours',createBookingCheckout,protect,getMyTours);
Router.get('/my-tours',protect,getMyTours);
 
Router.get('/login',isLoggedIn,getLoginForm);
Router.get('/',createBookingCheckout,isLoggedIn,getOverview)
Router.get('/tour/:name',isLoggedIn,getTour);
Router.post('/submit-user-data',protect,updateUserData)

module.exports=Router;