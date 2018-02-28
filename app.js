const path = require('path');
const fs = require('fs');

const io = require('socket.io')(1234);
const io_profile = io.of('/profile');


//-----socketIO-----//
io.on('connection', function (socket) {
	let session_id = socket.id;
	console.log('>new user: ' + socket.id);


	socket.on('message', function (msg) {
		console.log(msg);
		socket.emit('message', 'hola')
	});
	socket.on('disconnect', function () { });
});

