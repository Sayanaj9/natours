const express=require('express');
const {getAllTours,createTour,getTours,updateTour,deleteTour,aliasTopTours,getTourstats,monthlyPlan,getToursWithin,
    getDistances,resizeTourImages,uploadTourImages}=require('./../controller/toursController');
const {protect,restrictTo}=require('./../controller/authController');
const {createReviews}=require('./../controller/reviewController');
const reviewRouter=require('./../routes/reviewRoutes');


const Router=express.Router();

// Router.param('id',checkId)
Router.use('/:tourid/reviews',reviewRouter) //will then go to reviewRouter & then uses cerate function in reviewController.can avoid repetitive code
Router.route('/tour-stats').get(getTourstats);
Router.route('/monthly-plan/:year').get(protect,restrictTo('admin','lead-guide'),monthlyPlan);
Router.route('/top-5-cheap').get(aliasTopTours,getAllTours);
Router.route('/').get(getAllTours).post(protect,restrictTo('admin','lead-guide'),createTour);
// Router.route('/:tourid/reviews').post(protect,restrictTo('user'),createReviews);
Router.route('/:id').get(getTours).patch(protect,restrictTo('admin','lead-guide'),uploadTourImages,resizeTourImages,updateTour).delete(protect,restrictTo('admin','lead-guide'),deleteTour);

Router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(getToursWithin);
Router.route('/distances/:latlng/unit/:unit').get(getDistances);

module.exports=Router;