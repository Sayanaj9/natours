module.exports=fn=>{
    return (req,res,next)=>{
        fn(req,res,next).catch(next);
    }

}

//used instead of try catch block.