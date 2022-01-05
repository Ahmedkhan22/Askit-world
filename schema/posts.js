const mongoose = require('mongoose')
const float=require('mongoose-float').loadType(mongoose)
const ReactModel = mongoose.Schema({
    reactby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    //on usefull it will be true or on useless it will be false
    reacttype: {
        type: Boolean,
    }
})

const PollModel=mongoose.Schema({
    poll_status:{
        type:Boolean,
        default:false
    },
    choice:{
        type:[String]
    },
    onfirst:{
        type:float,
        default:0
    },
    onsecond:{
        type:float,
        default:0
    },
    onthird:{
        type:float,
        default:0
    },
    onfourth:{
        type:float,
        default:0
    },
    total:{
        type:Number,
        default:0
    },
    end_date:{
        type:Date
    }
})

const PostModel = mongoose.Schema({
    annonymous: {
        type: Boolean,
        default:false
    },
    postby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    shared:{
        type:Boolean,
        default:false
    },
    shared_post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"posts"
    },
    total_shares:{
        type:Number,
        default:0
    },
    text: {
        type: String
    },
    category: {
        type: [String]
    },
    total_react:{
        type:Number,
        default:0
    },
    poll_detail: PollModel,
    reacts: [ReactModel],
    total_comment:{
        type:Number,
        default:0
    },
    total_shares:{
        type:Number,
        default:0
    },
    Comments: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "comments"
    },
    poll: {
        type: Boolean,
        default: false
    },
    created_date: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('posts', PostModel)

