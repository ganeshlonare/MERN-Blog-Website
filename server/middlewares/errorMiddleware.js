const errorMiddleware=(err,req,res,next)=>{
    err.message=err.message||"Something went wrong"
    err.statuscode=err.statuscode||500
     return res.status(err.statuscode).json({
        success:false,
        status:err.statuscode,
        message:err.message,
    })
}
export default errorMiddleware