const express = require("express")
const Router = express.Router()
const checkAuth = require("../Middleware/checkAuth")
const jwt = require("jsonwebtoken");
const { resource } = require("../App");
const cloudinary = require("cloudinary").v2;
const Video = require("../models/Video")
const mongoose = require("mongoose");

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET // Click 'View API Keys' above to copy your API secret
});

Router.post('/upload',checkAuth,async(req,res)=>{
   try
   {
     const token = req.headers.authorization.split(" ")[1]
     const user =  await jwt.verify(token,'sbs shoaib ul hassan 123')
     const uploadedVideo = await cloudinary.uploader.upload(req.files.video.tempFilePath,{
        resource_type:'video'
     })

     const uploadedThumbnail = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath)
    
       // save data in database
         const newVideo = new Video({
              _id: new mongoose.Types.ObjectId,
                title:req.body.title,
                description:req.body.description,
                user_id:user._id,
                videoUrl:uploadedVideo.secure_url,
                videoId:uploadedVideo.public_id,
                thumbnailUrl:uploadedThumbnail.secure_url,
                thumbnailId:uploadedThumbnail.public_id,
                category:req.body.category,
                tags:req.body.tags.split(","),
              
         })

         const newUploadedVideoData = await newVideo.save()
         res.status(200).json({
            newVideo:newUploadedVideoData
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

// Api for updating video detail

Router.put('/:videoId',checkAuth,async(req,res)=>{
   try
   {
      const token =  req.headers.authorization.split(" ")[1]
      const verifiedUser = await jwt.verify(token,'sbs shoaib ul hassan 123')
      // console.log(verifiedUser)
      const video = await Video.findById(req.params.videoId)
      // console.log(video)
      if(video.user_id == verifiedUser._id)
      {
         // Update Video Detail
         console.log("You are allowed")
         if(req.files)
         {
            // Update thumbnail and data
            await cloudinary.uploader.destroy(video.thumbnailId)
            const updatedThumnail = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath)
            const updatedData = {
               title:req.body.title,
               description:req.body.description,
               thumbnailUrl:updatedThumnail.secure_url,
               thumbnailId:updatedThumnail.public_id,
               category:req.body.category,
               tags:req.body.tags.split(","),
            }

            const updtedVideoDetail = await Video.findByIdAndUpdate(req.params.videoId,updatedData,{new:true})
            res.status(200).json({
               uploadedVideo:updtedVideoDetail

            })

         }
         else
         {
            const updatedData = {
               title:req.body.title,
               description:req.body.description,
               tags:req.body.tags.split(","),
            }

            const updtedVideoDetail = await Video.findByIdAndUpdate(req.params.videoId,updatedData)
            res.status(200).json({
               uploadedVideo:updtedVideoDetail

            })
         }

      }
      else
      {
        return res.status(500).json({
         error:'Only Creater can update video'
        }) 
      }


   }
   catch(err)
   {
      console.log(err)
      res.status(500).json({
         error:err
      })
   }
})

// Delete video Api
Router.delete('/:videoId',checkAuth,async(req,res)=>{
   try
   {
      const token =  req.headers.authorization.split(" ")[1]
      const verifiedUser = await jwt.verify(token,'sbs shoaib ul hassan 123')
      const video = await Video.findById(req.params.videoId)             
      if(video.user_id == verifiedUser._id)      
      {
         // Delete video thumbnail and data from database
         await cloudinary.uploader.destroy(video.videoId)
         await cloudinary.uploader.destroy(video.thumbnailId)
         const deletedResponse = await Video.findByIdAndDelete(req.params.videoId,{
         resource_type:'video'
         })
         res.status(200).json({
            deletedResponse:deletedResponse
         })

      }

   }
   catch(err)
   {
      console.log(err)
      res.status(500).json({
         error:err
      })
      
   }
})


// Video Like API
Router.put('/like/:videoId',checkAuth,async(req,res)=>{
   try
   {
      const token =  req.headers.authorization.split(" ")[1]
      const verifiedUser = await jwt.verify(token,'sbs shoaib ul hassan 123')
      console.log(verifiedUser)
      const video = await Video.findById(req.params.videoId)
      console.log(video)
      if(video.likedBy.includes(verifiedUser._id))
      {
         return res.status(500).json({
            err:"You have already liked this video"
         })
      }
      if(video.DisLikedBy.includes(verifiedUser._id))
      {
         video.dislikes -= 1;
         video.DisLikedBy = video.DisLikedBy.filter(userId=>userId.toString()!= verifiedUser._id)
      }   
      
         video.likes += 1;
         video.likedBy.push(verifiedUser._id)
         await video.save();
         return res.status(200).json({
            msg:"Conngradulation!You have liked video successfully"
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



// Video Dislike API
Router.put('/dislike/:videoId',checkAuth,async(req,res)=>{
   try
   {
      const token =  req.headers.authorization.split(" ")[1]
      const verifiedUser = await jwt.verify(token,'sbs shoaib ul hassan 123')
      console.log(verifiedUser)
      const video = await Video.findById(req.params.videoId)
      console.log(video)
      if(video.DisLikedBy.includes(verifiedUser._id))
      {
         return res.status(500).json({
            err:"You have already disliked this video"
         })
      }
      if(video.likedBy.includes(verifiedUser._id))
      {
         video.likes -= 1;
         video.likedBy = video.likedBy.filter(userId=>userId.toString()!= verifiedUser._id)
        
      }   
    
         video.dislikes += 1;
         video.DisLikedBy.push(verifiedUser._id)
         await video.save();
         return res.status(200).json({
            msg:"Conngradulation!You have disliked video successfully"
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

// Views Api
Router.put('/views/:videoId',async(req,res)=>{
   try
   {
      const video = await Video.findById(req.params.videoId)
      console.log(video)
      video.views += 1;
      await video.save();
      res.status(200).json({
      msg:'okkk'
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