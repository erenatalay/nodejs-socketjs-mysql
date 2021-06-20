console.log("server.js")

const express = require("express");
const cors = require("cors");
let app = express();
app.use(cors())

const Sequelize = require('sequelize');
var queryBuilder = require('eloquent-query-builder');
 const options = {
            host: '127.0.0.1',
            logging: false,
            dialect: 'mysql',
        }

const sequelized = new Sequelize("messages", "root", null, options);
const DBO = new queryBuilder(sequelized);

const {sequelize,Messages} = require("./models");

async function main() {
    await sequelize.sync()

try {
    await sequelize.authenticate();
    console.log('Connection has been database established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}
main();





let http = require("http").createServer(app);
let io = require("socket.io")(http,{
    cors: { 
        origin: "*",
        methods: ["GET", "POST"]
      }
});






 io.on("connection",  function (socket) {
    console.log("User connected", socket.id);


    socket.on("delete_message", async function (messageid) {
        try{
            await Messages.destroy({where : {id : messageid} })
            io.emit("delete_message",messageid)
        }
        catch(e){
            console.log(e)
        }
    })


    socket.on("new_message",async function (data) {
        console.log("Client says",data)


        try{
           let message =  await Messages.create({text : data})
            io.emit("new_message",{
                id : message.id,
                text : data
            })
        }catch(e){
            console.log(e)
        }

    })

});

app.get("/getmessages", async function (req,res,next) {
    let messages = await DBO.table('messages').get();

 

    return res.status(200).json({
        success : true,
        data : messages
    })
})

app.get("/", async function (req,res) {
    res.send("Hello world ")
   console.log ( await DBO.table('messages').where("id",1).get());
 
})

let port = 3000;
http.listen(port , function () {
    console.log("listening to port " + port);

});