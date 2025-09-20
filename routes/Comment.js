const express = require('express')
const Router = express.Router()
const Comment = require('../models/Comment')
const checkAuth = require('../Middleware/checkAuth')
const jwt = require('jsonwebtoken')
const mongoose  = require('mongoose')

Router.post('/new-comment/:videoId',checkAuth,async(req,res)=>{
    try
    {
        const token =  req.headers.authorization.split(" ")[1]
        const verifiedUser = await jwt.verify(token,'sbs shoaib ul hassan 123')
        console.log(verifiedUser)
        const newComment = new Comment({
            _id: new mongoose.Types.ObjectId,
            videoId:req.params.videoId,
            user_id:verifiedUser._id,
            commentText:req.body.commentText

        })
        const comment = await newComment.save()
        res.status(200).json({
            newComment:comment
        })
    }
    catch(err)
    {
        console.log(err)
        req.status(500).json({
            error:err
        })
    }
})

// Get api to get coments of a video
Router.get('/comments/:videoId',async(req,res)=>{
    try
    {
        const comments = await Comment.find({videoId:req.params.videoId}).populate('user_id','channelName logoUrl')
        res.status(200).json({
            commentList:comments
        })
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error:err
    })
    }
})
// Comment edit api
Router.put('/:commentId',checkAuth,async(req,res)=>{
    try
    {
        const token =  req.headers.authorization.split(" ")[1]
        const verifiedUser = await jwt.verify(token,'sbs shoaib ul hassan 123')
        console.log(verifiedUser)
        const comment = await Comment.findById(req.params.commentId)
        console.log(comment)
        if(comment.user_id.toHexString() !== verifiedUser._id)
        {
            return res.status(500).json({
                error:"Invalid User"
            })
        }

        comment.commentText = req.body.commentText
        const updatedComment = await comment.save()
        res.status(200).json({
            updatedComment:updatedComment
        })

    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
})

// Delete comment
Router.delete('/:commentId',checkAuth,async(req,res)=>{
   try
   {
      const token =  req.headers.authorization.split(" ")[1]
      const verifiedUser = await jwt.verify(token,'sbs shoaib ul hassan 123')
      const comment = await Comment.findById(req.params.commentId)             
      if(comment.user_id.toString() !== verifiedUser._id)      
      {
        return res.status(500).json({
            error:"Invalid User"
        })

      }
    // Delete comment
      const deletedComment = await Comment.findByIdAndDelete(req.params.commentId)

      res.status(200).json({
        deletedComment:deletedComment
      })

   }
   catch(err)
   {
      console.log(err)
      res.status(500).json({
         error:err
      })
      
   }
})
module.exports = Router;