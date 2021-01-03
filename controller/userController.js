const catchAsync= require('../utils/catchAsync');
const multer=require('multer');
const sharp=require('sharp');
const User=require('../models/userModel');
const AppError = require('../utils/appError');
const factory=require('./handlerFactory');

// const multerStorage=multer.diskStorage({
//     destination:(req,file,cb)=>{
//         //cb for callback
//         cb(null,'public/img/users');
//     },

//     filename:(req,file,cb)=>{
//         const extension=file.mimetype.split('/')[1];
//         cb(null,`user-${req.user.id}-${Date.now()}.${extension}`);
//     }
// })

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

exports.uploadUserPhoto=upload.single('photo');

exports.resizeUserPhoto= catchAsync(async(req,res,next)=>{
        if(!req.file) return next();    

            req.file.filename=`user-${req.user.id}-${Date.now()}.jpeg`;

            await sharp(req.file.buffer)
            .resize(500,500)
            .toFormat('jpeg')
            .jpeg({quality:90})
            .toFile(`public/img/users/${req.file.filename}`);

        next();
})


const filterObj=(obj,...allowedFields)=>{
    const newObj={};
    Object.keys(obj).forEach(el=>{
        if(allowedFields.includes(el)) newObj[el]=obj[el];

    })
    return newObj;
}

exports.getMe=(req,res,next)=>{
    req.params.id=req.user.id;
    next()
}


exports.deleteMe=catchAsync(async(req,res,next)=>{
    await User.findByIdAndUpdate(req.user.id,{active:false})

    res.status(204).json({
        status:"success",
        data:null
    })
}
)



exports.updateMe=catchAsync(async(req,res,next)=>{
    console.log(req.file);
    //1)create err if user posts with password & passwordConfirm
    if(req.body.password||req.body.passwordConfirm)
    {
        return next(new AppError('this route is not for password update',400))
    }

    //filetered unwanted field name that is not supposed to be updated 
    const filteredBody=filterObj(req.body,'name','email');
    if(req.file) filteredBody.photo=req.file.filename;

    //using findbyupdate since it's not sensitive data
    const updatedUser=await User.findByIdAndUpdate(req.user.id,filteredBody,{
        new:true,
        runValidators:true
    })

    res.status(200).json({
        status:'success',
       data:{
           user:updatedUser
       }
        
    })
})

exports.createUser=(req,res)=>{
    return res.status(500).json({
        status:'Internal server error',
        message:'This route is not implemented'
    })
}
exports.getAllUsers=factory.getAll(User);
exports.getUsers=factory.getOne(User);
exports.updateUser=factory.updateOne(User)
exports.deleteUser=factory.deleteOne(User);