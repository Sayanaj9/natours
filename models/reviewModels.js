const mongoose=require('mongoose');
const User = require('./userModel');
const Tour = require('./tourModels');

const reviewSchema=new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'review cannot be empty']
      },
      ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0']
      },
      createdAt: {
        type: Date,
        default: Date.now(),
        select: false   //will hide the data from the client(wont be available in postman)
      },
      tour:{
        type:mongoose.Schema.ObjectId,
        ref:'Tour',
        required: [true, 'review must belong to a tour']
      },
      user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required: [true, 'review must belong to a user']
      }
      

}, {
    toJSON:{virtuals:true},//when there is property that is not saved to db,but we want thrm to be in the output of query,this method is used.
    toObject:{virtuals:true }
  })

//to avaoid a user putting multiple review on the same tour. They must be unique
  reviewSchema.index({tour:1,user:1},{ unique :true })

  
 //query middleware
 
 reviewSchema.pre(/^find/,function(next){
  // this.populate({path:'user',select:'name'}).populate({path:'tour',select:'name photo'});
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next()
 })

//static method used so that can directly call schema
 reviewSchema.statics.calcAverageRatings=async function(tourid)
 {
   //this points to the model
   const stats=await this.aggregate([
     {
        $match:{tour:tourid}
     },
     {
      $group:{
          _id:'$tour',
          nRating:{$sum :1},
          avgRating:{$avg:'$ratingsAverage'}
  
          
      }
      },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourid, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourid, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
 }

 
 reviewSchema.post('save', function() {
    //this constructor stands to the model.
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/,async function(next){
 this.r=await this.findOne();  //saved to this.r so that it can be accessed in the post method. & thsi method will now return the current document
 next()
})

reviewSchema.post(/^findOneAnd/,async function(){
  await this.r.constructor.calcAverageRatings(this.r.tour);
  next()
})


const Review=mongoose.model('Review',reviewSchema);
module.exports=Review;