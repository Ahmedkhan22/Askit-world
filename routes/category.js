const express=require('express')
const router = express.Router()
const error = require('../handle funtion/error')
const Success = require('../handle funtion/success');
//categroy schema
const cat = require("../schema/category");

router.get('/gettrending',(req,res)=>{
    cat.find()
    .sort({today_count:-1})
    .exec((err,doc)=>{
        if(err) res.json(error(err))
        else res.json(Success(doc))
    })
})

module.exports=router