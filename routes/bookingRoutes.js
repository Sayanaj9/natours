const express=require('express');
const {getCheckoutSession,getAllBookings,createBooking,getBooking,updateBooking,deleteBooking}=require('../controller/bookingController');
const {protect,restrictTo}=require('./../controller/authController');

const Router=express.Router(); //meregeparams will help in getting the params of other router

Router.use(protect);

Router.get('/checkout-session/:tourid', getCheckoutSession);

Router.use(restrictTo('admin', 'lead-guide'));


Router.route('/')
  .get(getAllBookings)
  .post(createBooking);


  Router.route('/:id')
  .get(getBooking)
  .patch(updateBooking)
  .delete(deleteBooking);

module.exports=Router;

