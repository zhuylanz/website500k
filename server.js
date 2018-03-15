const express = require('express');
const app = express();
const socket = require('./app.js');

app.use(express.static(__dirname + '/view'));

app.get('/profile', (req, res) => {
	res.sendFile(__dirname + '/view/profile.html');
});

app.listen(8002, () => console.log('Web Server Running on 8002'));
socket();