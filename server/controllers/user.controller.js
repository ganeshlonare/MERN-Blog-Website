import { nanoid } from "nanoid";
import Blog from "../Schema/Blog.js";
import User from "../Schema/User.js";
import bcryptjs from 'bcryptjs'
import cloudinary from 'cloudinary'
import fs from 'fs/promises'
import { URL } from "url";
import Notification from "../Schema/Notification.js";
import Comment from "../Schema/Comment.js";

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

//update user blog
export const updateBlog=async(req,res)=>{
    const {blog_id}=req.body
    try {
        const blog=await Blog.findOneAndUpdate({blog_id},{$set:req.body},{runValidators:true})
        blog.save()
        return res.status(200).json({
            success:true,
            message:"Blog updated successfully",
            blog
        })
    } catch (error) {
        console.log('error in updating blog')
        console.log(error.message)
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

//new notifications
export const newNotifications=async(req,res)=>{
    const {id} = req.user
    try {
        await Notification.exists({notification_for:id , seen:false , user:{$ne:id}})
        .then((notifications)=>{
            if(notifications){
            return res.status(200).json({
                success:true,
                message:"New notifications available",
                new_notification_available:true
            })
        }else{
            return res.status(200).json({
                success:true,
                message:"No notifications found",
                new_notification_available:false
            })
        }
        }).catch((error)=>{
            console.log('error in getting notifications')
            console.log(error.message)
        })
    } catch (error) {
        console.log('error in getting users notifications')
        console.log(error.message)
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

//notifications
export const notifications=async(req,res)=>{
    const {id}=req.user
    const {page , filter , deletedDocCount}=req.body
    try {
        let findQuery={
            notification_for:id,
            seen:false,
            user:{$ne:id}
        }

        if(filter!=='all'){
            findQuery.type=filter
        }
        const maxLimit=10
        const skip=(page-1)*maxLimit
        if(deletedDocCount){
            skip-=deletedDocCount
        }
        Notification.find({findQuery})
        .skip(skip)
        .limit(maxLimit)
        .sort({createdAt:-1})
        .select("createdAt seen reply type")
        .populate("blog","title blog_id")
        .populate("user","personal_info.username personal_info.fullname personal_info.avatar.secure_url")
        .populate("comment","comment")
        .populate("reply","comment")
        .populate("replied_on_comment","comment")
        .then((notifications)=>{
            Notification.updateMany(findQuery,{seen:true})
            .skip(skip)
            .limit(maxLimit)
            .then(()=>{console.log('Notifications seen')})
            return res.status(200).json({
                success:true,
                message:"Notifications fetched successfully",
                notifications
            })
        }).catch((error)=>{
            console.log('error in getting notifications')
            console.log(error.message)
            return res.status(500).json({
                success:false,
                message:error.message
            })
        })
    } catch (error) {
        console.log('error in getting notifications')
        console.log(error.message)
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

//notification count
export const notificationsCount=async(req,res)=>{
    const {id}=req.user
    const {filter}=req.body
    try {
        let findQuery={
            notification_for:id,
            user:{$ne:id}
        }
        if(filter!=='all'){
            findQuery.type=filter
        }
        Notification.countDocuments(findQuery)
        .then((result)=>{
            return res.status(200).json({
                success:true,
                message:"Notification count fetched successfully",
                totalDocs:result
            })
        }).catch( (error)=> {
            console.log("error in counting notifications")
            console.log(error.message)
            return res.status(500).json({
                success:false,
                message:error.message
            })
        })
    } catch (error) {
        console.log("error in counting notifications")
        console.log(error.message)
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

//get user blogs
export const getUserBlogs=(req,res)=>{  
    const {id}=req.user
    const {page , draft , deletedDocCount , query} = req.body
    try {
        const maxLimit=5
        let skip=(page-1)*maxLimit
        if(deletedDocCount){
            skip-=deletedDocCount
        }
        Blog.find({author:id , draft , title:new RegExp(query, 'i') })
        .skip(skip)
        .limit(maxLimit)
        .select("title banner des publishedAt draft blog_id activity -_id")
        .sort({"publishedAt":-1})
        .then((blogs)=>{
            return res.status(200).json({
                success:true,
                message:"Blogs fetched successfully",
                blogs:blogs
            })
        }).catch((error)=>{
            console.log('error in getting users blogs')
            console.log(error.message)
            return res.status(500).json({
                success:false,
                message:error.message
            })
        })
    } catch (error) {
        console.log('error in getting users blogs')
        console.log(error.message)
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

//get user blogs count
export const getUserBlogsCount=(req,res)=>{
    const {id}=req.user
    const {draft , query}=req.body
    try {
        Blog.countDocuments({draft , author:id , title:new RegExp(query , 'i')})
        .then((count)=>{
            return res.status(200).json({
                success:true,
                message:"Blogs count fetched successfully",
                totalDocs:count
            })
        })
    } catch (error) {
        console.log('error in getting users blogs')
        console.log(error.message)
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

//delete blog
export const deleteBlog=async (req,res)=>{
    const {id}=req.user
    const {blog_id} =req.body
    console.log(blog_id)
    try {
        await Blog.findOneAndDelete({blog_id})
        .then((blog)=>{
            Notification.deleteMany({blog:blog._id}).then((result)=>{
                return res.status(200).json({
                    success:true,
                    message:"notifications deleted"
                })
            })
            Comment.deleteMany({blog_id:blog._id}).then(()=>{
                return res.status(200).json({
                    success:true,
                    message:"comments successfully"
                })
            })
            User.findByIdAndDelete(is,{
                $pull:{blogs:blog._id},
                $inc:{"account_info.total_posts":-1}
            }).then(()=>{
                return res.status(200).json({
                    success:true,
                    message:"blog deleted successfully"
                })
            })
        return res.status(200).json({
            success:true,
            message:"blog deleted successfully"
        })
        }).catch((error)=>{
            console.log('error in deleting blog')
            console.log(error.message)
            return res.status(500).json({
                success:false,
                message:error.message
            })
        })
    } catch (error) {
        console.log('error in deleting blog')
        console.log(error.message)
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}