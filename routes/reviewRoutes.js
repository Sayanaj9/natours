const express=require('express');
const {getReviews,getAllReviews,createReviews,deleteReviews,updateReviews,setTourUserIds}=require('../controller/reviewController');
const {protect,restrictTo}=require('./../controller/authController');

const Router=express.Router({mergeParams:true}); //meregeparams will help in getting the params of other router

Router.use(protect)
Router.route('/').get(getAllReviews).post(restrictTo('user'),setTourUserIds,createReviews);
Router.route('/:id').get(getReviews).patch(restrictTo('user','admin'),updateReviews).delete(restrictTo('user','admin'),deleteReviews);

module.exports=Router;

