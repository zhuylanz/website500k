const path = require('path');
const fs = require('fs');
const ngin = require('./engine.js')

const http = require('http');
const https = require('https');
const express = require('express');
const app = express();
const key = fs.readFileSync(__dirname + '/ssl.key', 'utf8');
const cert = fs.readFileSync(__dirname + '/ssl.crt', 'utf8');

const server = https.createServer({key: key, cert: cert}, express);
// const server = http.createServer(express);
server.listen(7002, () => console.log('server running or port 7002'));

const io = require('socket.io').listen(server);
const io_profile = io.of('/profile');
const io_group = io.of('/group');
const io_ad = io.of('/ad');

// app.use(express.static(__dirname + '/view'));

// app.get('/profile', (req, res) => {
// 	res.sendFile(__dirname + '/view/profile.html');
// });

// app.get('/group', (req, res) => {
// 	res.sendFile(__dirname + '/view/group.html');
// });

// app.get('/ad', (req, res) => {
// 	res.sendFile(__dirname + '/view/ad.html');
// });

io_profile.on('connection', function(socket) {
	let session_id = socket.id;
	let session_token, session_credential;
	console.log('>new user: ' + socket.id);


	socket.on('init', function(msg, fn) {
		session_token = msg;
		fn('>>token received!');
		console.log(msg);
	});

	socket.on('session-credential', function(msg, fn) {
		fn('>>credential received!');
		session_credential = msg;
	});

	socket.on('validateCredential', function(msg, fn) {
		console.log('>>validateCredential event')
		console.log(msg);
		ngin.validateCredential(msg.username, msg.password)
		.then(res => {
			fn(res);
		}).catch(err => {
			fn(err);
			console.log(err);
		});
	});

	socket.on('ngin-scanPost', function(msg, fn) {
		console.log('>>ngin-scanPost event');
		console.log(msg);
		ngin.Profile.scanPost(msg, session_token)
		.then(res => {
			fn(res);
		}).catch(err => {
			console.log('scanPost Err: ' + err);
			console.log('scanPost -> use fallback');

			ngin.Profile.scanPostPup(session_credential.username, session_credential.password, msg)
			.then(res => {
				fn(res);
			}).catch(err => {
				console.log(err);
			});

		});

	});

	socket.on('ngin-searchPage', function(msg, fn) {
		console.log('>>ngin-searchPage event');
		console.log(msg);
		ngin.Profile.searchPage(msg, session_token)
		.then(res => {
			fn(res);
		}).catch(err => {
			console.log('searchPage Err: ' + err);
		});

	});

	socket.on('ngin-searchGroup', function(msg, fn) {
		console.log('>>ngin-searchGroup event');
		console.log(msg);
		ngin.Profile.searchGroup(msg, session_token)
		.then(res => {
			fn(res);
		}).catch(err => {
			console.log('searchGroup Err: ' + err);
		});

	});

	socket.on('ngin-postProfile', function(msg, fn) {
		console.log('>>ngin-postProfile event');
		console.log(msg);
		ngin.Profile.postProfile(msg, session_token)
		.then(res => {
			fn(res);
		}).catch(err => {
			console.log('postProfile Err: ' + err);
		});

	});

	socket.on('ngin-postGroup', async function(msg, fn) {
		console.log('>>ngin-postGroup event');
		console.log(msg);
		let response = [];
		let gid_list = msg.gid.split(';');
		let wait_time = parseInt(msg.wait_time) * 1000;
		delete msg.gid;
		delete msg.wait_time;

		try {
			for (var i in gid_list) {
				let gid = gid_list[i];
				let res = await ngin.Profile.postGroup(gid, msg, session_token);
				response.push(res);
				socket.emit('logging', response);
				await ngin.wait(wait_time);
			}
			fn(response);
		} catch(err) {
			console.log(typeof(err));
			console.log('postGroup Err: ' + err);
		}
	});

	socket.on('ngin-scanFriend', function(msg, fn) {
		console.log('>>ngin-scanFriend event');
		console.log(msg);
		ngin.Profile.scanFriend(session_credential.username, session_credential.password)
		.then(res => {
			fn(res);
		}).catch(err => {
			console.log('scanFriend Err: ' + err);
		});
	});

	socket.on('ngin-interactFeed', function(msg, fn) {
		console.log('>>ngin-interactFeed event');
		console.log(msg);
		ngin.Profile.interactFeed(session_credential.username, session_credential.password, msg.reaction_type.toLowerCase(), msg.wait_time*1000)
		.then(res => {
			console.log(res);
			fn(res);
		}).catch(err => {
			console.log('interactFeed Err: ' + err);
		});
	});

	socket.on('ngin-postFriend', function(msg, fn) {
		console.log('>>ngin-postFriend event');
		console.log(msg);
		ngin.Profile.postFriend(session_credential.username, session_credential.password, msg.id_list.split('\n'), msg.content, msg.wait_time*1000)
		.then(res => {
			console.log(res);
			fn(res);
		}).catch(err => {
			console.log('postFriend Err: ' + err);
		});
	});

	socket.on('ngin-addFriend', function(msg, fn) {
		console.log('>>ngin-addFriend event');
		console.log(msg);
		ngin.Profile.addFriend(session_credential.username, session_credential.password, msg.id_list.split('\n'))
		.then(res => {
			console.log(res);
			fn(res);
		}).catch(err => {
			console.log('addFriend Err: ' + err);
		});
	});

	socket.on('ngin-unFriend', function(msg, fn) {
		console.log('>>ngin-unFriend event');
		console.log(msg);
		ngin.Profile.unFriend(session_credential.username, session_credential.password, msg.id_list.split('\n'))
		.then(res => {
			console.log(res);
			fn(res);
		}).catch(err => {
			console.log('unFriend Err: ' + err);
		});
	});


	socket.on('disconnect', function() { console.log('<user disconnected: ' + session_id); });
});


