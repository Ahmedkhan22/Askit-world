const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator')
const user = require('../schema/User');
const post = require('../schema/posts');
const otpsave = require('../schema/otp');
const multer = require('multer')
var upload = multer({ dest: __dirname + '/../uploads/' });
const crypto = require('crypto');
const error = require('../handle funtion/error')
const Success = require('../handle funtion/success');
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const jwt = require('jsonwebtoken');
const passport = require('passport');
const keys = { secretOrKey: 'secret' }


// for encryption 
const encrypt = function (pass) {
    var mykey = crypto.createCipher('aes-128-cbc', 'mypassword');
    var mystr = mykey.update(`${pass}`, 'utf8', 'hex')
    return mystr += mykey.final('hex');
    ;
}
// for decryption
const decrypt = (pass) => {
    var mykey = crypto.createDecipher('aes-128-cbc', 'mypassword');
    var mystr = mykey.update(`${pass}`, 'hex', 'utf8')
    return mystr += mykey.final('utf8');
}
//creating transport for sending otp via email
var transporter = nodemailer.createTransport({
    service: "gmail", // hostname
    // secureConnection: false, // TLS requires secureConnection to be false
    // port: 587, // port for secure SMTP
    // tls: {
    //     ciphers: 'SSLv3'
    // },
    auth: {
        user: 'rashid.sj91@gmail.com',
        pass: 'cztrxffelwxzuedq'
    }
});

//resend otp
router.post('/resendotp', (req, res) => {
    //for generating otp
    const otp = otpGenerator.generate(4, { digits: true, upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false })
    if (req.body.email !== undefined) {
        //creating mail for otp
        var mailOptions = {
            from: 'worldaskit@outlook.com',
            to: `${req.body.email}`,
            subject: 'Verifying email',
            text: `${otp}`
        };
        //sending mail with otp
        transporter.sendMail(mailOptions, function (Error, info) {
            if (Error) {
                res.json(error(Error, "email not send"));
            } else {
                let obj = {
                    mail: req.body.email,
                    otp: otp
                }
                console.log('Email sent: ' + info.response);
                console.log("otp===>", otp);
                otpsave.create(obj, (err, doc) => {
                    if (err) {
                        res.json(error(err, "otp creation failed"))
                    } else {
                        res.json(Success(doc, "An otp send to your email"))
                    }
                })
            }
        })
    }
    else {
        res.json(error("insert email please"));
    }

})
//route for signup
router.post('/signup', (req, res) => {
    //for generating otp
    const otp = otpGenerator.generate(4, { digits: true, upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false })
    if (req.body.email !== undefined) {
        //creating mail for otp
        var mailOptions = {
            from: 'worldaskit@outlook.com',
            to: `${req.body.email}`,
            subject: 'Verifying email',
            text: `${otp}`
        };
        //sending mail with otp
        user.findOne({ email: req.body.email })
            .exec((Err, Doc) => {
                if (Err) res.json(error(Err, "error in email"))
                else {
                    if (Doc == null) {
                        transporter.sendMail(mailOptions, function (Error, info) {
                            if (Error) {
                                res.json(error(Error, "email not send"));
                            } else {
                                let obj = {
                                    mail: req.body.email,
                                    otp: otp
                                }
                                console.log('Email sent: ' + info.response);
                                console.log("otp===>", otp);
                                otpsave.create(obj, (err, doc) => {
                                    if (err) {
                                        console.log(err);
                                        res.json(error(err, "otp creation failed"))
                                    } else {
                                        res.json(Success(doc, "An otp send to your email"))
                                    }
                                })
                            }
                        })
                    }
                    else {
                        res.json(error(Doc, "email is already registered"))
                    }
                }
            })
    }
    else {
        res.json(error("insert email please"));
    }
})

