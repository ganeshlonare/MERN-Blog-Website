import { nanoid } from "nanoid";
import Blog from "../Schema/Blog.js";
import User from "../Schema/User.js";
import Notification from "../Schema/Notification.js";
import Comment from "../Schema/Comment.js";

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
            console.log("blog created")
        })
        .catch(err=>{
            console.log(err)
            return res.status(500).json({error:"Failed to update total posts number"})
        })
        return res.status(201).json({
            success:true,
            message:"Blog created successfully",
            id:blog.blog_id,
            blog
        })
    }).catch(err=>{
        console.log(err)
        return res.status(500).json({error:err.message||'Internal server error'})
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
        Blog.findOneAndDelete({blog_id})
        .then((blog)=>{
            Notification.deleteMany({blog:blog._id}).then((result)=>{
                console.log('notifications deleted')
            })
            Comment.deleteMany({blog_id:blog._id}).then(()=>{
                console.log("Comments deleted")
            })
            User.findByIdAndUpdate(id,{
                $pull:{blogs:blog._id},
                $inc:{"account_info.total_posts":-1}
            }).then(()=>{
                console.log("Delete post from users account")
            })
            return res.status(200).json({
                success:true,
                message:"Blog deleted successfully"
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