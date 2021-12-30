const express = require("express");
const path = require("path");
const port = process.env.PORT || 5500;
const app = express();
const server = require("http").createServer(app);

const io = require("socket.io")(server);
app.use(express.static(path.join(__dirname+'/')));

var id = [];
var recentId;
io.on("connection", function(socket){
    socket.on("sender-join", function(data){
        socket.join(data.uid);
        recentId = data.uid;
        id.push(data.uid);
    });
    socket.on("receiver-id-check", ids =>{
        if(!id.includes(ids)){
            console.log("invalid id");
            socket.emit("invalid", 1);
        }
    });
    socket.on("reveiver-join", function(data){
        socket.join(data.uid);
        socket.in(data.sender_uid).emit("init", data.uid);
    });
    socket.on("file-meta", function(data){
        socket.in(data.uid).emit("fs-meta", data.metadata);
    });
    socket.on("fs-start", function(data){
        socket.in(data.uid).emit("fs-share", {});
    });
    socket.on("file-raw", function(data){
        socket.in(data.uid).emit("fs-share", data.buffer);
    });
    socket.on("exit-receiver", (data) => {
        socket.in(data.uid).emit("exit-rev");
    });
    socket.on("exit-sender", (data) => {
        for (let i = 0; i < id.length; i++) {
            if (id[i] == data.uid) {
                const removedElements = id.splice(i, 1);
                i--;
                break;
            }
        }
        socket.in(data.uid).emit("exit-send");
    });

    socket.on("disconnect", (data) => {
        for (let i = 0; i < id.length; i++) {
            if (id[i] == recentId) {
                const removedElements = id.splice(i, 1);
                i--;
                break;
            }
        }
    });
});

server.listen(port);
