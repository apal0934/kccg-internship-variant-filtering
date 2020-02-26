var socket_io = require("socket.io");
var io = socket_io();
var socketApi = {};

socketApi.io = io;

io.on("connection", function(socket) {
  console.log("A user connected");

  socket.join("test");
});

socketApi.sendNotification = function() {
  io.sockets.emit("progress", {
    test: "test"
  });
};
module.exports = socketApi;
