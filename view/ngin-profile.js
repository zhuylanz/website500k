let Main_vue = new Vue({

	el : '#vue-region',

	data : {
		log_scanPost : [],
		log_search : [],
		log_post : [],
		log_scanFriend : [],
	},

	methods : {
		fnSelect : function(e) {
			$('.fn').hide();
			if (e.srcElement) $('#'+e.srcElement.className).show();
			if (e.originalTarget) $('#'+e.originalTarget.className).show();
		},
		scanPost : function() {
			$('#scan-post .status').text('Đang tải thông tin. Vui lòng đợi!');
			$('#scan-post .status').css('visibility', 'visible');

			socket.emit('ngin-scanPost', $('#scan-post input.text').val(), res => {
				if (res.error) {
					console.log(res.error);
					$('.status-bar').text('Có lỗi xảy ra vì request không hợp lệ').css('visibility', 'visible');
					setTimeout(() => { $('.status-bar').css('visibility', 'hidden'); }, 5000);

				} else {
					$('#scan-post .status').css('visibility', 'hidden');
					let reaction = res.reactions.data;
					let comment = res.comments.data;
					let tbody_reaction = '';
					let tbody_comment = '';
					for (var i in reaction) {
						tbody_reaction += '<tr><td>' + reaction[i].id + '</td><td>' + reaction[i].name + '</td><td>' + reaction[i].type + '</td></tr>';
					}
					for (var j in comment) {
						tbody_comment += '<tr><td>' + comment[j].from.id + '</td><td>' + comment[j].from.name + '</td><td>' + comment[j].message + '</td></tr>';
					}

					$('#scan-post #reaction-tbl tbody').html(tbody_reaction);
					$('#scan-post #comment-tbl tbody').html(tbody_comment);
				}
				console.log('scan post OK');
			});
		},
		scanFriend : function() {
			socket.emit('ngin-scanFriend', {
				id: '',
				pass: ''
			},
			res => {
				let tbody = '';
				let count = 0;
				for (var i in res) {
					tbody += '<tr><td>' + res[i][0] + '</td><td>' + res[i][1] + '</td><td><a target="_blank" href="https://'+res[i][2]+'">https://'+res[i][2]+'</a></td></tr>';
					count++
				}
				tbody += '<tr><td><b>Tổng cộng:</b></td><td><b>' + count + '</b></td><td><b>Bạn bè</b></td></tr>';
				$('#scan-friend tbody').html(tbody);
				console.log('scan friend OK');
			});
		},
		search : function() {
			if ($('#search-page input.radio').eq(1).is(':checked')) {
				socket.emit('ngin-searchGroup', $('#search-page input.text').val(), res => {
					let tbody = '';
					res = res.data;
					for (var i in res) {
						var link = 'https://facebook.com/' + res[i].id;

						tbody += '<tr><td>' + res[i].id + '</td><td>' + res[i].name + '</td><td><a target="_blank" href="'+link+'">' + link + '</a></td></tr>';
					}
					$('#search-page th').eq(3).hide();
					$('#search-page tbody').html(tbody);
					console.log('search group OK');
				});
			} else {
				socket.emit('ngin-searchPage', $('#search-page input.text').val(), res => {
					let tbody = '';
					res = res.data;
					for (var i in res) {
						tbody += '<tr><td>' + res[i].id + '</td><td>' + res[i].name + '</td><td><a target="_blank" href="'+res[i].link+'">' + res[i].link + '</a></td><td>' + res[i].fan_count + '</td></tr>';
					}
					$('#search-page th').eq(3).show();
					$('#search-page tbody').html(tbody);

					console.log('search page OK');
				});
			}
		},
		post : function() {
			if ($('#post input.radio').eq(1).is(':checked')) {
				socket.emit('ngin-postGroup', {
					message: $('#post input.text').eq(0).val(),
					link: $('#post input.text').eq(1).val(),
					gid: $('#post input.text').eq(2).val(),
					wait_time: $('#post input.text').eq(3).val()
				}, res => {
					console.log('post group OK');
					socket.removeListener('logging', logging);
				});
				function logging(msg) {
					console.log('logging');
					let tbody = '';
					for (var i in msg) {
						let link = 'https://facebook.com/'+msg[i].id;
						tbody += '<tr><td>'+msg[i].id+'</td><td><a target="_blank" href="'+link+'">'+link+'</a></td></tr>';
					}
					$('#post tbody').html(tbody);
				}
				socket.on('logging', logging);
			} else {
				socket.emit('ngin-postProfile', {
					message: $('#post input.text').eq(0).val(),
					link: $('#post input.text').eq(1).val()
				}, res => {
					let link = 'https://facebook.com/'+res.id;
					let tbody = '';
					tbody += '<tr><td>'+res.id+'</td><td><a target="_blank" href="'+link+'">'+link+'</a></td></tr>';
					$('#post tbody').html(tbody);
					console.log('post profile OK');
				});
			}
		},
		interactFeed : function() {
			socket.emit('ngin-interactFeed', {
				reaction_type: $('#newsfeed select').val(),
				wait_time: $('#newsfeed input.text').val()
			}, res => {
				console.log(res);
				let tbody = '';
				for (var i in res) {
					let link = 'https://facebook.com/' + res[i];
					tbody += '<tr><td>' + res[i] + '</td><td><a target="_blank" href="'+ link +'">' + link + '</a></td></tr>';
				}
				$('#newsfeed tbody').html(tbody);
				console.log('interact feed OK');
			});
		},
		postFriend : function() {
			socket.emit('ngin-postFriend', {
				id_list: $('#post-friend textarea').eq(0).val(),
				content: $('#post-friend textarea').eq(1).val(),
				wait_time: $('#post-friend input.text').val()
			}, res => {
				console.log(res);
				res = res.id_list;
				let tbody = '';
				for (var i in res) {
					let link = 'https://facebook.com/' + res[i];
					tbody += '<tr><td>' + res[i] + '</td><td><a target="_blank" href="'+ link +'">' + link + '</a></td></tr>';
				}
				$('#post-friend tbody').html(tbody);
				console.log('post friend OK');
			});
		},
		editFriend : function() {
			if ($('#edit-friend input.radio').eq(1).is(':checked')) {
				socket.emit('ngin-unFriend', {
					id_list: $('#edit-friend textarea').eq(0).val()
				}, res => {
					console.log(res);
					res = res.id_list;
					let tbody = '';
					for (var i in res) {
						let link = 'https://facebook.com/' + res[i];
						tbody += '<tr><td>' + res[i] + '</td><td><a target="_blank" href="'+ link +'">' + link + '</a></td></tr>';
					}
					$('#edit-friend tbody').html(tbody);
					console.log('unfriend OK');
				});
				
			} else {
				socket.emit('ngin-addFriend', {
					id_list: $('#edit-friend textarea').eq(0).val()
				}, res => {
					console.log(res);
					res = res.id_list;
					let tbody = '';
					for (var i in res) {
						let link = 'https://facebook.com/' + res[i];
						tbody += '<tr><td>' + res[i] + '</td><td><a target="_blank" href="'+ link +'">' + link + '</a></td></tr>';
					}
					$('#edit-friend tbody').html(tbody);
					console.log('addfriend OK');
				});
			}
		},
	}
});

let token = 'EAACZC6awggg0BAAfqMGoQddEerEm1RILFVDfrgBJIQHsWS9QgcOnWleRcxLXeZB7XWs5nBnrrf2YhMvZBBQjmK0iAZBUDec7xce7XBoxZB3kPiAjvn8bQKEJ82DYgyXPM42ZCeK27uhtbJA3je7naW1wrCxSx9JXWLrh9F8QnNrwZDZD';

// let socket = io('http://service.nuhula.website/profile');
// let socket = io('localhost:7002/profile');
let socket = io('https://tool.website500k.com:7002/profile');