import User from "../Schema/User.js";
import bcryptjs from 'bcryptjs';
import jwt  from "jsonwebtoken";

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

const formDataToSend=(user)=>{
    const access_token=jwt.sign({id:user._id},process.env.JWT_SECRET_KEY);
    return {
        access_token,
        profile_img:user.personal_info.profile_img,
        fullname:user.personal_info.fullname,
        username:user.personal_info.username
    }
}

export const signUp=async (req,res)=>{
    const {fullname , email , password}=req.body;
    
    const hashPassword=bcryptjs.hashSync(password , 10);

    if(fullname.length<3) {
        return res.status(403).json({
            success:false,
            error:"fullname must be more than 3 characters"
        })
    }

    if(!email.length) {
        return res.status(403).json({
            error:"Enter your email"
        })
    }

    if(!emailRegex.test(email)) {
        return res.status(403).json({
            error:"Email is invalid"
        })
    }

    if(!passwordRegex.test(password)){
        return res.status(403).json({
            error:"Password should be 6 to 20 characters long with a Numeric , 1 lowercase and 1 uppercase letter"
        })
    }

    let username=email.split("@")[0];

    const newUser=new User({
        personal_info:{fullname , email , password:hashPassword,username}
    })
    try {
       await newUser.save();
       res.status(201).json(formDataToSend(newUser));
    } catch (error) {
        if(error.code == 11000) {
            return res.status(500).json({
                success:false,
                error:"Email is already exists!"
            })
        }
       return res.status(404).json(error.message);
    }
}


export const signIn=async (req,res,next)=>{
    const {email,password}=req.body;
    try {        
    const validUser=await User.findOne({"personal_info.email" : email})
    if(!validUser) return res.status(404).json(
        {
            success:false,
            error:"User not found"
        }
        );

    const validPassword=bcryptjs.compareSync(password,validUser.personal_info.password);
    if(!validPassword) return res.status(404).json({
        success:false,
        error:"Invalid password"
    });

    res.status(200).json(formDataToSend(validUser));

    } catch (error) {
        return res.status(404).json(error)
    }
};

export const google=async (req,res)=>{
    try {
        const user=await User.findOne({"personal_info.email" : req.body.email})
        if (user) {
            res.status(200).json(formDataToSend(user));
        } else {
            const generatedPassword=Math.random().toString(36).slice(-8)+Math.random().toString(36).slice(-8);
            const hashedPassword=bcryptjs.hashSync(generatedPassword,10);
            let username=req.body.email.split("@")[0];
            const newUser=new User({personal_info:{fullname:req.body.fullname,email:req.body.email,password:hashedPassword,username : username}})
            await newUser.save();
            res.status(201).json(formDataToSend(newUser));
        }
    } catch (error) {
        return res.status(500).json({
            success:false,
            error:"could not able to sign in with google try another one"
        })
    }
}