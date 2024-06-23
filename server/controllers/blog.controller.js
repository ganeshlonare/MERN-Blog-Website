import Blog from "../Schema/Blog.js"
import { errorHandler } from "../utils/customError.js";

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

export const trendingBlogs=async(req,res,next)=>{
    const maxLimit=5
    try {
        const blogs=await Blog.find({draft:false})
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