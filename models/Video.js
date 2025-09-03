const mongoose = require("mongoose")

const videoSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    title:{type:String,required:true},
    description:{type:String,required:true},
    user_id:{type:String,required:true},
    videoUrl:{type:String,required:true},
    videoId:{type:String,required:true},
    thumbnailUrl:{type:String,required:true},
    thumbnailId:{type:String,required:true},
    category:{type:String,required:true},
    tags:[{type:String}],
    likes:{type:Number,default:0,},
    dislikes:{type:Number,default:0},
    likedBy:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
    DisLikedBy:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
    views:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],


},{timestamps:true})

module.exports = mongoose.model('Video',videoSchema);