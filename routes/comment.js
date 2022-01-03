const express = require("express");
const router = express.Router()
const error = require('../handle funtion/error')
const Success = require('../handle funtion/success');
const answer = require('../schema/comment');
const post=require('../schema/posts')
const user=require('../schema/User')
//add answer
router.post('/addanswer', (req, res) => {
    let data = req.body
    answer.create(data, (Err, Doc) => {
        if (Err) res.json(error(Err))
        else {
            post.findByIdAndUpdate(req.body.post,{$inc:{total_comment:1},$push:{Comments:Doc._id}},{new:true})
            .exec((err,doc)=>{
                if(err) res.json(error(err))
                else res.json(Success(Doc))
            })
        }
    })
})

//vote on a comment
router.post('/vote', (req, res) => {
    if(req.body.action==true){
        answer.findByIdAndUpdate(req.body.answerid, { $inc: { vote: 1 } }, { new: true })
        .populate("answerby", 'name picture')
        .exec((err, doc) => {
            if(err) res.json(error(err))
            else
             {
                if(doc!==null){
                    user.findByIdAndUpdate(doc.answerby,{$inc:{contribution:10}},{new:true})
                .exec((Error,info)=>{
                    if(Error) res.json(error(Error))
                    else res.json(Success("answer updated"))
                })
                }
            }
        })
    }
    else if(req.body.action ==false){
        answer.findByIdAndUpdate(req.body.answerid, { $inc: { vote: -1 } }, { new: true })
        .populate("answerby", 'name picture')
        .exec((err, doc) => {
            if(err) res.json(error(err))
            else 
            {
                user.findByIdAndUpdate(req.body.userid,{$inc:{contribution:-1}},{new:true})
                .exec((Error,info)=>{
                    if(Error) res.json(error(Error))
                    else res.json(Success("answer updated"))
                })
            }
        })
    }
})

//thanks writer 
router.post('/thankswriter',(req,res)=>{
    answer.findByIdAndUpdate(req.body.answerid,{thanks:true},{new:true})
    .exec((err,doc)=>{
        if(err) res.json(error(err))
        else {
            if(doc!==null){
                user.findByIdAndUpdate(doc.answerby,{$inc:{contribution:2}},{new:true})
                .exec((Error,info)=>{
                    if(Error) res.json(error(Error))
                    else res.json(Success("answer updated"))
                })
            }
        }
    })
})

//answer accepted
router.post('/ansaccept',(req,res)=>{
    answer.findByIdAndUpdate(req.body.answerid,{accept:true},{new:true})
    .exec((err,doc)=>{
        if(err) res.json(error(err))
        else{
            user.findByIdAndUpdate(doc.answerby,{$inc:{contribution:15}},{new:true})
                .exec((Error,info)=>{
                    if(Error) res.json(error(Error))
                    else res.json(Success("answer updated"))
                })
        }
    })
})

//giving comments on answer
router.post('/anstoans',(req,res)=>{
    answer.findByIdAndUpdate(req.body.asnwerid,{$push:{answers:req.body.answer},$inc:{total_answer:1}},{new:true})
    .exec((err,doc)=>{
        if(err) res.json(error(err))
        else res.json(Success({msg:"answer count:",doc:doc.total_answer}))
    })
})

//view single comment after clicking comment
router.post('/viewsingle',(req,res)=>{
    answer.findById(req.body.answerid,'answerby text thanks accept total_answer answers created_date')
    .populate('answerby','name picture')
    // .sort({"answer.$.created_date":1})
    .exec((err,doc)=>{
        if(err) res.json(error(err))
        else res.json(Success({answer:doc}))

    })

})
module.exports = router