let Main_vue = new Vue({

	el: '#vue-region',

	data: {
	},

	computed: {
	},

	methods: {
		fnSelect: function(e) {
			$('.fn').hide();
			if (e.srcElement) $('#'+e.srcElement.className).show();
			if (e.originalTarget) $('#'+e.originalTarget.className).show();
		},
		listAd: function() {
			socket.emit('ngin-listAd', {
				act: $('#ad-monitor input.text').val()
			}, res => {
				let tbody = '';
				res = res.data;
				for (var i in res) {
					let id, name, status, start, stop, impression, click, cost;
					id = res[i].id;
					name = res[i].name;
					status = res[i].effective_status;
					if (res[i].insights) {
						start = res[i].insights.data[0].date_start;
						stop = res[i].insights.data[0].date_stop;
						impression = res[i].insights.data[0].impressions;
						click = res[i].insights.data[0].unique_clicks;
						cost = res[i].insights.data[0].spend;
					}

					tbody += '<tr><td><input type="checkbox" value="'+id+'"></td><td>'+id+'</td><td>'+name+'</td><td>'+status+'</td><td>'+start+'</td><td>'+stop+'</td><td>'+impression+'</td><td>'+click+'</td><td>'+cost+'</td></tr>';
				}

				$('#ad-monitor tbody').html(tbody);
				console.log('listAd OK');
			});
		},
	}
});

let token = 'EAACZC6awggg0BADZBzOM3Y1duuZBwrf9QREZCEMibUd5ZCJZCsVjNyxQTTx2bdwmvRHjqi9fq6ZAqEA28rfMP82GyvSvquItcP84xn8CDXbZAvqpo5I4WXrcL7Df6yk2MYV4lGZBO518pKBViZCULwQTZAmMc0uM29kYk5wZB2HjGgdTCEYZBbV9TIptn';
let uid = '100018229999393';

let socket = io('localhost:7002/ad');
socket.on('connect', function () {
	socket.emit('init', token, (res) => { console.log(res); });
});