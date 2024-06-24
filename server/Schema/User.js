import jwt  from "jsonwebtoken";
import mongoose, { Schema } from "mongoose";

let profile_imgs_name_list = ["Garfield", "Tinkerbell", "Annie", "Loki", "Cleo", "Angel", "Bob", "Mia", "Coco", "Gracie", "Bear", "Bella", "Abby", "Harley", "Cali", "Leo", "Luna", "Jack", "Felix", "Kiki"];
let profile_imgs_collections_list = ["notionists-neutral", "adventurer-neutral", "fun-emoji"];

const userSchema = mongoose.Schema({

    personal_info: {
        fullname: {
            type: String,
            lowercase: true,
            required: [true , "fullname is required"],
            minlength: [3, 'fullname must be 3 letters long'],
        },
        email: {
            type: String,
            required:[true , "Email is required"],
            lowercase: true,
            unique: true,
            match:[
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Enter a valid email address'
            ]
        },
        password: {
            type:String,
            required:[true,"password is required"]
        },
        username: {
            type: String,
            minlength: [3, 'Username must be 3 letters long']
        },
        bio: {
            type: String,
            maxlength: [200, 'Bio should not be more than 200'],
            default: "",
        },
        avatar:{
            public_id:{
                type:String
            },
            secure_url:{
                type:String
            }
        },
        role:{
            type:String,
            enum:['USER','ADMIN'],
            default:'USER'
        },
        forgotPasswordToken:String,
        forgotPasswordTokenExpiry:Date,
        token:String
    },
    social_links: {
        youtube: {
            type: String,
            default: "",
        },
        instagram: {
            type: String,
            default: "",
        },
        facebook: {
            type: String,
            default: "",
        },
        twitter: {
            type: String,
            default: "",
        },
        github: {
            type: String,
            default: "",
        },
        website: {
            type: String,
            default: "",
        }
    },
    account_info:{
        total_posts: {
            type: Number,
            default: 0
        },
        total_reads: {
            type: Number,
            default: 0
        },
    },
    google_auth: {
        type: Boolean,
        default: false
    },
    blogs: {
        type: [ Schema.Types.ObjectId ],
        ref: 'blogs',
        default: [],
    }

}, 
{ 
    timestamps: {
        createdAt: 'joinedAt'
    } 

})

userSchema.methods={
    generateJwtToken:async function(){
        const tokenData={
            id:this._id,
            email:this.personal_info.email,
            role:this.personal_info.role
        }
        return await jwt.sign(
            tokenData , 
            process.env.JWT_SECRET_KEY , 
            {
                expiresIn:process.env.JWT_SECRET_KEY_EXPIRY
            }
        )
    }
}

const User = mongoose.model('users',userSchema)

export default User