import { nanoid } from "nanoid";
import Blog from "../Schema/Blog.js";
import User from "../Schema/User.js";
import { errorHandler } from "../utils/customError.js";

//create blog
export const createBlog=(req,res,next)=>{
    const authorId=req.user;

    let {title , des , banner , tags , content , draft}=req.body;

    if(!title.length){
        return res.status(403).json({error:"You must provide a title"});
    }

    if(!draft){
        if(!des.length || des.length > 200){
            return res.status(403).json({error:"You must provide blog description under 200 words"});
        }
        if(!banner.length){
            return res.status(403).json({error:"You must provide a blog banner"});
        }
        if(!content.blocks.length){
            return res.status(403).json({error:"There must be some blog content to publish it"});
        }
        if(!tags.length || tags.length > 10){
            return res.status(403).json({error:"Provide tags in order to publish the blog ,  Maximum 10"});
        }
    }

    tags=tags.map(tag=>tag.toLowerCase());

    let blog_id=title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, "-").trim() + nanoid();

    let blog=new Blog({
        title,des,banner,content,tags,author:authorId,blog_id,draft:Boolean(draft)
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
            res.status(404).json({error:err.message})
        })
    } catch (error) {
        console.log("error in searching user")
        console.log(error.message)
        return next(errorHandler(500,"Error in searching user"))
    }
}