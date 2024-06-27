import User from "../Schema/User.js";
import bcryptjs from 'bcryptjs';
import cloudinary from 'cloudinary'
import fs from 'fs/promises'

const cookieOptions={
    httpOnly:true,
    maxAge: 7 * 24 * 60 * 60 * 1000,//7 days
    secure:true,
}

//sign up
export const signUp=async(req,res,next)=>{
    try {
        const {fullname , email , password} = req.body
        
        if(!fullname || !email || !password){
            return res.status(401).json({
                success:false,
                message:"All the fields are required"
            })
        }

        const userExist=await User.findOne({"personal_info.email" :email})

        if(userExist){
            return res.status(401).json({
                success:false,
                message:"User already exist"
            })
        }

        const hashedPassword=await bcryptjs.hash(password,10)

        const user=await User.create({
            personal_info:{
                fullname,
                email,
                password:hashedPassword,
                username:email.split('@')[0],
                avatar:{
                    public_id:email,
                    secure_url:"https://static.vecteezy.com/system/resources/previews/002/318/271/non_2x/user-profile-icon-free-vector.jpg"
                },
            }
        })

        if(!user){
            return res.status(401).json({
                success:false,
                message:"error creating user"
            })
        }

        if(req.file){
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path,{
                    folder:'blogs',
                    hight:250,
                    width:250,
                    gravity:'faces',
                    crop:'fill'
                })

                if(result){
                    user.personal_info.avatar.public_id=result.public_id
                    user.personal_info.avatar.secure_url=result.secure_url
                    fs.rm(`uploads/${req.file.filename}`)
                }
            } catch (error) {
                console.log("error in uploading file")
                console.log(error.message)
                return res.status(401).json({
                    success:false,
                    message:"error uploading file"
                })
            }
        }

        await user.save()
        const token=await user.generateJwtToken()
        if(!token){
            return res.status(401).json({
                success:false,
                message:"error creating token"
            })
        }
        res.cookie('token' , token , cookieOptions)

        return res.status(201).json({
            success:true,
            message:"User created successfully",
            user
        })        
    } catch (error) {
        console.log("Error in sign up")
        console.log(error.message)
        return res.status(401).json({
            success:false,
            message:error.message
        })
    }
}

//sign in
export const signIn=async (req,res,next)=>{
    const {email , password} = req.body
    try {
        if(!email || !password){
            return res.status(401).json({
                success:false,
                message:"All the fields are required"
            })
        }

        const user= await User.findOne({"personal_info.email":email})
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }

        const isPasswordValid=await bcryptjs.compare(password , user.personal_info.password)
        if(!isPasswordValid){
            return res.status(401).json({
                success:false,
                message:"Invalid credentials , please try again with another one"
            })
        }

        const token=await user.generateJwtToken()
        if(!token){
            return res.status(401).json({
                success:false,
                message:"error creating token"
            })
        }
        res.cookie('token' , token , cookieOptions)

        return res.status(200).json({
            success:true,
            message:"User logged in successfully",
            user
        })
        
    } catch (error) {
        console.log("error in sign up")
        console.log(error.message)
        return res.json(500).json({
            success:false,
            message:error.message
        })
    }
};

//google
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

//logout
export const logout=async(req,res)=>{
    try {
        const cookie=req.cookies.token
        if (!cookie) {
            return res.status(401).json({
                success:false,
                message:"you are not logged in"
            })
        }

        res.clearCookie('token' , { httpOnly: true, secure: true, sameSite: 'strict' })

        return res.status(200).json({
            success:true,
            message:"logged out successfully"
        })
    } catch (error) {
        console.log("error in logging out")
        console.log(error.message)
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

//change password
export const changePassword=async (req,res)=>{
    const {id}=req.user
    const {currentPassword , newPassword} = req.body
    try {
        if(!currentPassword || !newPassword){
            return res.status(400).json({
                success:false,
                message:"please fill all the fields"
            })
        }

        await User.findById(id).then((user)=>{
            if(user.google_auth){
                return res.status(403).json({
                    success:false,
                    message:"you cant change your password because you logged in with google"
                })
            }
            bcryptjs.compare(currentPassword , user.personal_info.password , (err , result)=>{
                if(err){
                    return res.status(500).json({
                        success:false,
                        message:err.message
                    })
                }
                if(!result){
                    return res.status(400).json({
                        success:false,
                        message:"old password is incorrect"
                    })
                }

                bcryptjs.hash(newPassword , 10 , (err , hashedPassword)=>{
                    if(err){
                        return res.status(500).json({
                            success:false,
                            message:err.message
                        })
                    }
                    user.personal_info.password=hashedPassword
                    user.save()
                    return res.status(200).json({
                        success:true,
                        message:"password changed successfully",
                        user
                    })
                })
            })
        }).catch((error)=>{
            return res.status(500).json({
                success:false,
                message:error.message
            })
        })
        
    } catch (error) {
        console.log("error in changing password")
        console.log(error.message)
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}