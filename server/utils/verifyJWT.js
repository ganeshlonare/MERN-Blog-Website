import jwt from "jsonwebtoken";

export const verifyToken=(req,res,next)=>{
    // const token=req.cookies.access_token;
    const token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZWFlODMwYzAxMjZmNzFkYTBjOWViOSIsImlhdCI6MTcwOTg5Mzc3Mn0.cVp94bCZ8yIM5BQjJSV3JrVuLIaPrEyQzf_GoThHp6c"

    if(!token) return res.status(401).json({ error : "No access token"});

    jwt.verify(token,process.env.JWT_SECRET, (err,user)=>{
        if(err) return res.status(403).json({ error : "Access token in Invalid"});

        req.user=user;
        next();
    })
}