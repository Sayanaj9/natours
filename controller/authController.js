const {promisify}=require('util');
const crypto=require('crypto');
const Email=require('./../utils/email');
const User=require('../models/userModel');
const jwt=require('jsonwebtoken');
const catchAsync= require('../utils/catchAsync');
const AppError=require('./../utils/appError');
const sendEmail=require('./../utils/email');
const { collection } = require('../models/userModel');

const signToken=id=>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES
    })
}

const createAndSendToken=(user,statusCode,res)=>{
    const token=signToken(user._id);
    const cookieOptions={
        expires:new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES*24*60*60*1000),
        httpOnly:true //so that browser cant modify it in anyway.to avoid cross site scripting attack
    
    }

    if(process.env.NODE_ENV==="production")
    {
        cookieOptions.secure=true;
    }
    res.cookie('jwt',token,cookieOptions);
    user.password=undefined;
    return res.status(statusCode).json({
        status:"success",
        token, 
        data:{
            user
        }
       
    })
}

exports.signup=catchAsync(async(req,res,next)=>{
    const newUser=await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        passwordConfirm:req.body.passwordConfirm,
        passwordChangedAt:req.body.passwordChangedAt,
        role:req.body.role
    });

    const url=`${req.protocol}://${req.get('host')}/me`;
    console.log("url",url);
    await new Email(newUser,url).sendWelcome()

    createAndSendToken(newUser,201,res)
    
})

exports.login=catchAsync(async(req,res,next)=>{
    const {email,password}=req.body; 
    if(!email || !password)
    {
        return next(new AppError('please provide email & password',400))
    }
    const user=await User.findOne({email}).select('+password');

    if(!user || !(await user.correctPassword(password,user.password)))
    {
        return next(new AppError('incorrect email or password',401))
    }
    createAndSendToken(user,200,res)

    
   
})

exports.logout=(req,res)=>{
    res.cookie('jwt','logged out',{
        expires:new Date(Date.now() + 10*1000),
        httpOnly:true
    });
    res.status(200).json({status:'success'})
}


//to check if user is still logged in when he routes to another service
exports.protect=catchAsync(async(req,res,next)=>{
    //1)getting token & checking if its there
    let token;
        if(req.headers.authorization&&req.headers.authorization.startsWith('Bearer'))
        {
             token=req.headers.authorization.split(' ')[1]
        }
        else if(req.cookies.jwt)
        {
            token=req.cookies.jwt;
        }

        if(!token)
        {
            return next(new AppError('you are not logged in! Please log in to get access',401))
        }
    //2)verification of token
    const decoded=await promisify(jwt.verify)(token,process.env.JWT_SECRET);

    //3)check if user still exists --if user had changed password after the token is issued or he deleted his acc after signup

    const freshUser=await User.findById(decoded.id);
    if(!freshUser)
    {  
            //  return next(new AppError('user no longer exists',401))
            return next(new AppError('user no longer exists',401))

    }

    //4)check if user changed pwd after issueing JWT token

    if(freshUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError('User recently changed password.Please log in again',401))
    }

    req.user=freshUser;
    res.locals.user=freshUser; 
    next()// call this since,user requested route is to be run after this 
})


//only for rendered pages

exports.isLoggedIn=catchAsync(async(req,res,next)=>{
    if(req.cookies.jwt)
        {
            try{
            //1)verifies cookie
            const decoded=await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET);

            //2)check if user still exists --if user had changed password after the token is issued or he deleted his acc after signup

             const freshUser=await User.findById(decoded.id);
            if(!freshUser)
            {  
              
                return next()

            }

             //3)check if user changed pwd after issueing JWT token

            if(freshUser.changedPasswordAfter(decoded.iat)){
                return next()
            }

            //there is a logged in user
            res.locals.user=freshUser; //pug template hav access to this variable
           
            return next()
        }
        catch(err)
        {
            return next();
        }
}
next()
})




exports.restrictTo=(...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role))
        {
            return next(new AppError('You dont have permission to perform this action',403));
        }
        next()
    }
    
}

exports.forgotPassword=catchAsync(async(req,res,next)=>{
//1.get user based on posted email


const user=await User.findOne({email:req.body.email});

if(!user){
    
    return next(new AppError('no user found',404));

}
//2.generate random reset token

    const resetToken=await user.createPasswordResetToken();
    await user.save({validateBeforeSave:false})
//3)send it to user's email
    const resetURL=`${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message=`Forgot your passwprd? Please send a request with the password and passwordconfirm to: ${resetURL}`;

    try{
        // await sendEmail({
        //     email:user.email,
        //     subject:'Your password reset Link(expires in 10 min)',
        //     message
    
        // })
        await new Email(user,resetURL).sendPasswordReset();
    
        res.status(200).json({
                status:"success",
                message:"token send to mail"
        })
    }
    catch(err)
    {
            user.passwordResetToken=undefined;
            user.passwordResetExpires=undefined;// this steps just modify the doc but its not saved
            await user.save({validateBeforeSave:false}) // to save it to the db. save() is used 
             return next(new AppError('there was an error occurred while sending the mail',500))
            // return next(err);
    }
   

})
exports.resetPassword=catchAsync(async(req,res,next)=>{
    //1)get user based on the token
            const hashedToken=crypto.createHash('sha256').update(req.params.token).digest('hex');
            const user=await User.findOne({passwordResetToken:hashedToken,
                passwordResetExpires:{$gt:Date.now()}
            });
            
            
    //2)if token has not expired,& there is new user, set the new password
    if(!user)
    {
        return next(new AppError('Token is invalid or has expired',400));
        

    }
    user.password=req.body.password;
    user.passwordConfirm=req.body.passwordConfirm;
    user.passwordResetToken=undefined;
    user.passwordResetExpires=undefined;
 
    await user.save();// we want the validator here to check if the pwd is same

    //3)update changedPasswordAt property for the user
    //4)log the user in.send JWT
    createAndSendToken(user,200,res)
    
//    req.user=user;

})

exports.updatePassword=catchAsync(async (req,res,next)=>{
    //1)get user from collection
    const user=await User.findById(req.user._id).select('+password');
 
   //2)check if posted current password is correct
   if(!await user.correctPassword(req.body.currentPassword,user.password))
   {    
    return next(new AppError('Current password is wrong',401))
    }
    //findByIdAndUpdate wont save the password.Because it wont run the validation .(mod137)
   user.password=req.body.password;
   user.passwordConfirm=req.body.passwordConfirm;
   await user.save();

   const token=signToken(user._id);

  
   return res.status(200).json({
        status:"success",
        token, 
        data:{
            user
        }
       
    })
// next()
  

})
