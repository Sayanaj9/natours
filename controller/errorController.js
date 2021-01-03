const AppError=require('./../utils/appError');
const handleCastErrorDb=(err)=>{
    // console.log("err------------",err);
     const message=`Invalid ${err.path}:${err.value}`;
     return new AppError(message,400);
}

const handleDuplicateFieldDB=(err)=>{
    const value=err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
    const message=`duplicate value:${value} please use another`;
    return(new AppError(message,400))
}

const handleValidationError=(err)=>{
    const message=Object.values(err.errors).map(el=>el.message).join('. ')
    return(new AppError(message,400))
}

const sendErrorDev=(err,req,res)=>{
    //development- can leak all err messages
    if(req.originalUrl.startsWith('/api'))
    {
        res.status(err.statusCode).json({
            status: err.status,
            message:err.message,
            stack:err.stack,
            error:err
        })
    }else{ //in website.client cant see original error 
        res.status(err.statusCode).render('error',{
            title:'something went wrong',
            msg:err.message
        })
    }
   
}

const sendErrorProd=(err,req,res)=>{

    //api
    if(req.originalUrl.startsWith('/api'))
    {
    //operational error,error we already know will happen.Like mispelling..
    if(err.isOperational)
    {
        res.status(err.statusCode).json({
            status: err.status,
            message:err.message,
          
        })

    }
    //programming or other unknown error
    else{
        res.status(500).json({
            status: 'error',
            message:'something went wrong',
          
        })
    }
    }
    else{
        //rendered website
        if(err.isOperational)
        {
            res.status(err.statusCode).render('error', {
                title: 'Something went wrong!',
                msg: err.message
              });
    
        }
        //programming or other unknown error
        else{
            res.status(err.statusCode).render('error', {
                title: 'Something went wrong!',
                msg: 'Please try again later.'
              });
        }
    }
    
}

const handleJWTError=(err,res)=>{
        return (new AppError("invalid token,please login again",401));
}

const handleTokenExpiredError=(err,res)=>{
    return (new AppError("token expired.please login again",401))
}

module.exports=(err,req,res,next)=>{
   
     err.statusCode=err.statusCode||500;
    err.status=err.status||'error';
    if (process.env.NODE_ENV === 'development') {
             sendErrorDev(err,req,res)

   }
   else if(process.env.NODE_ENV === 'production ')
   {
    //    let error=err;
       let error={...err};
       error.name = err.name;
       error.message=err.message;
console.log(error);
       if(error.name==='CastError')
       {
            error=handleCastErrorDb(error);
        }
        if(error.code===11000)
        {
            error=handleDuplicateFieldDB(error);
        }

        if(error.name==="ValidationError")
        {
            error=handleValidationError(error);
        }

        if(error.name==="JsonWebTokenError")
        {
            error=handleJWTError(error);
        }
        if(error.name==="TokenExpiredError")
        {
            error=handleTokenExpiredError(error)
        }
     sendErrorProd(error,req,res)
        
   }
  

    
}