io_group.on('connection', function(socket) {
	let session_id = socket.id;
	let session_token, session_credential;
	console.log('>new user: ' + socket.id);


	socket.on('init', function(msg, fn) {
		session_token = msg;
		fn('>>token received!');
	});

	socket.on('session-credential', function(msg, fn) {
		seesion_credential = msg;
		fn('>>credential received!');
		console.log(msg);
	});

	socket.on('validateCredential', function(msg, fn) {
		console.log('>>validateCredential event')
		console.log(msg);
		ngin.validateCredential(msg.username, msg.password)
		.then(res => {
			fn(res);
		}).catch(err => {
			fn(err);
			console.log(err);
		});
	});

	socket.on('ngin-listGroup', (msg, fn) => {
		console.log('>>ngin-listGroup event');
		console.log(msg);
		ngin.Group.listGroup(session_token)
		.then(res => {
			fn(res);
		}).catch(err => {
			console.log('listGroup Err: ' + err);
		});
	});

	socket.on('ngin-listPost', (msg, fn) => {
		console.log('>>ngin-listPost event');
		console.log(msg);
		ngin.Group.listPost(msg.gid, session_token)
		.then(res => {
			fn(res);
		}).catch(err => {
			console.log('listPost Err: ' + err);
		});
	});

	socket.on('ngin-scheduleGroup', (msg, fn) => {
		console.log('>>ngin-scheduleGroup event');
		console.log(msg);
		if (msg.time) {
			ngin.Group.postSchedule(session_credential.username, session_credential.password, msg)
			.then(res => {
				fn(res);
			}).catch(err => {
				console.log('scheduleGroup Err: ' + err);
			});
		} else {
			let gid = msg.gid;
			delete msg.gid;
			delete msg.time;
			ngin.Group.post(gid, msg, session_token)
			.then(res => {
				fn(res);
			}).catch(err => {
				console.log('postGroup Err: ' + err);
			});
		}
	});

	socket.on('ngin-listMember', (msg, fn) => {
		console.log('>>ngin-listMember event');
		console.log(msg);
		ngin.Group.listMember(msg.gid, session_token)
		.then(res => {
			fn(res);
		}).catch(err => {
			console.log('listMember Err: ' + err);
		});
	});

	socket.on('ngin-kickMember', (msg, fn) => {
		console.log('>>ngin-kickMember event');
		console.log(msg);
		ngin.Group.kickMember(session_credential.username, session_credential.password, msg)
		.then(res => {
			fn(res);
		}).catch(err => {
			console.log('kickMember Err: ' + err);
		});
	});


	socket.on('disconnect', function() { console.log('<user disconnected: ' + session_id); });
});


io_ad.on('connection', function(socket) {
	let session_id = socket.id;
	let session_token, session_credential;
	console.log('>new user: ' + socket.id);


	socket.on('init', function(msg, fn) {
		session_token = msg;
		fn('>>token received!');
		console.log(msg);
	});

	socket.on('session-credential', function(msg, fn) {
		seesion_credential = msg;
		fn('>>credential received!');
		console.log(msg);
	});

	socket.on('validateCredential', function(msg, fn) {
		console.log('>>validateCredential event')
		console.log(msg);
		ngin.validateCredential(msg.username, msg.password)
		.then(res => {
			fn(res);
		}).catch(err => {
			fn(err);
			console.log(err);
		});
	});

	socket.on('ngin-listAd', (msg, fn) => {
		console.log('>>ngin-listAd event');
		console.log(msg);
		ngin.Ad.listAd(msg.act, session_token)
		.then(res => {
			fn(res);
		}).catch(err => {
			console.log('listAd Err: ' + err);
		});
	});

	socket.on('ngin-updateAd', (msg, fn) => {
		console.log('>>ngin-updateAd event');
		console.log(msg);
		for (var i in msg) {
			ngin.Ad.updateAd(msg[i].adset_id, msg[i].payload, session_token)
			.then(res => {
				fn(res);
			}).catch(err => {
				console.log('updateAd Err: ' + err);
			});
		}
	});
	

	socket.on('disconnect', function() { console.log('<user disconnected: ' + session_id); });
});