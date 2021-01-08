const express=require('express');
const path=require('path');
const helmet=require('helmet');
const cors=require('cors');
const hpp=require('hpp');
const mongoSanitize=require('express-mongo-sanitize');
const xss=require('xss-clean');
const rateLimiter=require('express-rate-limit');
const app=express();
const AppError=require('./utils/appError');
const globalErrorHandler=require('./controller/errorController')
const morgan=require('morgan');
const tourRouter=require('./routes/tourRoutes');
const userRouter=require('./routes/userRoutes');
const reviewRouter=require('./routes/reviewRoutes');
const viewRouter=require('./routes/viewRoutes');
const bookingRouter=require('./routes/bookingRoutes');
const compression=require('compression');
const cookieParser=require('cookie-parser');


const rateLimit = require('express-rate-limit');

app.set('view engine','pug');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'public')));

//Middleware -for everey request


//set security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'https:', 'data:'],
        scriptSrc: [
          "'self'",
          'https:',
          'http:',
          'blob:',
          'https://*.mapbox.com',
          'https://js.stripe.com',
          'https://m.stripe.network',
          'https://*.cloudflare.com',
        ],
        frameSrc: ["'self'", 'https://js.stripe.com'],
        objectSrc: ["'none'"],
        styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
        workerSrc: [
          "'self'",
          'data:',
          'blob:',
          'https://*.tiles.mapbox.com',
          'https://api.mapbox.com',
          'https://events.mapbox.com',
          'https://m.stripe.network',
        ],
        childSrc: ["'self'", 'blob:'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        formAction: ["'self'"],
        connectSrc: [
          "'self'",
          "'unsafe-inline'",
          'data:',
          'blob:',
          'https://*.stripe.com',
          'https://*.mapbox.com',
          'https://*.cloudflare.com/',
          'https://bundle.js:*',
          'ws://127.0.0.1:*/',
 
        ],
        upgradeInsecureRequests: [],
      },
    },
  })
);

if(process.env.NODE_ENV==='development'){
app.use(morgan('dev')) //middleware for logging req,err..
}

const limiter=rateLimiter({
    max:100,
    windowMs:60*60*1000,
    message:"too many request from this IP.Try again later"
})

app.use('/api',limiter);

//body parser,reading data from body into req.body
app.use(express.json()); //for post method -its a middleware
app.use(express.urlencoded({extended:true,limit:'10kb'}));//middleware to read data from form (in account page)
app.use(cookieParser()); //parses coookies


//data sanitization against Nosql query injection
app.use(mongoSanitize())

//CORS
app.use(cors());

app.options('*',cors())

//data sanitization against XSS
app.use(xss())

//prevent parameter pollution
app.use(hpp({
    whitelist:[
        'duration','ratingsAverage','ratingsQuantity','maxGroupSize','difficulty','price'
    ]
}))

app.use(compression())

//test middleware
app.use((req,res,next)=>{
    req.requestTime=new Date().toISOString();
    next();
})


//Route handlers

app.use('/',viewRouter);
app.use('/api/v1/tours',tourRouter); //Mounting a new router on a route
app.use('/api/v1/users',userRouter);
app.use('/api/v1/reviews',reviewRouter);
app.use('/api/v1/bookings',bookingRouter);


//middleware for handling routes without handler.
app.all('*',(req,res,next)=>{
    next(new AppError(`can't find ${req.originalUrl} on the server`,404));
})

app.use(globalErrorHandler)

module.exports=app;