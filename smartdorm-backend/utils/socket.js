const { Server } = require("socket.io");

let io;

module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: "*", // Adjust as per your FE URL
        methods: ["GET", "POST"]
      }
    });

    io.on("connection", (socket) => {
      console.log("New socket connection:", socket.id);

      // Join a room specific to the user
      socket.on("join", (userId) => {
        socket.join(`user:${userId}`);
        console.log(`User ${userId} joined room: user:${userId}`);
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  }
};
