let ioInstance = null;

function setIo(io) {
  ioInstance = io;
}

function getIo() {
  if (!ioInstance) {
    throw new Error("Socket.IO has not been configured yet");
  }

  return ioInstance;
}

module.exports = {
  setIo,
  getIo,
};