//for verifying otp
router.post('/otpverify', async (req, res) => {
    if (req.body.otp !== undefined) {
        //    if (req.body.forgetpassword==true) {
        otpsave.findById(req.body.otpId)
            .exec((Error, info) => {
                if (Error) res.json(error(Error, "otp queery not worked"))
                else {
                    if (info !== null) {
                        if (req.body.otp == info.otp) {
                            console.log("otp===>", req.body.otp);
                            console.log("otp===>", req.body.otpId);
                            user.findOne({ email: req.body.email }, "_id")
                                .exec((err, doc) => {
                                    if (err) res.json(error(err, "error in finding user"))
                                    else {
                                        if (doc !== null) {
                                            const payload = { id: doc._id, name: doc.name }; // Create JWT Payload

                                            // Sign Token
                                            jwt.sign(
                                                payload,
                                                keys.secretOrKey,
                                                { expiresIn: 3600 },
                                                (err, token) => {
                                                    token = 'Bearer ' + token
                                                    res.json(Success({ token: token, forgetpassword: true }, "user verified"));
                                                }
                                            );
                                        }
                                        else {
                                            let obj = {
                                                name: req.body.userName,
                                                email: req.body.email,
                                                number: req.body.phone,
                                                DOB: req.body.DOB,
                                                gender: req.body.gender,
                                                password: encrypt(req.body.password)
                                            }

                                            user.create(obj, (err, doc) => {
                                                if (err) res.json(error(err, "user craetion failed"))
                                                else {
                                                    const payload = { id: doc._id, name: doc.name }; // Create JWT Payload

                                                    // Sign Token
                                                    jwt.sign(
                                                        payload,
                                                        keys.secretOrKey,
                                                        { expiresIn: 3600 },
                                                        (err, token) => {
                                                            token = 'Bearer ' + token
                                                            console.log(token);
                                                            res.json(Success({ token: token }, "user created"));
                                                        }
                                                    );
                                                }
                                            })
                                        }
                                    }
                                })
                        }
                        else {
                            res.json(error("failed", "Insert Valid Otp"))
                        }
                    }
                    else {
                        res.json(error('failed', "send valid otp id"))
                    }
                }
            })
        //    }
        //    else if (req.body.forgetpassword==undefined && req.body.otpId!== undefined){
        //     otpsave.findById(req.body.otpId)
        //     .exec((Error, info) => {
        //         if (Error) res.json(error(Error, "otp queery not worked"))
        //         else {
        //             if (info !== null) {
        //                 if (req.body.otp == info.otp) {
        //                     console.log("otp===>",req.body.otp);
        //                     console.log("otp===>",req.body.otpId);

        //                     let obj = {
        //                         name: req.body.userName,
        //                         email: req.body.email,
        //                         number: req.body.phone,
        //                         DOB: req.body.DOB,
        //                         gender: req.body.gender,
        //                         password: encrypt(req.body.password)
        //                     }

        //                     user.create(obj, (err, doc) => {
        //                         if (err) res.json(error(err, "user craetion failed"))
        //                         else {
        //                             const payload = { id: info._id, name: info.name}; // Create JWT Payload

        //                         // Sign Token
        //                         jwt.sign(
        //                           payload,
        //                           keys.secretOrKey,
        //                           { expiresIn: 3600 },
        //                           (err, token) => {
        //                             token= 'Bearer ' + token
        //                             console.log(token);
        //                             res.json(Success({token:token},"user created"));
        //                           }
        //                         );
        //                         }
        //                     })
        //                 }
        //                 else {
        //                     res.json(error("failed","Insert Valid Otp"))
        //                 }
        //             }
        //             else {
        //                 res.json(error('failed', "send valid otp id"))
        //             }
        //         }
        //     })
        //    }
    }
    else res.json(error("please enter otp"))
})

