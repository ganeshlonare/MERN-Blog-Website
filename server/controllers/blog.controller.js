import Blog from "../Schema/Blog.js"
import Notification from "../Schema/Notification.js";
import { errorHandler } from "../utils/customError.js";

//latest blogs
export const latestBlogs = (req,res , next)=>{
    const maxLimit =5;
    try {
        Blog.find({draft:false})
        .populate("author" , "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .sort({"publishedAt" : -1})
        .select("blog_id title des banner activity tags publishedAt -_id")
        .limit(maxLimit)
        .then(blogs=>{
            return res.status(200).json({blogs })
        }).catch(err=>{
        return res.status(500).json({error:err.message})
    })
    } catch (error) {
        console.log("Error getting latest blogs")
        console.log(error.message)
        next(errorHandler(500,error.message))
    }
}

//trending blogs
export const trendingBlogs=async(req,res,next)=>{
    const maxLimit=5
    try {
        Blog.find({draft:false})
        .populate("author" , "personal_info.profile_img personal_info.username personal_info.fullname -_id")
        .sort({"activity.total_reads" : -1 , "activity.likes":-1 , "publishedAt":-1})
        .select("blog_id title publishedAt -_id")
        .limit(maxLimit)
        .then(blogs=>{
            return res.status(200).json({blogs})
        }).catch(err=>{
        return res.status(500).json({error:err.message})
        })
    } catch (error) {
        console.log("Error getting trending blogs")
        console.log(error.message)
        next(errorHandler(500,error.message))
    }
}

//search blogs
export const searchBlogs=async (req,res,next)=>{
    const {tag , query , page}=req.body
    console.log(tag)
    try {
        let findQuery;
        if(tag){
            findQuery={
                tags:tag,
                draft:false
            }
        }else if(query){
            findQuery={
                draft:false,
                title:new RegExp(query , 'i')
            }
        }
    
        const blog=await Blog.find(findQuery)
            .populate("author" , "personal_info.profile_img personal_info.username personal_info.fullname -_id")
            .sort({"publishedAt":-1})
            .select("blog_id title des banner activity tags publishedAt -_id")
            .skip((page-1)*2)
            .limit(2)
            .then(blogs=>{
                return res.status(200).json({blogs})
            }).catch(err=>{
            return res.status(500).json({error:err.message})
            })
    } catch (error) {
        console.log("Error getting blogs")
        console.log(error.message)
        next(errorHandler(500,error.message))
    }
}

//like the blog
// export const likeBlog=async(req,res)=>{
//     try {
//         const {id}=req.user
//         const {_id , isLikedByUser}=req.body
//         let incrementVal=isLikedByUser ? -1 : 1

//         Blog.findOneAndUpdate({_id },{
//             $inc:{
//                 "activity.total_likes":incrementVal
//             }
//         }).then((blog)=>{
//             if(!isLikedByUser){
//                 let like=new Notification({
//                     type:'like',
//                     blog:_id,
//                     notification_for:blog.author,
//                     user:id
//                 })
//                 like.save().then((notification)=>{
//                     return res.status(200).json({
//                         success:true,
//                         message:"Blog liked successfully",
//                         liked_by_user : true
//                     })
//                 })
//             }else{
//                 Notification.findOneAndDelete({
//                     type:'like',
//                     blog:_id,
//                     user:id
//                 }).then((result)=>{
//                     return res.status(200).json({
//                         success:true,
//                         message:"Blog unliked successfully",
//                         liked_by_user:false
//                     })
//                 }).catch((error)=>{
//                     return res.status(500).json({
//                         success:false,
//                         message:error.message
//                     })
//                 })
//             }
//         }).catch((err)=>{
//             return res.status(500).json({
//                 success:false,
//                 message:err.message
//             })
//         })
//     } catch (error) {
//         console.log("Error in liking blog")
//         console.log(error.message)
//         next(errorHandler(500,error.message))
//     }
// }

export const likeBlog=async (req,res)=>{
    const {id} = req.user
    const {_id , isLikedByUser} =req.body
    try {
        if(isLikedByUser){
            const notification=await Notification.findOneAndDelete({
                type:'like',
                user:id,
                blog:_id
            })
            if(notification){
                const blog=await Blog.findOneAndUpdate({_id},{
                    $inc:{
                        "activity.total_likes":-1
                    }
                })
                return res.status(200).json({
                    success:true,
                    message:"Blog unliked successfully",
                    liked_by_user:false
                })
            }else{
                return res.status(404).json({
                    success:false,
                    message:"Notification not found"
                })
            }
        }

        const blogToLike=await Blog.findOneAndUpdate({_id},{
            $inc:{
                "activity.total_likes":1
            }
        })

        const notification=await Notification.create({
            type:'like',
            user:id,
            blog:_id,
            notification_for:blogToLike.author
        })

        return res.status(200).json({
            success:true,
            message:"Blog liked successfully",
            liked_by_user:true
        })

    } catch (error) {
        console.log("Error in liking blog")
        console.log(error.message)
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

//is liked by user
export const isLikedByUser=async(req,res)=>{
    const {id}=req.user
    const {_id} =req.body
    try {
        Notification.exists({
            type:'like',
            blog:_id,
            user:id
        }).then((result)=>{
            return res.status(200).json({result})
        }).catch((error)=>{
            return res.status(500).json({
                success:false,
                message:error.message
            })
        })
    } catch (error) {
        console.log('error in is liked by user')
        console.log(error.message)
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}