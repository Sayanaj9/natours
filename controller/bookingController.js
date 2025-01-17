const stripe=require('stripe')(process.env.STRIPE_SECRETKEY)  
const catchAsync= require('../utils/catchAsync');
const factory=require('./handlerFactory');
const TourModel=require('../models/tourModels');
const Booking=require('../models/bookingsModel');

const AppError = require('../utils/appError');

exports.getCheckoutSession=catchAsync(async(req,res,next)=>{

    //1)get the currently booked tour
    const tour=await TourModel.findById(req.params.tourid)

    //2)create checkout session

    const session=await stripe.checkout.sessions.create({
        payment_method_types:['card'],
        success_url:`${req.protocol}://${req.get('host')}/`,
        // success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
        //     req.params.tourid
        //   }&user=${req.user.id}&price=${tour.price}`,
        cancel_url:`${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email:req.user.email,
        client_reference_id:req.params.tourid,
        line_items:[
            {
                name:`${tour.name} Tour`,
                description:tour.summary,
                images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                amount:tour.price*100,
                currency:'usd',
                quantity:1
            }
        ]

    })

    //3)create session as response

    res.status(200).json({
        status:'success',
        session
    })
    
   
    next()
})

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
    const { tour, user, price } = req.query;
  
    if (!tour && !user && !price) return next();
    await Booking.create({ tour, user, price });
  
    // res.redirect(req.originalUrl.split('?')[0]);
  });
  
exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
