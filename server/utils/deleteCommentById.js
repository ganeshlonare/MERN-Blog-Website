import Blog from "../Schema/Blog.js"
import Comment from "../Schema/Comment.js"
import Notification from "../Schema/Notification.js"

//delete function for deleting comment
export const deleteCommentById=(_id)=>{
    try {
        Comment.findOneAndDelete({_id})
        .then((commentFile)=>{
            if(commentFile.parent){
                Comment.findOneAndUpdate({_id : commentFile.parent},{
                    $pull:{children:_id}
                }).then(()=>{
                    console.log("parent comment deleted successfully")
                })
            }
            Notification.findOneAndDelete({comment:_id}).then(()=>{
                console.log("notification deleted successfully")
            })
            Notification.findOneAndUpdate({reply:_id} ,{$unset:{reply:1}}).then(()=>{
                console.log("notification deleted successfully")
            })

            Blog.findOneAndUpdate({_id:commentFile.blog_id},{
                $pull:{comments:_id},
                $inc:{"activity.total_comments":-1 , "activity.total_parent_comments":commentFile.parent?0:-1}
            }).then((blog)=>{
                if(commentFile.children.length){
                    commentFile.children.map((child)=>{
                        deleteCommentById(child)
                    })
                }
            })
        })
    } catch (error) {
        console.log('error in deleting comment')
        console.log(error.message)
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}