const multer=require('multer');
const sharp=require('sharp');
const catchAsync= require('../utils/catchAsync');
const factory=require('./handlerFactory');
const TourModel=require('../models/tourModels');
const AppError = require('../utils/appError');

const multerStorage=multer.memoryStorage() //if image processing is done,its better to store in mmry than diskstorage.stored as 'buffer'

// to check if uploaded one is an image
const multerFilter=(req,file,cb)=>{
    if(file.mimetype.startsWith('image'))
    {
        cb(null,true);
    }else{
        cb(new AppError('Not ana image',400),false)
    }
}

const upload=multer({storage:multerStorage,fileFilter:multerFilter});

exports.uploadTourImages=upload.fields([
  {name:'imageCover',maxCount:1},{name:'images',maxCount:3}
])

exports.resizeTourImages=catchAsync(async(req,res,next)=>{

  if(!req.files.imageCover||!req.files.images) return next();
  //cover image
  req.body.imageCover=`tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
            .resize(2000,1333)
            .toFormat('jpeg')
            .jpeg({quality:90})
            .toFile(`public/img/tours/${req.body.imageCover}`);


    req.body.images=[];

    await Promise.all(req.files.images.map(async(file,i)=>{
      const filename=`tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`;

      await sharp(file.buffer)
      .resize(2000,1333)
      .toFormat('jpeg')
      .jpeg({quality:90})
      .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    })
    )

        next();
})

//prefilling datas
exports.aliasTopTours=(req,res,next)=>{
    req.query.limit='5';
    req.query.sort='-ratingsAverage,price';
    req.query.fields='name,price,ratingsAverage,summary,difficulty';
    next()
}

exports.monthlyPlan=catchAsync(async(req,res,next)=>{
    
        const year=req.params.year*1;
        const plan=await TourModel.aggregate([
            {
                $unwind:'$startDates'
            },
            {
                $match:{startDates:{$gte:new Date(`${year}-01-01`),$lte:new Date(`${year}-12-01`)}}
            },
            {
                $group:{
                    _id:{$month:'$startDates'},
                    numTourStarts:{$sum:1},
                    tours:{$push:'$name'}
                }
            },
           
        ])
        res.status(200).json({
            status:'success',
        
            data:{
                plan
            }
        })

    
    
})

exports.getTours=factory.getOne(TourModel,{path:'reviews'});



exports.getTourstats=catchAsync(async(req,res,next)=>{
    
        const stats=await TourModel.aggregate([
            {
                $match:{ratingsAverage:{$gte:4.7}}
            },
            {
                $group:{
                    _id:'$difficulty',
                    numTours:{$sum:1},
                    avgRating:{$avg:'$ratingsAverage'},
                    avgPrice:{$avg:'$price'},
                    minPrice:{$min:'$price'},
                    maxPrice:{$max:'$price'}
                }
            },
            {
                $sort:{numTours:1}
            }
        ])
        res.status(200).json({
            status:'success',
            results:stats.length,
            data:{
                stats
            }
        })
    
 

})

exports.getAllTours=factory.getAll(TourModel)

// catchAsync(async(req,res,next)=>{
//         //Execute query

//         const features=new APIFeatures(TourModel.find(),req.query).Filter().Sorting().LimitFields().Paginate()
//         const tours=await features.query;
      
//         res.status(200).json({
//             status:'success',
//             result:tours.length,
//             data:{
//                 tours
//             }
//         })
    
  
// })



exports.createTour=factory.createOne(TourModel);
   
exports.updateTour=factory.updateOne(TourModel);

exports.deleteTour=factory.deleteOne(TourModel);


exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
  
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  
    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitutr and longitude in the format lat,lng.',
          400
        )
      );
    }
  
    const tours = await Tour.find({
      startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });
  
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        data: tours
      }
    });
  });
 
  
  exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
  
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  
    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitutr and longitude in the format lat,lng.',
          400
        )
      );
    }
  
    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1]
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier
        }
      },
      {
        $project: {
          distance: 1,
          name: 1
        }
      }
    ]);
  
    res.status(200).json({
      status: 'success',
      data: {
        data: distances
      }
    });
  });


    // const newid=tours[tours.length-1].id;
    // const newTour=Object.assign({id:newid},req.body);
    // tours.push(newTour);
    // fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`,JSON.stringify(tours),err=>{
        // res.status(202).json({
        //     status:'success',
            // data:{
            //     tour:newTour
            // }
        // })
    // })
  



// exports.deleteTour=catchAsync(async(req,res,next)=>{
//      const Tours=await TourModel.findByIdAndDelete(req.params.id)
     
//         res.status(204).json({
//             status:'no content',
           
//             data:null
            
//         })  
    
   
// })

// const tours=JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

// exports.checkId=(req,res,next,val)=>{
//     console.log(`tour id is :${val}`);
//     const id=req.params.id*1;
//     if(id>tours.length)
//     {
//         return res.status(404).json({
//             status:'fail',
//             message:'Invalid ID'
//         })
//     }
//     next();
// }

// exports.checkBody=(req,res,next)=>{
    // console.log("checkbody",req.body);
    // if(!req.body.name || !req.body.price)
    // {
            // return res.status(400).json({
            //     status:'fail',
            //     message:'invalid request'
            // })
    // }
//     next()
// }
     //Filtering
    //     const queryObj={...req.query};
    //     const excludingObj=['page','sort','limit','fields']
    //      excludingObj.forEach(el=>delete queryObj[el]) 
        
    //      //Advanced filtering
    //     let queryString=JSON.stringify(queryObj);
    //     queryString=queryString.replace(/\b(gte|gt|lte|lt)\b/g,match=>`$${match}`);
       
    //    let Tours=TourModel.find(JSON.parse(queryString));


        //Sorting
        // if(req.query.sort)
        // {
        //       const sortBy=req.query.sort.split(',').join(' ');
        //     Tours=Tours.sort(sortBy)
        // }
        // else{
        //     Tours=Tours.sort('-createdAt')
        // }

        //limiting fields

        // if(req.query.fields)
        // {
            
        //     const fields=req.query.fields.split(',').join(' ');
        //     Tours=Tours.select(fields)
        // }
        // else{
        //     Tours=Tours.select('-__v'); //excluding _V
        // }

        //Pagination

        
            // const page=req.query.page*1||1;
            // const limit=req.query.limit*1||100;
            // const skip=(page-1)*limit
            // Tours=Tours.skip(skip).limit(limit)

            // if(req.query.page)
            // {
            //     const numTours=await TourModel.countDocuments();
            //      if(skip>=numTours)
            //     {
            //        throw new Error("cant do this")
            //     }

            // }