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
					let daily_budget, camp_id, adset_id, ad_id, name, status, start, stop, impression, click, cost;
					daily_budget = res[i].daily_budget;
					status = res[i].status;

					if (res[i].ads) {
						for (var j in res[i].ads.data) {
							camp_id = res[i].ads.data[j].campaign_id;
							adset_id = res[i].ads.data[j].adset_id;
							ad_id = res[i].ads.data[j].id;
							name = res[i].ads.data[j].name;
							if (res[i].ads.data[j].insights) {
								start = res[i].ads.data[j].insights.data[0].date_start;
								stop = res[i].ads.data[j].insights.data[0].date_stop;
								impression = res[i].ads.data[j].insights.data[0].impressions;
								click = res[i].ads.data[j].insights.data[0].unique_clicks;
								cost = res[i].ads.data[j].insights.data[0].spend;
							}
							if (daily_budget == 0) {
								tbody += '<tr><td><input type="checkbox" value="'+camp_id+'-'+adset_id+'-'+ad_id+'"></td><td>'+ad_id+'</td><td>'+name+'</td><td><select><option>'+status+'</option><option>PAUSED</option><option>ACTIVE</option></select></td><td>'+start+'</td><td>'+stop+'</td><td>'+impression+'</td><td>'+click+'</td><td>'+cost+'</td><td>'+daily_budget+'</td></tr>';
							} else {					
								tbody += '<tr><td><input type="checkbox" value="'+camp_id+'-'+adset_id+'-'+ad_id+'"></td><td>'+ad_id+'</td><td>'+name+'</td><td><select><option>'+status+'</option><option>PAUSED</option><option>ACTIVE</option></select></td><td>'+start+'</td><td>'+stop+'</td><td>'+impression+'</td><td>'+click+'</td><td>'+cost+'</td><td><input type="text" value="'+daily_budget+'"></td></tr>';
							}
						}
					}


				}

				$('#ad-monitor tbody').html(tbody);
				console.log('listAd OK');
			});
		},
		updateAd: function() {
			let data = [];
			$('#ad-monitor input:checked').each((i, ele) => {
				var row = $(ele).closest('tr').index();
				var adset_id = $(ele).val().split('-')[1];
				var status = $(`#ad-monitor tr:nth-child(${row+1}) td:nth-child(4) select`).val();
				var daily_budget = $(`#ad-monitor tr:nth-child(${row+1}) td:nth-child(10) input`).val();
				if (daily_budget) {
					data.push({ adset_id: adset_id, payload: { status: status, daily_budget: daily_budget } });
				} else {
					data.push({ adset_id: adset_id, payload: { status: status } });
				}
			});
			if (data.length > 0) {
				socket.emit('ngin-updateAd', data, res => {
					console.log(res);
					this.listAd();
				});
			}
		}
	}
});

let token = 'EAACZC6awggg0BADZBzOM3Y1duuZBwrf9QREZCEMibUd5ZCJZCsVjNyxQTTx2bdwmvRHjqi9fq6ZAqEA28rfMP82GyvSvquItcP84xn8CDXbZAvqpo5I4WXrcL7Df6yk2MYV4lGZBO518pKBViZCULwQTZAmMc0uM29kYk5wZB2HjGgdTCEYZBbV9TIptn';
let uid = '100018229999393';

let socket = io('http://nuhula.website:7002/ad');
socket.on('connect', function () {
	socket.emit('init', token, (res) => { console.log(res); });
});