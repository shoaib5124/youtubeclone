// Importing HTTP library
const http = require("http");

// Importing app.js to put in server
const app = require("./App");

// Creating server
const server = http.createServer(app);

// Difining port
const port = 3000;
// Listen server on port
server.listen(port,()=>{
    console.log(`An app is runnig on port ${port}`)
})