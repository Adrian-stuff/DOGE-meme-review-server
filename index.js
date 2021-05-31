require("dotenv").config();
const express = require("express");
const { fetchMeme, getMeme } = require("./src/Services/getMeme");
const app = express();
const path = require("path");
const http = require("http").Server(app);
const { Server } = require("socket.io");
const io = new Server(http, {
  cors: {
    origin: "https://doge-meme-review.web.app/",
    methods: ["GET", "POST"],
  },
});
const PORT = process.env.PORT || 8000;
let rooms = new Map();
let connectedUsers = {};
io.on("connection", (socket) => {
  console.log("A user is connected");

  socket.on("disconnect", () => {
    let userData = connectedUsers[socket.id];
    if (typeof userData !== "undefined") {
      socket.leave(connectedUsers[socket.id]);
      io.emit("getAllRooms", rooms);
      rooms.delete(socket.id);
      delete connectedUsers[socket.id];
    }
  });

  socket.on("reqMeme", async (subreddit) => {
    const data = await fetchMeme(subreddit, connectedUsers[socket.id].room);
    console.log(subreddit);
    console.log(connectedUsers[socket.id].room);
    io.to(connectedUsers[socket.id].room).emit(
      "reqMeme",
      data[data.length - 1].results
    );
  });

  socket.on("joinRoom", async (req, callback) => {
    if (
      req.room.replace(/\s/g, "").length > 0 &&
      req.username.replace(/\s/g, "").length > 0
    ) {
      // set users and connect users
      connectedUsers[socket.id] = req;
      socket.join(req.room);
      const data = getMeme(req.room);

      socket.broadcast.to(connectedUsers[socket.id].room).emit("userJoined", {
        username: "System",
        message: `${req.username} joined the room!`,
      });

      socket.emit("reqMeme", data[data.length - 1].results);
      callback({
        success: true,
      });
    } else {
      callback({
        success: false,
        message: "Please fill out the form",
      });
    }
  });

  socket.on("getAllRooms", () => {
    Object.keys(connectedUsers).forEach((e) => {
      rooms.set(e, connectedUsers[e].room);
    });
    // console.log([...new Set(rooms.values())]);
    socket.emit("getAllRooms", [...new Set(rooms.values())]);
  });

  socket.on("message", (req) => {
    io.to(connectedUsers[socket.id].room).emit("message", req);
  });
});

http.listen(PORT, () => console.log(`Server started on port ${PORT}`));
