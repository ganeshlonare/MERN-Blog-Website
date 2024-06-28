import User from "../Schema/User.js";
import bcryptjs from 'bcryptjs'
import cloudinary from 'cloudinary'
import fs from 'fs/promises'
import { URL } from "url";
import Notification from "../Schema/Notification.js";

//get-profile
export const getProfile=async (req,res)=>{
    try {
        const {username}=req.body
        if(!username){
            return res.status(400).json({
                success:false,
                message:"username is required"
            })
        }
        const user=await User.findOne({
            "personal_info.username":username
        })
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }
        return res.status(200).json({
            success:true,
            message:"User Profile",
            user
        })
    } catch (error) {
        console.log("Error in getting user")
        console.log(error.message)
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

//Search User
export const searchUser=async (req,res,next)=>{
    try {
        const {query} = req.body

        const users =await User.find({"personal_info.username" : new RegExp(query , 'i')})
        .select("personal_info.fullname personal_info.profile_img personal_info.username -_id")
        .limit(50)
        .then((user)=>{
            return res.status(200).json({user})
        })
        .catch((err)=>{
            return res.status(404).json({error:err.message})
        })
    } catch (error) {
        console.log("error in searching user")
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

//update profile image
export const updateProfileImage=async(req,res)=>{
    const {id}=req.user
    try {
        if(!req.file){
            return res.status(400).json({
                success:false,
                message:"please select an image"
            })
        }
        const user=await User.findById(id)
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
        return res.status(200).json({
            success:true,
            message:"profile image updated successfully",
            user
        })
    } catch (error) {
        console.log("error in uploading file")
        console.log(error.message)
        return res.status(401).json({
            success:false,
            message:"error uploading file"
        })
    }
}

//update user
export const updateUser=async(req,res,next)=>{
    const{username,bio,social_links}=req.body
    let socialLinksArr=Object.keys(social_links)
    try{
        for(let i=0;i<socialLinksArr.length;i++){
            if(social_links[socialLinksArr[i]].length){
                let url=new URL(social_links[socialLinksArr[i]])
                console.log(url)
                let hostname=url.hostname
                if(!hostname.includes(`${socialLinksArr[i]}.com`)&&socialLinksArr[i]!='website'){
                    return next(errorhandler(400,`${socialLinksArr[i]} Invalid social link`))
                }
            }
        }
    }
    catch(error){
        console.log(error)
        return next(errorhandler(400,error.message))
    }
    let updateObj={
        'personal_info.username':username,
        'personal_info.bio':bio,
         social_links
    }
    User.findOneAndUpdate({_id:req.user.id},updateObj,{
         runValidators:true
    })
    .then((user)=>{
        return res.status(200).json({
            success:true,
            message:"Profile updated successfully",
            user
        })

    })
}
