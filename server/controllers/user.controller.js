import { nanoid } from "nanoid";
import Blog from "../Schema/Blog.js";
import User from "../Schema/User.js";

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