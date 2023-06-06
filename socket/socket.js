const io = require('socket.io');

module.exports = (server) => {
  const socketIO = io(server);

  socketIO.on('connection', (socket) => {
    console.log('A user connected');

    // test socket.io
    socket.on('test', (message) => {
        //
        console.log(message);
    });
  });

  return socketIO;
};
