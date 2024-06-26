import Blog from "../Schema/Blog.js"
import Comment from "../Schema/Comment.js";
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

//like blog created by me
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

//add comment
// export const addComment=async(req,res)=>{
//     //logic for adding comment
//     const {id} = req.user
//     const {_id , comment , blog_author}=req.body
//     try {
//         if(!comment){
//             return res.status(400).json({
//                 success:false,
//                 message:"Comment cannot be empty"
//             })
//         }
//         const commentObject=new Comment({
//             blog_id:_id,
//             blog_author,
//             comment,
//             commented_by:id
//         })
//         commentObject.save().then((commentFile)=>{
//             let {comment , commentedAt , children}=commentFile
//             Blog.findOneAndUpdate({_id},{
//                 $push:{
//                     "comments":commentFile._id
//                 },
//                 $inc:{
//                     "activity.total_comments":1,
//                     "activity.total_parent_comments":1
//                 }
//             }).then((blog)=>{
//                 console.log('comment added successfully')
//             })
//             let notification={
//                 type:"comment",
//                 blog:_id,
//                 user:id,
//                 notification_for:blog_author,
//                 comment:commentFile._id
//             }
//             new Notification(notification).save().then((notification)=>{
//                 console.log('created new notification')
//             })
//             return res.status(200).json({
//                 success:true,
//                 message:"Comment added successfully",
//                 comment,
//                 commentedAt,
//                 _id:commentFile._id,
//                 id,
//                 children
//             })
//         })
//     } catch (error) {
//         console.log('Error in adding comment')
//         console.log(error.message)
//         return res.status(500).json({
//             success:false,
//             message:error.message
//         })
//     }
// }


//add comment
export const addComment=async(req,res,next)=>{
    const user_id=req.user.id
    const{_id,comment,replying_to,blog_author}=req.body
    if(!comment.length){
        return res.status(404).json({
            success:false,
            message:"Comment cannot be empty"
        })
    }
    let commentObj={blog_id:_id,blog_author,comment,commented_by:user_id}
    //If we get the replying_to from the frontend where replying_to is the id of 
    //the comment we are replying to then we will add the reply to the comment
    if(replying_to){
        //Here we are setting the parent comment to the id(replying_to) of the comment we got
        //from the frontend where the user is trying to reply
        commentObj.parent=replying_to
        commentObj.isReply=true
    }
    let increment=1
    new Comment(commentObj).save().then(async commentFile=>{
        //children refers to the reply to the comments
        let {comment,commentedAt,children}=commentFile
        Blog.findOneAndUpdate({_id},
            {
                $push:{"comments":commentFile._id},
                $inc:{"activity.total_comments":increment,
                "activity.total_parent_comments":replying_to?0:increment}
            }
            
        ).then(blog=>{console.log('New comment created')})
         .catch(error=>{console.log(error)})
         let notificationObj={
            type:replying_to?"reply":"comment",
            blog:_id,
            notification_for:blog_author,
            user:user_id,
            comment:commentFile._id
         }
         if(replying_to){
            notificationObj.replied_on_comment=replying_to

            await Comment.findOneAndUpdate({_id:replying_to},
                {$push:{children:commentFile._id}}
            ).then(replyingTOComment=>
                {notificationObj.notification_for=replyingTOComment.commented_by})

         }
         new Notification(notificationObj).save()
         .then(notification=>console.log('new notification created'))
         .catch(error=>console.log(error.message))

         return res.status(200).json({
            success:true,
            message:"Comment created successfully",
            comment,
            commentedAt,
            _id:commentFile._id,
            children,
            user_id
         })
    })
}

//get blog comments
export const getBlogComments=async (req,res)=>{
    try {
        const {blog_id , skip}=req.body
        const maxLimit=5
        Comment.find({blog_id , isReply:false})
        .populate("commented_by","personal_info.username personal_info.fullname personal_info.avatar")
        .skip(skip)
        .limit(maxLimit)
        .sort({
            "commentedAt":-1
        }).then((comments)=>{
            return res.status(200).json({
                success:true,
                message:"Comments are listed",
                comments
            })
        }).catch((error)=>{
            console.log('Error in getting comments')
            return res.status(500).json({
                success:false,
                message:error.message
            })
        })
    } catch (error) {
        console.log('error in getting comments')
        console.log(error.message)
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

//get blog comments replies
export const getReplies=async (req,res)=>{
    try {
        const {_id , skip}=req.body
        const maxLimit=5
        Comment.findOne({_id})
        .populate({
            path:"children",
            option:{
                limit:maxLimit,
                skip:skip,
                sort:{'commentedAt':-1}
            },
            populate:{
                path:"commented_by",
                select:"personal_info.username personal_info.fullname personal_info.avatar"
            },
            select:"-blog_id -updatedAt"
        })
        .select("children")
        .then((doc)=>{
            return res.status(200).json({
                success:true,
                message:"Comments are listed",
                replies:doc.children
            })
        }).catch((error)=>{
            console.log('Error in getting replies')
            return res.status(500).json({
                success:false,
                message:error.message
            })
        })
    } catch (error) {
        console.log('error in getting replies')
        console.log(error.message)
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

