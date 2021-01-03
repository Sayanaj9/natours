const mongoose=require('mongoose');
const fs=require('fs');
const Tour=require('./../../models/tourModels');
const Review=require('./../../models/reviewModels');
const User=require('./../../models/userModel');

const dotenv=require('dotenv');
dotenv.config({path:'./config.env'}) //read variables in the env and save in nodejs runtime env varibales
const DB=process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);


//connection database with mongoose
mongoose.connect(DB,{
    //for knowing about deprecations.This returns a promise
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:true,
    useUnifiedTopology: true

}).then(con=>{
    console.log(con.connections);
    console.log("CONNECTED");
    
})

// const reviews=JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,'utf-8'));

const tours=JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,'utf-8'));
const users=JSON.parse(fs.readFileSync(`${__dirname}/users.json`,'utf-8'));
const reviews=JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,'utf-8'));


const importData=async()=>{
    try{
        await Review.create(reviews);
        await Tour.create(tours);
        await User.create(users,{validateBeforeSave:false});
        console.log(":successful");
    }
    catch(err){
        console.log(err);
    }
    process.exit()
}

const deleteData=async()=>{
    try{
        await Tour.deleteMany() ;
        await Review.deleteMany() ;
        await User.deleteMany() ;
        console.log(":successfully deleted");
    }
    catch(err){
        console.log(err);
    }
    process.exit()
}
if(process.argv[2]==='--import')
{
    importData()
   
}
else if(process.argv[2]==='--delete' )
{
    deleteData()
}
console.log("running",process.argv);
