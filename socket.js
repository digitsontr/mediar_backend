const socketIo = require("socket.io");
let io;

const initSocket = (httpServer) => {
  console.log("\n\n _SOCKET1: Socket.io initialized..");

  io = socketIo(httpServer);

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("\n\n _SOCKET2: Socket.io not initialized!");
  }
  return io;
};

const setIO = (newIo) => {
  io = newIo;
  this.io = newIo;
  
  return io;
};

module.exports = {
  initSocket,
  getIO,
  setIO,
};
