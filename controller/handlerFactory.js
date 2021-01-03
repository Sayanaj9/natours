const AppError = require('../utils/appError');
const catchAsync= require('../utils/catchAsync');
const APIFeatures= require('../utils/apiFeatures');



exports.deleteOne=Model=>
    catchAsync(async(req,res,next)=>{
        const doc=await Model.findByIdAndDelete(req.params.id);
        if(!doc)
        {
            return next(new AppError('no document found with this id',404));
        }
            res.status(204).json({
                status:'no content',
                data:null
            })  
})

exports.updateOne=Model=>catchAsync(async(req,res,next)=>{
    const doc=await Model.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        })
        if(!doc)
        {
            return next(new AppError('no document found with this id',404));
        }
          
     
        res.status(200).json({
            status:'success',
           
            data:{
                data:doc
            }
        })  
 
  
})

exports.createOne= (Model)=>catchAsync(async(req,res,next)=>{

    const doc=await Model.create(req.body);

    res.status(201).json({
        status:'success',
        data:{
            data:doc
        }
    })

})

exports.getOne=(Model,popOptions)=>catchAsync(async(req,res,next)=>{
    let query=await Model.findById(req.params.id)
    if(popOptions) query=query.populate(popOptions);
    const doc=await query;   

    //populate will populate the whole guide daata into the model
        // const Tours=await TourModel.findById(req.params.id).populate('guides');
        if(!doc){
            
            return next(new AppError('No tours with this id',404))
        }


        res.status(200).json({
            status:'success',
        
            data:{
                data:doc
            }
        })
    
   
})


exports.getAll=Model=>catchAsync(async(req,res,next)=>{
    //Execute query

    //to allow for nested GEt reviews on tour
    let filter={};
    if(req.params.tourid) filter={tour:req.params.tourid}

    const features=new APIFeatures(Model.find(filter),req.query).Filter().Sorting().LimitFields().Paginate()
    // const doc=await features.query.explain();
    const doc=await features.query;

  
    res.status(200).json({
        status:'success',
        result:doc.length,
        data:{
            data:doc
        }
    })


})