const mongoose = require('mongoose')

const NotiModel=mongoose.Schema({
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    },
    notification:{
        type:{
            title:String,
            message:String
        }
    },
    created_date:{
        type:Date,
        default:Date.now()
    }
})
const NotificationModel = mongoose.Schema({
    postby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    postid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "posts"
    },
    read: {
        type: Boolean,
        default: false,
        required: true
    },
    notifications: {
        type: [NotiModel]
    },
    liked:{
        type:Number,
        default:0
    },
    commented:{
        type:Number,
        default:0
    },
    shares:{
        type:Number,
        default:0
    },
    created_date:{
        type:Date,
        default:Date.now()
    }
})