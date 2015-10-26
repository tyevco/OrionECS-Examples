
var express = require('express'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	game = require("./game.js");

var port = process.env.port || 1337;

// define routes.
app.get('/', function (req, res) {
	res.sendFile(__dirname + '/view/main.html');
});

var userCount = 0;
// Setup IO connection listener
io.on('connection', function (socket) {
	userCount++;
	
	console.log('a user connected, active users: ' + userCount);
	socket.broadcast.emit('serv usr conn', 'A user has connected.');
	
	// Specify socket listeners
	socket.on('disconnect', function () {
		userCount--;
		console.log('user disconnected, active users: ' + userCount);
	});
});

// start server.
http.listen(port, function () {
	console.log('HTTP server listening on *:' + port);
});

game(io)();