//login router
router.post("/login", (req, res) => {
    if (req.body.email !== undefined && req.body.password !== undefined) {
        user.findOne({ email: req.body.email }, "_id password")
            .exec((Err, doc) => {
                if (Err) res.json(error(Err))
                else {
                    if (doc !== null) {
                        if (req.body.password == decrypt(doc.password)) {

                            const payload = { id: doc._id, name: doc.name }; // Create JWT Payload
                            
                            // Sign Token
                            jwt.sign(
                                payload,
                                keys.secretOrKey,
                                { expiresIn: 3600 },
                                (err, token) => {
                                    token = 'Bearer ' + token
                                    res.json(Success({ token: token }, "Login Succefull"));
                                }
                            );
                            // res.json(Success(info,"user login successful"))
                        }
                        else {
                            res.json(error("failed", "Incorrect Password"))
                        }
                    } 
                    else res.json(error("failed", "user not found"))
                }
            })
    }
    else { res.json(error("something is missing")) }

})
//forget password 
router.post('/forgetpassword', (req, res) => {
    //for generating otp
    const otp = otpGenerator.generate(4, { digits: true, upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false })
    if (req.body.email !== undefined) {
        user.findOne({ email: req.body.email })
            .exec((Err, info) => {
                if (Err) res.json(error(Err, "error in finding user"))
                else {
                    if (info !== null) {
                        //creating mail for otp
                        var mailOptions = {
                            from: 'worldaskit@outlook.com',
                            to: `${req.body.email}`,
                            subject: 'Sending Email using Node.js',
                            text: `${otp}`
                        };
                        //sending mail with otp
                        transporter.sendMail(mailOptions, function (Error, info) {
                            if (Error) {
                                res.json(error(Error, "email not send"));
                            } else {
                                let obj = {
                                    mail: req.body.email,
                                    otp: otp
                                }
                                console.log('Email sent: ' + info.response);
                                otpsave.create(obj, (err, doc) => {
                                    if (err) {
                                        res.json(error(err, "otp creation failed"))
                                    } else {
                                        // console.log(email);
                                        res.json(Success(doc, "An otp is send to your email"))
                                    }
                                })
                            }
                        })
                    }
                    else res.json(error("failed", "User not found"))
                }
            })
    }
    else res.json(error("failed", "please enter email"))
})
// //otp verify after forget password
// router.post('/otpafterforget', (req, res) => {
//     if (req.body.otp !== undefined) {
//         otpsave.findById(req.body.otpid)
//             .exec((Err, info) => {
//                 if (Err) res.json(error(Err))
//                 else {
//                     if (info !== null) {
//                         if (req.body.otp == info.otp) {
//                             user.findOne({ email: req.body.email })
//                                 .exec((err, doc) => {
//                                     if (err) res.json(error(err))
//                                     else {
//                                         if (doc !== null) {
//                                             res.json(Success(doc))
//                                         }
//                                         else res.json(error("sent email"))
//                                     }
//                                 })
//                         }
//                     }
//                 }
//             })
//     }
//     else res.json(error("please enter otp"))
// })

//after verifying forget password otp
router.post('/changepassword',passport.authenticate('jwt', { session: false }),(req, res) => {
    if (req.body.password !== undefined) {
        user.findByIdAndUpdate(req.user.id, { password: encrypt(req.body.password) }, { new: true })
            .exec((err, doc) => {
                if (err) res.json(error(err,"Api Error"))
                else res.json(Success(doc,"Password Succefully changed"))
            })
    }
})


// router.get(
//     '/current',
//     passport.authenticate('jwt', { session: false }),
//     (req, res) => {
//         res.json({
//             id: req.user.id,
//             name: req.user.name,
//             email: req.user.email
//         });
//     }
// );

//getting the interests of user 
router.post('/getinterest', passport.authenticate('jwt', { session: false }), (req, res) => {
    if (req.body.interest !== undefined) {
        user.findByIdAndUpdate(req.user.id, { interests: req.body.interest }, { new: true })
            .exec((err, doc) => {
                if (err) res.json(error(err, "error in Api"))
                else res.json(Success(doc, "Personalizing your newsfeed"))
            })
    }
})
//home page for user 
router.post('/homepage',passport.authenticate('jwt', { session: false }), (req, res) => {
    if (req.body.topic !== undefined) {
        post.find({ category: req.body.topic })
            .populate("postby", "name followers")
            .populate('shared_post.$*')
            .exec((err, doc) => {
                if (err) res.json(error(err,"error in topic api"))
                else res.json(Success(doc,"Posts of Treding topic"))
            })
    }
    else {
        user.findById(req.user.id)
            .exec((Err, info) => {
                if (Err) res.json(Err)
                else {
                    post.find({ $or: [{ category: { $in: info.interests } }, { postby: { $in: info.following } }] })
                        .populate("postby", "name followers")
                        .populate('shared_post.$*')
                        .exec((err, doc) => {
                            if (err) res.json(error(err,"error in user API"))
                            else res.json(Success(doc,"posts are found"))
                        })
                }
            })
    }
})

//after clicking on follow
router.post('/follow', (req, res) => {
    user.findByIdAndUpdate(req.body.followid, { followers: req.body.followby }, { new: true })
        .exec((Err, info) => {
            if (Err) res.json(error(Err))
            else {
                if (info !== null) {
                    user.findByIdAndUpdate(req.body.followby, { following: info._id }, { new: true })
                        .exec((err, doc) => {
                            if (err) res.json(error(err))
                            else res.json(Success({ userinfo: info, followers: info.followers.length, following: info.following.length }))
                        })
                }
                else res.json(error("user not found"))
            }
        })
})

