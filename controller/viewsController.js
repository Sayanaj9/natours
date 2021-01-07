const catchAsync= require('../utils/catchAsync');
const TourModel=require('../models/tourModels');
const User=require('../models/userModel');
const Booking=require('../models/bookingsModel');

const AppError = require('../utils/appError');


exports.getOverview=catchAsync(async(req,res,next)=>{
    //1)get tour data from collection 
        const tours=await TourModel.find();
    //2)build template

    //3)render that template using tour data
     
    res.status(200).render('overview',{
        title:'All tours',
        tours
       
    })
})

exports.getTour=catchAsync(async(req,res,next)=>{
    const tour=await TourModel.findOne({slug:req.params.name}).populate({
        path:'reviews',
        fields:'review rating user'
    });

 
    if(!tour)
    {
      
        return next(new AppError('there is no tour with that name',404))
    }
     
    res.status(200).set(
        'Content-Security-Policy',
        "default-src 'self' https://*.mapbox.com https://*.stripe.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com/v3/ 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
        ).render('tour',{
        title:`${req.params.slug}`,
        tour
       
    }); 
    // /.set(
    //     'Content-Security-Policy',
    //     "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    //   )
})

exports.getLoginForm=(req,res)=>{
    res.status(200).set(
        'Content-Security-Policy',
        "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
      ).render('login',{
        title:'log into your account'
    })
    
}

exports.getAccount=(req,res)=>{
    res.status(200).render('account',{
        title:'Your account'
    })
}

exports.updateUserData=catchAsync(async(req,res,next)=>{
   const updatedUser=await User.findByIdAndUpdate(req.user.id,{
       name:req.body.name,
       email:req.body.email
   },
   {
       new:true,//to get new updated data
       runValidators:true
   }
   );
   res.status(200).render('account',{
    title:'Your account',
    user:updatedUser  //reassigning to get the new updated data.o/w it will be old data from the protected middleware
    })
;   

})

exports.getMyTours = catchAsync(async (req, res, next) => {
    console.log("userid---",req.user);
    // 1) Find all bookings
    const bookings = await Booking.find({ user: req.user._id });
  
    // 2) Find tours with the returned IDs
    const tourIDs = bookings.map(el => el.tour);
    const tours = await TourModel.find({ _id: { $in: tourIDs } });
  
    res.status(200).render('overview', {
      title: 'My Tours',
      tours
    });
  });


// exports.getLoginForm=catchAsync(async(req,res,next)=>{
//             res.status(200).set(
//                 'Content-Security-Policy',
//                 "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
//               ).render('login',{
//                 title:'log into your account'
//             })
            
//             // .set(
//             //     'Content-Security-Policy',
//             //     "connect-src 'self' https://cdnjs.cloudflare.com"
//             //   )
//     }
// )

