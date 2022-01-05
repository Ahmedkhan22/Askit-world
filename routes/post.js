const express = require("express")
const router = express.Router()
const error = require('../handle funtion/error')
const Success = require('../handle funtion/success');
const comment = require("../schema/comment");
const post = require('../schema/posts');
const user = require("../schema/User");
const jwt = require('jsonwebtoken');
const passport = require('passport');
const keys = { secretOrKey: 'secret' }
//category schema
const cat = require("../schema/category");
//add a post
router.post('/addpost', passport.authenticate('jwt', { session: false }),(req, res) => {
    let data = req.body
    data.postby=req.user.id
    let today = new Date()
    let priorDate = new Date().setDate(today.getDate() + req.body.end_date)
    let end_dat = new Date(priorDate)
    if (req.body.poll !== true) {
        if(data.annonymous==true){
            post.create(data, (err, doc) => {
                if (err) res.json(error(err,"poll creation failed"))
                else {
                    doc.category.forEach(element => {
                        cat.findOneAndUpdate({ name: element }, { $inc: { today_count: 1 } })
                            .exec((Err, info) => {
                                if (Err) res.json(error(Err,"cat Categroy not found API error"))
                                else {
                                    if(info!==null){
                                        res.json(Success(doc,"Post shared"))
                                    }
                                    else{
                                        const obj={
                                            name:element,
                                            today_count:1
                                        }
                                        cat.create(obj,(Error,Doc)=>{
                                            if(Error) res.json(error(Error,"cat Categroy not found API error"))
                                            else res.json(Success(doc,"Post shared"))
                                        })
                                    }
                                }
                            })
                    })
                }
            })
        }
        else{
            data.postby=req.user.id
            post.create(data, (err, doc) => {
                if (err) res.json(error(err,"poll creation failed"))
                else {
                    doc.category.forEach(element => {
                        cat.findOneAndUpdate({ name: element }, { $inc: { today_count: 1 } })
                            .exec((Err, info) => {
                                if (Err) res.json(error(Err,"cat Categroy not found API error"))
                                else {
                                    if(info!==null){
                                        res.json(Success(doc,"Post shared"))
                                    }
                                    else{
                                        const obj={
                                            name:element,
                                            today_count:1
                                        }
                                        cat.create(obj,(Error,Doc)=>{
                                            if(Error) res.json(error(Error,"cat Categroy not found API error"))
                                            else res.json(Success(doc,"Post shared"))
                                        })
                                    }
                                }
                            })
                    })
                }
            })
        }
    }
    else if (req.body.poll !== false) {
        let data=req.body
        let obj = {
            annonymous:data.annonymous? true:false,
            postby: req.user.id,
            text: req.body.text,
            category: req.body.category,
            poll: req.body.poll,
            poll_detail: {
                choice:req.body.choiceArray,
                poll_status: true,
                end_date: end_dat
            }
        }
        post.create(obj, (err, doc) => {
            if (err) res.json(error(err,"poll creation failed"))
            else {
                doc.category.forEach(element => {
                    cat.findOneAndUpdate({ name: element }, { $inc: { today_count: 1 } })
                        .exec((Err, info) => {
                            if (Err) res.json(Err,"cat Categroy not found API error")
                            else {
                                if(info!==null){
                                    res.json(Success(doc,"Post shared"))
                                }
                                else{
                                    let obj={
                                        name:element,
                                        today_count:1
                                    }
                                    cat.create(obj,(Error,Doc)=>{
                                        if(Error) res.json(error(Error,"cat Categroy not found API error"))
                                        else res.json(Success(doc,"Post shared"))
                                    })
                                }
                            }
                        })
                })
            }
        })
    }
})

//if any user share a post
router.post('/share',(req,res)=>{
    let obj={
        postby:req.body.postby,
        shared_post:req.body.postid,
        shared:true
    }
    post.create(obj,(err,doc)=>{
        if(err) res.json(error(err))
        else res.json(Success(doc))
    })
})
//reacting on post 
router.post('/react', (req, res) => {
    let obj = {
        reactby: req.body.userid,
        reacttype: req.body.reacttype
    }
    if (req.body.reacttype == true) {
        post.findById(req.body.postid)
            .exec((Err, Doc) => {
                if (Err) res.json(error(Err))
                else {
                    if (Doc.postby == req.body.userid) {
                        post.findByIdAndUpdate(req.body.postid, { $inc: { total_react: 1 }, $push: { reacts: obj } }, { new: true })
                            .exec((Error, info) => {
                                if (Error) res.json(error(Error))
                                else res.json(Success({ "total reacts are": info.total_react }))
                            })
                    }
                    else {
                        post.findByIdAndUpdate(req.body.postid, { $inc: { total_react: 1 }, $push: { reacts: obj } }, { new: true })
                            .exec((Error, info) => {
                                if (Error) res.json(error(Error))
                                else {
                                    user.findByIdAndUpdate(info.postby, { $inc: { contribution: 10 } }, { new: true })
                                        .exec((err, doc) => {
                                            if (err) res.json(error(err))
                                            else res.json(Success({ "total reacts are": info.total_react }))
                                        })
                                }
                            })
                    }
                }
            })
    }
    else {
        post.findByIdAndUpdate(req.body.postid, { $inc: { total_react: 1 }, $push: { reacts: obj } }, { new: true })
            .exec((Error, info) => {
                if (Error) res.json(error(Error))
                else res.json(Success({ "total reacts are": info.total_react }))
            })
    }
})

