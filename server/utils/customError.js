export const errorHandler=(statuscode,message)=>{
    const error=new Error()
    error.statuscode=statuscode
    error.success=false
    error.message=message
    return error
}