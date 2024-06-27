import { nanoid } from "nanoid";
import Blog from "../Schema/Blog.js";
import User from "../Schema/User.js";
import bcryptjs from 'bcryptjs'
import cloudinary from 'cloudinary'
import fs from 'fs/promises'
import { URL } from "url";

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

//create blog
export const createBlog=(req,res,next)=>{
    const authorId=req.user.id;

    let {title , des , banner , tags , content , draft , id}=req.body;

    if(!title){
        return res.status(403).json({error:"You must provide a title"});
    }

    if(!draft){
        if(!des.length || des.length > 200){
            return res.status(403).json({error:"You must provide blog description under 200 words"});
        }
        if(!banner){
            return res.status(403).json({error:"You must provide a blog banner"});
        }
        if(!content){
            return res.status(403).json({error:"There must be some blog content to publish it"});
        }
        if(!tags.length || tags.length > 10){
            return res.status(403).json({error:"Provide tags in order to publish the blog ,  Maximum 10"});
        }
    }

    tags=tags.map(tag=>tag.toLowerCase());

    let blog_id=id||title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, "-").trim() + nanoid();

    if(id){
        Blog.findOneAndUpdate({blog_id},{title,des,banner,tags,content ,draft:draft?draft:false})
        .then(()=>{
            return res.status(200).json({
                success:true,
                message:"Blog updated successfully",
                id:blog_id
            });
        }).catch((err)=>{
            console.log(err.message);
            return res.status(500).json({
                success:false,
                message:err.message
            })
        })
    }else{let blog=new Blog({
        title,
        des,
        banner,
        content,
        tags,
        author:authorId,
        blog_id,
        draft:Boolean(draft)
    })

    blog.save().then(blog=>{
        let incrementVal=draft ? 0 : 1;

        User.findOneAndUpdate({_id:authorId} , {$inc :{"account_info.total_posts":incrementVal} , $push:{"blog":blog_id}})
        .then(user=>{
            return res.status(200).json({id:blog.blog_id})
        })
        .catch(err=>{
            console.log(err)
            return res.status(500).json({error:"Failed to update total posts number"})
        })
    }).catch(err=>{
        console.log(err)
        return res.status(500).json({error:err.message||'Internal server error'})
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

//get blog
export const getBlog=async(req,res)=>{
    try {
        const {blog_id}=req.body
        let incrementVal=1;
        Blog.findOneAndUpdate({"blog_id":blog_id},{
            $inc:{"activity.total_reads":incrementVal}
        })
        .select("title banner des content activity blog_id publishedAt tags`")
        .populate("author","personal_info.fullname personal_info.username personal_info.avatar")
        .then((blog)=>{
            User.findOneAndUpdate({"personal_info.username":blog.author.personal_info.username},{
                $inc:{"account_info.total_reads":incrementVal}
            })
            .catch((error)=>{
                return res.status(500).json({
                    success:false,
                    message:error.message
                })
            })
            return res.status(200).json({blog})
        }).catch((error)=>{
            return res.status(404).json({error:error.message})
        })
    } catch (error) {
        console.log("Error in getting blog")
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