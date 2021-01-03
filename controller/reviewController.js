const AppError = require('../utils/appError');
const catchAsync= require('../utils/catchAsync');
const Review=require('../models/reviewModels');
const factory=require('./handlerFactory');

// exports.getReviews=catchAsync(async(req,res,next)=>{
//     const Reviews=await Review.findById(req.params.id);
//         if(!Reviews){
            
//             return next(new AppError('No reviews with this id',404))
//         }

//         res.status(200).json({
//             status:'success',
        
//             data:{
//                 Reviews
//             }
//         })
    
   
// })


// catchAsync(async(req,res,next)=>{
//     let filter={};
//     if(req.params.tourid) filter={tour:req.params.tourid}
//     const reviews=await Review.find(filter);
//     res.status(200).json({
//         status:'success',
//         result:reviews.length,
//         data:{
//             reviews
//         }
//     })
    
   
// })


//middleware that run befor createReviews
exports.setTourUserIds=(req,res,next)=>{
    
    //allow nested routes
    if(!req.body.tour) req.body.tour=req.params.tourid;
    if(!req.body.user) req.body.user=req.user.id;
    next()
}
exports.getReviews=factory.getOne(Review);
exports.createReviews=factory.createOne(Review);
exports.updateReviews=factory.updateOne(Review);
exports.deleteReviews=factory.deleteOne(Review);
exports.getAllReviews=factory.getAll(Review);
