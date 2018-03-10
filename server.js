const express = require('express');
const app = express();
const socket = require('./app.js');

app.use(express.static(__dirname));

app.get('/profile', (req, res) => {
	res.sendFile(__dirname + '/view/profile.html');
});

app.listen(3214, () => console.log('Web Server Running on 3214'));
socket();