//reacting on poll

router.post('/reactonpoll', (req, res) => {
    post.findById(req.body.postid)
        .exec((Err, info) => {
            if (Err) res.json(error(Err))
            else {
                // console.log(info);
                if (info.poll_detail.choice1 !== undefined && info.poll_detail.choice2 !== undefined && info.poll_detail.choice3 == undefined && info.poll_detail.choice4 == undefined) {
                    if (req.body.onfirst !== undefined) {
                        post.findByIdAndUpdate(req.body.postid, { $inc: { "poll_detail.onfirst": 1, "poll_detail.total": 1 } }, { new: true })
                            .exec((err, doc) => {
                                if (err) res.json(error(err))
                                else {
                                    let onfirst_percentage = parseFloat((doc.poll_detail.onfirst / doc.poll_detail.total) * 100).toFixed(2)
                                    let onsecond_percentage = parseFloat((doc.poll_detail.onsecond / doc.poll_detail.total) * 100).toFixed(2)
                                    res.json(Success({ onfirst: onfirst_percentage, onsecond: onsecond_percentage }))
                                }
                            })
                    }
                    else if (req.body.onsecond !== undefined) {
                        post.findByIdAndUpdate(req.body.postid, { $inc: { "poll_detail.onsecond": 1, "poll_detail.total": 1 } }, { new: true })
                            .exec((err, doc) => {
                                if (err) res.json(error(err))
                                else {
                                    let onfirst_percentage = parseFloat((doc.poll_detail.onfirst / doc.poll_detail.total) * 100).toFixed(2)
                                    let onsecond_percentage = parseFloat((doc.poll_detail.onsecond / doc.poll_detail.total) * 100).toFixed(2)
                                    res.json(Success({ onfirst: onfirst_percentage, onsecond: onsecond_percentage }))
                                }
                            })
                    }
                }
                else if (info.poll_detail.choice1 !== undefined && info.poll_detail.choice2 !== undefined && info.poll_detail.choice3 !== undefined && info.poll_detail.choice4 == undefined) {
                    if (req.body.onfirst !== undefined) {
                        post.findByIdAndUpdate(req.body.postid, { $inc: { "poll_detail.onfirst": 1, "poll_detail.total": 1 } }, { new: true })
                            .exec((err, doc) => {
                                if (err) res.json(error(err))
                                else {
                                    let onfirst_percentage = parseFloat((doc.poll_detail.onfirst / doc.poll_detail.total) * 100).toFixed(2)
                                    let onsecond_percentage = parseFloat((doc.poll_detail.onsecond / doc.poll_detail.total) * 100).toFixed(2)
                                    let onthird_percentage = parseFloat((doc.poll_detail.onthird / doc.poll_detail.total) * 100).toFixed(2)
                                    res.json(Success({ onfirst: onfirst_percentage, onsecond: onsecond_percentage, onthird: onthird_percentage }))
                                }
                            })
                    }
                    else if (req.body.onsecond !== undefined) {
                        post.findByIdAndUpdate(req.body.postid, { $inc: { "poll_detail.onsecond": 1, "poll_detail.total": 1 } }, { new: true })
                            .exec((err, doc) => {
                                if (err) res.json(error(err))
                                else {
                                    let onfirst_percentage = parseFloat((doc.poll_detail.onfirst / doc.poll_detail.total) * 100).toFixed(2)
                                    let onsecond_percentage = parseFloat((doc.poll_detail.onsecond / doc.poll_detail.total) * 100).toFixed(2)
                                    let onthird_percentage = parseFloat((doc.poll_detail.onthird / doc.poll_detail.total) * 100).toFixed(2)
                                    res.json(Success({ onfirst: onfirst_percentage, onsecond: onsecond_percentage, onthird: onthird_percentage }))
                                }
                            })
                    }
                    else if (req.body.onthird !== undefined) {
                        post.findByIdAndUpdate(req.body.postid, { $inc: { "poll_detail.onthird": 1, "poll_detail.total": 1 } }, { new: true })
                            .exec((err, doc) => {
                                if (err) res.json(error(err))
                                else {
                                    let onfirst_percentage = parseFloat((doc.poll_detail.onfirst / doc.poll_detail.total) * 100).toFixed(2)
                                    let onsecond_percentage = parseFloat((doc.poll_detail.onsecond / doc.poll_detail.total) * 100).toFixed(2)
                                    let onthird_percentage = parseFloat((doc.poll_detail.onthird / doc.poll_detail.total) * 100).toFixed(2)
                                    res.json(Success({ onfirst: onfirst_percentage, onsecond: onsecond_percentage, onthird: onthird_percentage }))
                                }
                            })
                    }
                }
                else if (info.poll_detail.choice1 !== undefined && info.poll_detail.choice2 !== undefined && info.poll_detail.choice3 !== undefined && info.poll_detail.choice4 !== undefined) {
                    if (req.body.onfirst !== undefined) {
                        post.findByIdAndUpdate(req.body.postid, { $inc: { "poll_detail.onfirst": 1, "poll_detail.total": 1 } }, { new: true })
                            .exec((err, doc) => {
                                if (err) res.json(error(err))
                                else {
                                    let onfirst_percentage = parseFloat((doc.poll_detail.onfirst / doc.poll_detail.total) * 100).toFixed(2)
                                    let onsecond_percentage = parseFloat((doc.poll_detail.onsecond / doc.poll_detail.total) * 100).toFixed(2)
                                    let onthird_percentage = parseFloat((doc.poll_detail.onthird / doc.poll_detail.total) * 100).toFixed(2)
                                    let onfourth_percentage = parseFloat((doc.poll_detail.onfourth / doc.poll_detail.total) * 100).toFixed(2)
                                    res.json(Success({ onfirst: onfirst_percentage, onsecond: onsecond_percentage, onthird: onthird_percentage, onfouth: onfourth_percentage }))
                                }
                            })
                    }
                    else if (req.body.onsecond !== undefined) {
                        post.findByIdAndUpdate(req.body.postid, { $inc: { "poll_detail.onsecond": 1, "poll_detail.total": 1 } }, { new: true })
                            .exec((err, doc) => {
                                if (err) res.json(error(err))
                                else {
                                    let onfirst_percentage = parseFloat((doc.poll_detail.onfirst / doc.poll_detail.total) * 100).toFixed(2)
                                    let onsecond_percentage = parseFloat((doc.poll_detail.onsecond / doc.poll_detail.total) * 100).toFixed(2)
                                    let onthird_percentage = parseFloat((doc.poll_detail.onthird / doc.poll_detail.total) * 100).toFixed(2)
                                    let onfourth_percentage = parseFloat((doc.poll_detail.onfourth / doc.poll_detail.total) * 100).toFixed(2)
                                    res.json(Success({ onfirst: onfirst_percentage, onsecond: onsecond_percentage, onthird: onthird_percentage, onfouth: onfourth_percentage }))
                                }
                            })
                    }
                    else if (req.body.onthird !== undefined) {
                        post.findByIdAndUpdate(req.body.postid, { $inc: { "poll_detail.onthird": 1, "poll_detail.total": 1 } }, { new: true })
                            .exec((err, doc) => {
                                if (err) res.json(error(err))
                                else {
                                    let onfirst_percentage = parseFloat((doc.poll_detail.onfirst / doc.poll_detail.total) * 100).toFixed(2)
                                    let onsecond_percentage = parseFloat((doc.poll_detail.onsecond / doc.poll_detail.total) * 100).toFixed(2)
                                    let onthird_percentage = parseFloat((doc.poll_detail.onthird / doc.poll_detail.total) * 100).toFixed(2)
                                    let onfourth_percentage = parseFloat((doc.poll_detail.onfourth / doc.poll_detail.total) * 100).toFixed(2)
                                    res.json(Success({ onfirst: onfirst_percentage, onsecond: onsecond_percentage, onthird: onthird_percentage, onfouth: onfourth_percentage }))
                                }
                            })
                    }
                    else if (req.body.onfourth !== undefined) {
                        post.findByIdAndUpdate(req.body.postid, { $inc: { "poll_detail.onfourth": 1, "poll_detail.total": 1 } }, { new: true })
                            .exec((err, doc) => {
                                if (err) res.json(error(err))
                                else {
                                    let onfirst_percentage = parseFloat((doc.poll_detail.onfirst / doc.poll_detail.total) * 100).toFixed(2)
                                    let onsecond_percentage = parseFloat((doc.poll_detail.onsecond / doc.poll_detail.total) * 100).toFixed(2)
                                    let onthird_percentage = parseFloat((doc.poll_detail.onthird / doc.poll_detail.total) * 100).toFixed(2)
                                    let onfourth_percentage = parseFloat((doc.poll_detail.onfourth / doc.poll_detail.total) * 100).toFixed(2)
                                    res.json(Success({ onfirst: onfirst_percentage, onsecond: onsecond_percentage, onthird: onthird_percentage, onfouth: onfourth_percentage }))
                                }
                            })
                    }
                }
            }
        })
})


//view single post
router.post('/viewsingle', (req, res) => {
    post.findById(req.body.postid)
        .populate('postby', 'name')
        .exec((Err, info) => {
            if (Err) res.json(error(Err))
            else {
                if (info !== null) {
                    comment.find({ post: info._id })
                        .populate('postby', 'name')
                        .sort({ vote: -1 })
                        .exec((err, doc) => {
                            if (err) res.json(error(err))
                            else {
                                res.json(Success({ post: info, answers: doc }))
                            }
                        })
                }
                else res.json(error("post not found"))
            }
        })
})
module.exports = router