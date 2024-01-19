import express from "express";
import mongoose from "mongoose";
import 'dotenv/config';
import authRouter from './routes/auth.route.js'

const app=express();
let PORT=process.env.PORT || 8080;

async function main(){
   await mongoose.connect(process.env.MONGO)
}

main()
.then((res)=>{
    console.log(`connected to db`)
})
.catch((err)=>console.log(err))

app.listen(PORT,()=>{
    console.log(`Server is working on port ${PORT}`);
})

app.use(express.json());



app.use("/api/auth" , authRouter)

