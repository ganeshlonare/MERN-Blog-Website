import jwt from "jsonwebtoken";

export const verifyToken=async (req,res,next)=>{
    try {
        const {token}=await req.cookies 
        if(!token){
            return res.status(401).json({message:"Unauthorized"})
        }

        const userDetails=await jwt.verify(token,process.env.JWT_SECRET_KEY)
        req.user=userDetails

        next()
    } catch (error) {
        console.log("error in isUserLoggedIn")
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}