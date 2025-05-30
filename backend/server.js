import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import userRoutes from "./routes/users.js"; 
import {requireAuth} from "./middleware.js"

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }, 
});

app.use(express.json());
app.use(cors()); 

app.use("/api/users", userRoutes);
app.get("/", (req, res) => {
    res.send("Welcome to the Combined API and Signaling Server!");
});

let users = [];
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join-room", ({ user, roomID }) => {
        const usersInRoom = users.filter((u) => u.roomID === roomID);
        if (usersInRoom.length >= 2) {
            console.log(
                `Room ${roomID} is full. User ${user} (${socket.id}) denied entry.`
            );
            socket.emit("room-full", {
                error: "Room limit exceeded (2 users max).",
            });
            return; 
        }
        const isAlreadyInRoom = usersInRoom.some(
            (u) => u.socketId === socket.id
        );

        if (!isAlreadyInRoom) {
            socket.join(roomID);
            users.push({
                socketId: socket.id,
                userName: user,
                roomID,
            });
            console.log(
                `User ${user} (${
                    socket.id
                }) joined room ${roomID}. Current users in room: ${
                    users.filter((u) => u.roomID === roomID).length
                }`
            );
            io.to(roomID).emit("room-users-updated", {
                users: users.filter((u) => u.roomID === roomID),
            });
        } else {
            console.log(
                `User ${user} (${socket.id}) already in room ${roomID}. Re-joining.`
            );
            socket.join(roomID); 
        }
        const currentCount = users.filter((u) => u.roomID === roomID).length;
        socket.emit("users-in-room", { count: currentCount });
    });

    socket.on("check-users", ({ roomID }) => {
        const count = users.filter((u) => u.roomID === roomID).length;
        if (count > 2) {
            socket.emit("user-exceeded-limit", {
                error: "Room limit exceeded",
            });
        } else {
            socket.emit("users-in-room", { count });
        }
    });

    socket.on("newOffer", ({ offer, roomID }) => {
        console.log(`New offer from ${socket.id} to room ${roomID}`);
        socket.to(roomID).emit("waitingForOffer", { offer, from: socket.id });
    });

    socket.on("newAnswer", ({ answer, roomID }) => {
        console.log(`New answer from ${socket.id} to room ${roomID}`);
        socket.to(roomID).emit("waitingForAnswer", { answer, from: socket.id });
    });

    socket.on("sendIceCandidates", ({ ice, type, roomID }) => {
        console.log(
            `ICE candidate from ${socket.id} to room ${roomID}, type: ${type}`
        );
        socket
            .to(roomID)
            .emit("receiveIceCandidates", { ice, type, from: socket.id });
    });

    socket.on("newCodeInput", ({ input, roomID }) => {
        socket.to(roomID).emit("newCodeInputed", { input });
    });

    socket.on("newLangSelect", ({ lang, roomID }) => {
        socket.to(roomID).emit("newLanguage", { lang });
    });

    socket.on("Outputed", ({ output, roomID }) => {
        socket.to(roomID).emit("newOutput", { output });
    });

    socket.on("disconnect", () => {
        const disconnectedUser = users.find((u) => u.socketId === socket.id);
        const roomID = disconnectedUser ? disconnectedUser.roomID : null;
        users = users.filter((e) => e.socketId !== socket.id);
        console.log(socket.id, "disconnected");

        if (roomID) {
            const remainingUsersInRoom = users.filter(
                (u) => u.roomID === roomID
            );
            console.log(
                `Room ${roomID} now has ${remainingUsersInRoom.length} users.`
            );
            io.to(roomID).emit("room-users-updated", {
                users: remainingUsersInRoom,
            });
            io.to(roomID).emit("user-disconnected", {
                socketId: socket.id,
                userName: disconnectedUser?.userName,
            });
        }
    });
});

const PORT = process.env.PORT || 3000; 

server.listen(PORT, () => {
    console.log(`Combined server listening on http://localhost:${PORT}`);
    console.log(`API routes available at http://localhost:${PORT}/api/users`);
    console.log(`Socket.IO signaling available on ws://localhost:${PORT}`);

});
