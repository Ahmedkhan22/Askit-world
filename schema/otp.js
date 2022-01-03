const mongoose=require('mongoose')

const OtpModel=mongoose.Schema({
    mail:String,
    otp:String
})
module.exports=mongoose.model('otps',OtpModel)