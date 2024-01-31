// socket.js
const socketIo = require("socket.io");
let io;

module.exports = {
  init: (httpServer) => {
    console.log("Socket.io initialized..");

    io = socketIo(httpServer);
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },
};
