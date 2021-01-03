const mongoose=require('mongoose');
const dotenv=require('dotenv');

//when we log undefined variable eg:console.log(x)
process.on('uncaughtException',err=>{
    console.log('UNCAUGHT EXCEPTION',err);
   
        process.exit(1)
  
})
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
    console.log("CONNECTED");
    
})


const app=require('./app');
//SERVER
const port=3000;
const server=app.listen(port,()=>{
    console.log('Welcome to my API.App is running in the port');
})


//handling "UNHANDLED REJECTIONS".It can be server not connecting or any otehr error we failed to handle in the code

process.on('unhandledRejection',err=>{
    //give server time to close the server
    server.close(()=>{
        console.log("server is shutingdown");
        process.exit(1)
    })
})

