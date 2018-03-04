const express = require('express');
const app = express();

app.use(express.static(__dirname));

app.get('/profile', (req, res) => {
	res.sendFile(__dirname + '/view/profile.html');
});

app.listen(3000, () => console.log('Web Server Running on 3000'));