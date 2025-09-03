const jwt = require("jsonwebtoken")
module.exports = async(req,res,next)=>{
    try
    {
        // Gettih token to verify it
        const token = req.headers.authorization.split(" ")[1]
        await jwt.verify(token,'sbs shoaib ul hassan 123')
        next()
  
    }
    catch(err)
    {
        console.log(err)
        return res.status(500).json({
            error:"Invalid Token"
        })
    }
}