//single user 
/*if user wants to see top posts of a user or its own top post then
require will Top or if latest then require will Lates */
router.post('/singleuser', (req, res) => {
    let date = new Date()
    if (req.body.token !== req.body.userid) {
        user.findById(req.body.userid, "name address followers following description")
            .exec((Err, info) => {
                if (Err) res.json(error(Err))
                else {
                    if (req.body.require == "Top") {
                        post.find({ $and: [{ postby: req.body.userid }, { annonymous: false }] })
                            .sort({ reacts: -1 })
                            .populate("postby", 'name picture')
                            .populate("shared_post", 'postby text')
                            .populate("shared_post.postby", 'name picture')
                            .select('postby shared_post text total_react Comments total_comment total_shares created_date')
                            .exec((Error, result) => {
                                if (Error) res.json(error(Error))
                                else {
                                    user.aggregate([
                                        { $match: { _id: new ObjectId(req.body.userid) } }
                                        ,
                                        {
                                            $project:
                                            {
                                                years:
                                                {
                                                    $dateDiff:
                                                    {
                                                        startDate: "$created_date",
                                                        endDate: date,
                                                        unit: "year"
                                                    }
                                                },
                                                months:
                                                {
                                                    $dateDiff:
                                                    {
                                                        startDate: "$created_date",
                                                        endDate: date,
                                                        unit: "month"
                                                    }
                                                },
                                                days:
                                                {
                                                    $dateDiff:
                                                    {
                                                        startDate: "$created_date",
                                                        endDate: date,
                                                        unit: "day"
                                                    }
                                                },
                                                hour:
                                                {
                                                    $dateDiff:
                                                    {
                                                        startDate: "$created_date",
                                                        endDate: date,
                                                        unit: "hour"
                                                    }
                                                },
                                                minute:
                                                {
                                                    $dateDiff:
                                                    {
                                                        startDate: "$created_date",
                                                        endDate: date,
                                                        unit: "minute"
                                                    }
                                                },
                                                _id: 0
                                            }
                                        }
                                    ])
                                        .exec((Er, response) => {
                                            if (Er) res.json(Er)
                                            else {
                                                let obj = {
                                                    name: info.name,
                                                    follower: info.followers.length,
                                                    following: info.following.length,
                                                    time_pass_after_joining: response,
                                                    questions: result.length,
                                                    posts: result
                                                }
                                                res.json(Success(obj))
                                            }
                                        })
                                }
                            })
                    }
                    else if (req.body.require == "Latest") {
                        post.find({ $and: [{ postby: req.body.userid }, { annonymous: false }] })
                            .sort({ reacts: 1 })
                            .populate("postby", 'name picture')
                            .populate("shared_post", 'postby text')
                            .populate("shared_post.postby", 'name picture')
                            .select('postby shared_post text total_react Comments total_comment total_shares created_date')
                            .exec((Error, result) => {
                                if (Error) res.json(error(Error))
                                else {
                                    user.aggregate([
                                        { $match: { _id: new ObjectId(req.body.userid) } }
                                        ,
                                        {
                                            $project:
                                            {
                                                years:
                                                {
                                                    $dateDiff:
                                                    {
                                                        startDate: "$created_date",
                                                        endDate: date,
                                                        unit: "year"
                                                    }
                                                },
                                                months:
                                                {
                                                    $dateDiff:
                                                    {
                                                        startDate: "$created_date",
                                                        endDate: date,
                                                        unit: "month"
                                                    }
                                                },
                                                days:
                                                {
                                                    $dateDiff:
                                                    {
                                                        startDate: "$created_date",
                                                        endDate: date,
                                                        unit: "day"
                                                    }
                                                },
                                                hour:
                                                {
                                                    $dateDiff:
                                                    {
                                                        startDate: "$created_date",
                                                        endDate: date,
                                                        unit: "hour"
                                                    }
                                                },
                                                minute:
                                                {
                                                    $dateDiff:
                                                    {
                                                        startDate: "$created_date",
                                                        endDate: date,
                                                        unit: "minute"
                                                    }
                                                },
                                                _id: 0
                                            }
                                        }
                                    ])
                                        .exec((Er, response) => {
                                            if (Er) res.json(Er)
                                            else {
                                                let obj = {
                                                    name: info.name,
                                                    follower: info.followers.length,
                                                    following: info.following.length,
                                                    time_pass_after_joining: response,
                                                    questions: result.length,
                                                    posts: result
                                                }
                                                res.json(Success(obj))
                                            }
                                        })
                                }
                            })
                    }
                }
            })
    }
    else if (req.body.token == req.body.userid) {
        user.findById(req.body.userid, "name address followers following description")
            .exec((Err, info) => {
                if (Err) res.json(error(Err))
                else {
                    if (req.body.require == "Top") {
                        post.find({ postby: req.body.userid })
                            .sort({ reacts: -1 })
                            .populate("postby", 'name picture')
                            .populate("shared_post", 'postby text')
                            .populate("shared_post.postby", 'name picture')
                            .select('postby shared_post annonymous text total_react Comments total_comment total_shares created_date')
                            .exec((Error, result) => {
                                if (Error) res.json(error(Error))
                                else {
                                    user.aggregate([
                                        { $match: { _id: new ObjectId(req.body.userid) } }
                                        ,
                                        {
                                            $project:
                                            {
                                                years:
                                                {
                                                    $dateDiff:
                                                    {
                                                        startDate: "$created_date",
                                                        endDate: date,
                                                        unit: "year"
                                                    }
                                                },
                                                months:
                                                {
                                                    $dateDiff:
                                                    {
                                                        startDate: "$created_date",
                                                        endDate: date,
                                                        unit: "month"
                                                    }
                                                },
                                                days:
                                                {
                                                    $dateDiff:
                                                    {
                                                        startDate: "$created_date",
                                                        endDate: date,
                                                        unit: "day"
                                                    }
                                                },
                                                hour:
                                                {
                                                    $dateDiff:
                                                    {
                                                        startDate: "$created_date",
                                                        endDate: date,
                                                        unit: "hour"
                                                    }
                                                },
                                                minute:
                                                {
                                                    $dateDiff:
                                                    {
                                                        startDate: "$created_date",
                                                        endDate: date,
                                                        unit: "minute"
                                                    }
                                                },
                                                _id: 0
                                            }
                                        }
                                    ])
                                        .exec((Er, response) => {
                                            if (Er) res.json(Er)
                                            else {
                                                let obj = {
                                                    name: info.name,
                                                    follower: info.followers.length,
                                                    following: info.following.length,
                                                    time_pass_after_joining: response,
                                                    questions: result.length,
                                                    posts: result
                                                }
                                                res.json(Success(obj))
                                            }
                                        })
                                }
                            })
                    }
                    else if (req.body.require == "Latest") {
                        post.find({ postby: req.body.userid })
                            .sort({ reacts: 1 })
                            .populate("postby", 'name picture')
                            .populate({
                                path: 'shared_post',
                                select: 'postby text ',
                                populate: {
                                    path: 'postby',
                                    model: 'users',
                                    select: 'name picture'
                                }
                            })
                            // .populate("shared_post.postby",'name picture')
                            .select('postby shared_post annonymous text total_react Comments total_comment total_shares created_date')
                            .exec((Error, result) => {
                                if (Error) res.json(error(Error))
                                else {
                                    user.aggregate([
                                        { $match: { _id: new ObjectId(req.body.userid) } }
                                        ,
                                        {
                                            $project:
                                            {
                                                years:
                                                {
                                                    $dateDiff:
                                                    {
                                                        startDate: "$created_date",
                                                        endDate: date,
                                                        unit: "year"
                                                    }
                                                },
                                                months:
                                                {
                                                    $dateDiff:
                                                    {
                                                        startDate: "$created_date",
                                                        endDate: date,
                                                        unit: "month"
                                                    }
                                                },
                                                days:
                                                {
                                                    $dateDiff:
                                                    {
                                                        startDate: "$created_date",
                                                        endDate: date,
                                                        unit: "day"
                                                    }
                                                },
                                                hour:
                                                {
                                                    $dateDiff:
                                                    {
                                                        startDate: "$created_date",
                                                        endDate: date,
                                                        unit: "hour"
                                                    }
                                                },
                                                minute:
                                                {
                                                    $dateDiff:
                                                    {
                                                        startDate: "$created_date",
                                                        endDate: date,
                                                        unit: "minute"
                                                    }
                                                },
                                                _id: 0
                                            }
                                        }
                                    ])
                                        .exec((Er, response) => {
                                            if (Er) res.json(Er)
                                            else {
                                                let obj = {
                                                    name: info.name,
                                                    follower: info.followers.length,
                                                    following: info.following.length,
                                                    time_pass_after_joining: response,
                                                    questions: result.length,
                                                    posts: result
                                                }
                                                res.json(Success(obj))
                                            }
                                        })
                                }
                            })
                    }
                }
            })
    }
})
module.exports = router