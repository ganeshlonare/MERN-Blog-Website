import jwt from "jsonwebtoken";

export const verifyToken=(req,res,next)=>{
    const token=req.cookies.access_token;

    if(!token) return res.status(401).json({ error : "No access token"});

    jwt.verify(token,process.env.JWT_SECRET_KEY, (err,user)=>{
        if(err) return res.status(403).json({ error : "Access token in Invalid"});

        req.user=user.id;
        next();
    })
}