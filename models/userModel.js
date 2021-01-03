const mongoose=require('mongoose');
const crypto=require('crypto');
const bcrypt=require('bcryptjs');
const validator=require('validator');
const userSchema=new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'please provide a name'],
    },
    email:{
        type:String,
        required: [true, 'please provide email'],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail,'please provide email']
    },
    photo:{type:String,default:'default.jpg'},
    role:{
        type:String,
        enum:['user','guide','lead-guide','admin'],
        default:'user'
    },
    password:{
             type:String,
             required: [true, 'please provide password'],
             unique: true,
             minlength:8,
             select:false
           

    },
    passwordConfirm:{
        type:String,
        required: [true, 'please confirm your password'],
        validate:{
            //this only works on create & save
            validator:function(el){
                return (el === this.password);
            },
            message:'passwords are not same'

        }
    },
    active:{
        type:Boolean,
        default:true,
        select:false
    },
    passwordResetToken:String,
    passwordResetExpires:Date,
    passwordChangedAt:Date

})
//bcrypt.hsah will hash asynchronously
userSchema.pre('save',async function(next){

    // to avaoid encrypting each time when other info's are updated
    if(!this.isModified('password')) return next();
    //12 is the cost.It rep the how much intensive the cpu process will be.The more it is the more time it take to hash&the better it is encrypted
    this.password=await bcrypt.hash(this.password,12);

    //to not save them into the database.they ara only needed for checking
    this.passwordConfirm=undefined;
    next()
    

})

userSchema.pre('save',function(next){
    if(!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt=Date.now()-1000;
    next()
})


userSchema.pre(/^find/,function(next){
    this.find({active:{$ne:false}});
    next();
})

userSchema.methods.correctPassword=async function (candidatePassword,userPassword){
    console.log("here");
   return await bcrypt.compare(candidatePassword,userPassword);
}


userSchema.methods.changedPasswordAfter=function(JWTTimestamp)
{
    if(this.passwordChangedAt)
    {
        const changedTimestamp=parseInt(this.passwordChangedAt.getTime()/1000);
        return JWTTimestamp <changedTimestamp; //to know if password is changed after issuing token or not

    }
    return false
}
// its convention taht model starts with caps-lock


userSchema.methods.createPasswordResetToken=function()
{
    const resetToken=crypto.randomBytes(32).toString('hex');
    this.passwordResetToken=crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires=Date.now() + 10 * 60 *1000;
    return resetToken;
}


const User=mongoose.model('User',userSchema);

module.exports=User;