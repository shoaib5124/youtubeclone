// Importing express to create apis
const express = require("express");
const Router = express.Router();
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;
require("dotenv").config()
const User = require("../models/User")
const mongoose = require("mongoose");
const { request } = require("../App");
const jwt = require("jsonwebtoken")
const checkAuth = require("../Middleware/checkAuth")

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET // Click 'View API Keys' above to copy your API secret
});

// Signup api
Router.post('/signup', async(req,res)=>{

    // using try catch to handle function in better way
   try
   {

     const users = await User.find({email:req.body.email})
     if(users.length > 0)
     {
        return res.status(500).json({
            error:'email already registered'
        })
     }
    // using bcrypt to secure password
      const hashCode = await bcrypt.hash(req.body.password,10)
    //   console.log(hashCode)
    // using cloudinary to upload image
      const uploadedImage = await cloudinary.uploader.upload(req.files.logo.tempFilePath)
    //   console.log(uploadedImage,hashCode)

    // save data in database
    const newUser = new User({
        _id: new mongoose.Types.ObjectId,
        channelName:req.body.channelName,
        email:req.body.email,
        phone:req.body.phone,
        password:hashCode,
        logoUrl:uploadedImage.secure_url,
        logoId:uploadedImage.public_id
    })
     
      const user = await newUser.save()
      res.status(200).json({
        newUser:user
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

// Lgin Api
Router.post('/login',async(req,res)=>{
    try
    {
      // Find user against given email  
       const users = await User.find({email:req.body.email})     

      //If user does not find,it will return an empty array
      // So if length of array is zero show error 
       if(users.length==0){
        return res.status(500).json({
            error:'Email is not registered'
        })
       }
       
      //Compare the given and registerd password
       const isValid = await bcrypt.compare(req.body.password,users[0].password)
       if(!isValid)
       {
        return res.status(500).json({
          error: "Invalid Password"
        })
       }

      // Creating token after succesfull login
      const token = jwt.sign({
        _id:users[0]._id,
        channelName:users[0].channelName,
        email:users[0].email,phone:users[0].phone,
        logoId:users[0].logoId
      },
      'sbs shoaib ul hassan 123',
      {
        expiresIn:'365d'
      }
    )

      res.status(200).json({
        _id:users[0]._id,
        channelName:users[0].channelName,
        email:users[0].email,
        phone:users[0].phone,
        logoId:users[0].logoId,
        logoUrl:users[0].logoUrl,
        token:token,
        subscribers:users[0].subscribers,
        subscribedChannels:users[0].subscribedChannels
      })


    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error:"Something is wrong"
        })
    }
})

// Get logged-in user info
Router.get('/me', checkAuth, async (req, res) => {
  try {
    // Get token from header
    const token = req.headers.authorization.split(" ")[1];
    const verifiedUser = jwt.verify(token, 'sbs shoaib ul hassan 123');

    // Find user in DB
    const user = await User.findById(verifiedUser._id).select("-password"); // exclude password
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Invalid or expired token" });
  }
});


// Delete user Api
Router.delete('/:userId',checkAuth,async(req,res)=>{
   try
   {
      const token =  req.headers.authorization.split(" ")[1]
      const verifiedUser = await jwt.verify(token,'sbs shoaib ul hassan 123')
      const user = await User.findById(req.params.userId)             
      if(user._id == verifiedUser._id)      
      {
         // Delete user data from database
         await cloudinary.uploader.destroy(user.logoId)
         const deletedResponse = await User.findByIdAndDelete(req.params.userId,{
         resource_type:'user'
      })
         res.status(200).json({
            deletedResponse:deletedResponse
         })

      }
      else{
        return res.status(403).json({
          error:"Unathorized - You cannot delete this accout"
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

// subscribe api
Router.put('/subscribe/:userId',checkAuth,async(req,res)=>{
 try{
      const userA = await jwt.verify(req.headers.authorization.split(" ")[1],'sbs shoaib ul hassan 123')
      console.log(userA)
      const userB = await User.findById(req.params.userId)
      console.log(userB)
      if(userB.subscribedBy.includes(userA._id))
      {
        return res.status(500).json({
          error:"Already subscribed..."
        })
      }
      // console.log("Not subscribed")
      userB.subscribers += 1
      userB.subscribedBy.push(userA._id)
      await userB.save()
      const userAFullInfo = await User.findById(userA._id)
      await userAFullInfo.subscribedChannels.push(userB._id)
      await userAFullInfo.save()
      res.status(200).json({

        msg:"Subscribed"
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

// unsubscribe api
Router.put('/unsubscribe/:userId',checkAuth,async(req,res)=>{
  try
  {
     const userA = await jwt.verify(req.headers.authorization.split(" ")[1],'sbs shoaib ul hassan 123')
    //  console.log(userA)
     const userB = await User.findById(req.params.userId)
    //  console.log(userB)   
     if(userB.subscribedBy.includes(userA._id))
     {
      userB.subscribers -= 1
      userB.subscribedBy = userB.subscribedBy.filter(userId=>userId.toString()!= userA._id.toString())
      userB.save()
      const userAFullInfo = await User.findById(userA._id)
      console.log(userAFullInfo)
      userAFullInfo.subscribedChannels = userAFullInfo.subscribedChannels.filter(userId=>userId.toString()!= userB._id)
      await userAFullInfo.save()
      res.status(200).json({
        msg:"Unsubscribed"    
      })
     }
     else
     {
      return res.status(500).json({
        error:"You  did not subscribe channel"
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

module.exports = Router