const mongoose=require('mongoose')

const CategoryModel=mongoose.Schema({
    name:{
        type:String
    },
    today_count:{
        type:Number,
        default:0
    }
})

module.exports=mongoose.model('categories',CategoryModel)