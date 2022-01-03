const mongoose=require('mongoose')

const CommentModel=mongoose.Schema({
    postby:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    },
    text:{
        type:String
    },
    created_date:{
        type:Date,
        default:Date.now()
    }
})

const AnswerModel=mongoose.Schema({
    post:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"posts"
    },
    answerby:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    },
    text:{
        type:String
    }, 
    vote:{
        type:Number,
        default:0
    },
    thanks:{
        type:Boolean,
        default:false
    },
    accept:{
        type:Boolean,
        default:false
    },
    total_answer:{
        type:Number,
        default:0
    },
    answers:[CommentModel],
    created_date:{
        type:Date,
        default:Date.now()
    }
})

module.exports=mongoose.model("comments",AnswerModel)