let Main_vue = new Vue({

	el: '#vue-region',

	data: {
		group_list: [],
		group_list_obj: {},
	},

	computed: {
	},

	methods: {
		fnSelect: function(e) {
			$('.fn').hide();
			if (e.srcElement) $('#'+e.srcElement.className).show();
			if (e.originalTarget) $('#'+e.originalTarget.className).show();
		},
		listGroup: function() {
			socket.emit('ngin-listGroup', uid, res => {
				res = res.data;
				for (var i in res) {
					this.group_list.push(res[i]);
					this.group_list_obj[res[i].name] = res[i];
				}
			});
		},
		listPost: function() {
			socket.emit('ngin-listPost', {
				gid: this.group_list_obj[$('#group-post select').val()].id
			}, res => {
				let tbody = '';
				res = res.data;
				for (var i in res) {
					if (res[i].message) {
						let link = 'https://facebook.com/' + res[i].id;
						tbody += '<tr><td>' + res[i].id + '</td><td>' + res[i].message + '</td><td><a target="_blank" href="'+ link +'">' + link + '</a></td></tr>';
					}
				}

				$('#group-post tbody').html(tbody);
				console.log('listPost OK');
			});
		},
		scheduleGroup: function() {
			socket.emit('ngin-scheduleGroup', {
				gid: this.group_list_obj[$('#group-post select').val()].id,
				message: $('#group-post textarea').val(),
				time: new Date($('#group-post input').val()).getTime()/1000,
			}, res => {
				console.log(res);
				console.log('scheduleGroup OK');
			});
		}
	}
});

let token = 'EAACZC6awggg0BAAfqMGoQddEerEm1RILFVDfrgBJIQHsWS9QgcOnWleRcxLXeZB7XWs5nBnrrf2YhMvZBBQjmK0iAZBUDec7xce7XBoxZB3kPiAjvn8bQKEJ82DYgyXPM42ZCeK27uhtbJA3je7naW1wrCxSx9JXWLrh9F8QnNrwZDZD';
let uid = '100018229999393';

let socket = io('localhost:7002/group');
socket.on('connect', function () {
	socket.emit('init', token, (res) => { console.log(res); });
});

Main_vue.listGroup();