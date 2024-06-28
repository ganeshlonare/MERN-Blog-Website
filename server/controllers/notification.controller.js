import Notification from "../Schema/Notification.js"

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
        Notification.find(findQuery)
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
