import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: { origin: "*" },
});

let users = [];

io.on("connection", (socket) => {
    socket.on("new-user", (user) => {
        users.push({
            socketId: socket.id,
            userName: user,
        });
        console.log(users, socket.id);
    });
    socket.on("newOffer", (offerData) => {
        socket.broadcast.emit("waitingForOffer", offerData);
    });
    socket.on("newAnswer", (answerData) => {
        socket.broadcast.emit("waitingForAnswer", answerData);
    });
    socket.on("sendIceCanditates", (iceC) => {
        socket.broadcast.emit("recieveIceCanditates", iceC);
        console.log(iceC);
        for (let i = 0; i < users.length; i++) {
            if (iceC.userId === users[i].socketId) {
                users[i].ice = iceC.ice;
            }
        }
    });
    socket.on("disconnect", () => {
        const removeUser = users.filter((e) => e.socketId !== socket.id);
        users = removeUser;
        console.log(socket.id, "f it");
    });
});

server.listen(3000, () => {
    console.log("listening on http://localhost:3000");
});
