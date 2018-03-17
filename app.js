const path = require('path');
const fs = require('fs');

const io = require('socket.io')(7000);
const io_profile = io.of('/profile');

const ngin = require('./engine.js')

let socket = function() {
	io_profile.on('connection', function(socket) {
		let session_id = socket.id;
		let session_token = '';
		console.log('>new user: ' + socket.id);


		socket.on('init', function(msg, fn) {
			session_token = msg;
			fn('>>token received!');
		});

		socket.on('ngin-scanPost', function(msg, fn) {
			console.log('>>ngin-scanPost event');

			ngin.Profile.scanPost(msg, session_token)
			.then(res => {
				fn(res);
			}).catch(err => {
				fn(err);
				console.log('scanPost Err: ' + err);
			});

		});

		socket.on('ngin-searchPage', function(msg, fn) {
			console.log('>>ngin-searchPage event');
			ngin.Profile.searchPage(msg, session_token)
			.then(res => {
				fn(res);
			}).catch(err => {
				console.log('searchPage Err: ' + err);
			});

		});

		socket.on('ngin-searchGroup', function(msg, fn) {
			console.log('>>ngin-searchGroup event');
			ngin.Profile.searchGroup(msg, session_token)
			.then(res => {
				fn(res);
			}).catch(err => {
				console.log('searchGroup Err: ' + err);
			});

		});

		socket.on('ngin-postProfile', function(msg, fn) {
			console.log('>>ngin-postProfile event');
			ngin.Profile.postProfile(msg, session_token)
			.then(res => {
				fn(res);
			}).catch(err => {
				console.log('postProfile Err: ' + err);
			});

		});

		socket.on('ngin-postGroup', async function(msg, fn) {
			console.log('>>ngin-postGroup event');
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
			ngin.Profile.scanFriend(msg.id, msg.pass)
			.then(res => {
				fn(res);
			}).catch(err => {
				console.log('scanFriend Err: ' + err);
			});
		});

		socket.on('ngin-interactFeed', function(msg, fn) {
			console.log('>>ngin-interactFeed event');
			console.log(msg);
			ngin.Profile.reactPost('zhuylanz20@gmail.com', 'iamarobot', msg.reaction_type.toLowerCase(), msg.wait_time*1000)
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
			ngin.Profile.postFriend('zhuylanz20@gmail.com', 'iamarobot', msg.id_list.split('\n'), msg.content, msg.wait_time*1000)
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
			ngin.Profile.addFriend('zhuylanz20@gmail.com', 'iamarobot', msg.id_list.split('\n'))
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
			ngin.Profile.unFriend('zhuylanz20@gmail.com', 'iamarobot', msg.id_list.split('\n'))
			.then(res => {
				console.log(res);
				fn(res);
			}).catch(err => {
				console.log('unFriend Err: ' + err);
			});
		});


		socket.on('disconnect', function() { console.log('<user disconnected: ' + session_id); });
	});

}

module.exports = socket;