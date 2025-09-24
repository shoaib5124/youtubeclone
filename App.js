// impoting express.js by require keyword
const  express = require("express");
// importing user routes
const userRoute = require("./routes/User");

// importing video routes
const videoRoute = require("./routes/Video");

// Importing comment routs
const commentRoute = require("./routes/Comment");

// importing body parser
const bodyParser = require("body-parser")

// importing file-upload to handle file uploading from client
const fileUpload = require("express-fileupload")

// importing dotenv
require('dotenv').config();

// Importing mongoose a library used to connect backend with database
const mongoose = require("mongoose");

const cors =require('cors');
// Using async await 
const connectWithDatabase = async()=>{
    // In case of successfull execution try will run
    try
    {
      const res = await mongoose.connect(process.env.MONGO_URL)
      console.log("connected with database...")
    }

    // In case of failure catch will run
    catch(err)
    {
      console.log(err)
    }
}

connectWithDatabase()


// creating app
const app = express();

app.use(cors())
// To read and acces client-sent data
app.use(bodyParser.json())

app.use(fileUpload({
    useTempFiles: true,
    // tempFileDir:'/temp'
}));

// root route
app.get("/", (req, res) => {
  res.send("🚀 API is running successfully");
});

// if anyone hits /user this main app will direct it to user route
app.use('/user',userRoute)

// if anyone hits /Comments this main app will direct it to user route
app.use('/comment',commentRoute)

// if anyone hits /video this main app will direct it to video route
app.use('/video',videoRoute)


module.exports =  app;   