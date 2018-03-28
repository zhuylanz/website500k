let Util = {
	_fallbacktoCSV: true,
	toXLS: function(tableId, filename) {
		this._filename = (typeof filename == 'undefined') ? tableId : filename;

		if ((this._getMsieVersion() || this._isFirefox()) && this._fallbacktoCSV) {
			return this.toCSV(tableId);
		} else if (this._getMsieVersion() || this._isFirefox()) {
			alert("Not supported browser");
		}

		var htmltable = document.getElementById(tableId);
		var html = htmltable.outerHTML;

		this._downloadAnchor("data:application/vnd.ms-excel" + encodeURIComponent(html), 'xls'); 
	},
	toCSV: function(tableId, filename) {
		this._filename = (typeof filename === 'undefined') ? tableId : filename;
		var csv = this._tableToCSV(document.getElementById(tableId));
		var blob = new Blob([csv], { type: "text/csv" });

		if (navigator.msSaveOrOpenBlob) {
			navigator.msSaveOrOpenBlob(blob, this._filename + ".csv");
		} else {      
			this._downloadAnchor(URL.createObjectURL(blob), 'csv');      
		}
	},
	_getMsieVersion: function() {
		var ua = window.navigator.userAgent;

		var msie = ua.indexOf("MSIE ");
		if (msie > 0) {
			return parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)), 10);
		}

		var trident = ua.indexOf("Trident/");
		if (trident > 0) {
			var rv = ua.indexOf("rv:");
			return parseInt(ua.substring(rv + 3, ua.indexOf(".", rv)), 10);
		}

		var edge = ua.indexOf("Edge/");
		if (edge > 0) {
			return parseInt(ua.substring(edge + 5, ua.indexOf(".", edge)), 10);
		}

		return false;
	},
	_isFirefox: function(){
		if (navigator.userAgent.indexOf("Firefox") > 0) {
			return 1;
		}

		return 0;
	},
	_downloadAnchor: function(content, ext) {
		var anchor = document.createElement("a");
		anchor.style = "display:none !important";
		anchor.id = "downloadanchor";
		document.body.appendChild(anchor);


		if ("download" in anchor) {
			anchor.download = this._filename + "." + ext;
		}
		anchor.href = content;
		anchor.click();
		anchor.remove();
	},
	_tableToCSV: function(table) {
		var slice = Array.prototype.slice;

		return slice
		.call(table.rows)
		.map(function(row) {
			return slice
			.call(row.cells)
			.map(function(cell) {
				return '"t"'.replace("t", cell.textContent);
			})
			.join(",");
		})
		.join("\r\n");
	},
	downloadTable: function(tableId, type) {
		if (type == 'CSV') {
			this.toCSV(tableId);
		} else if (type == 'XLS') {
			this.toXLS(tableId);
		}

	},
	printTable: function(tableId) {
		var divToPrint = document.getElementById(tableId);
		newWin = window.open("");
		newWin.document.write(divToPrint.outerHTML);
		newWin.print();
		newWin.close();
	},
	copyTable: function(tableId) {
		if (document.selection) {
			var range = document.body.createTextRange();
			range.moveToElementText(document.getElementById(tableId));
			range.select();
			document.execCommand("Copy");
		} else if (window.getSelection) {
			var range = document.createRange();
			range.selectNode(document.getElementById(tableId));
			window.getSelection().removeAllRanges();
			window.getSelection().addRange(range);
			document.execCommand("Copy");
		}
	},
	sortTable: function(tableId, column) {
		var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
		table = document.getElementById(tableId);
		switching = true;
		dir = "asc"; 
		while (switching) {
			switching = false;
			rows = table.getElementsByTagName("tr");
			for (i = 1; i < (rows.length - 1); i++) {
				shouldSwitch = false;
				x = rows[i].getElementsByTagName("td")[column];
				y = rows[i + 1].getElementsByTagName("td")[column];
				if (dir == "asc") {
					table.getElementsByTagName("th")[column].className = 'sorting_asc';
					if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
						shouldSwitch= true;
						break;
					}
				} else if (dir == "desc") {
					table.getElementsByTagName("th")[column].className = 'sorting_desc';
					if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
						shouldSwitch= true;
						break;
					}
				}
			}
			if (shouldSwitch) {
				rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
				switching = true;
				switchcount ++; 
			} else {
				if (switchcount == 0 && dir == "asc") {
					dir = "desc";
					switching = true;
				}
			}
		}
	},
	searchTable: function(inputId, tableId) {
		var input, filter, table, tr, td, i, j, shouldShow;
		input = document.getElementById(inputId);
		filter = input.value.toUpperCase();
		table = document.getElementById(tableId);
		tr = table.getElementsByTagName("tr");

		for (i = 1; i < tr.length; i++) {
			td = tr[i].getElementsByTagName("td");
			shouldShow = [];
			for (j = 0; j < td.length; j++) {
				if (td[j]) {
					if (td[j].innerHTML.toUpperCase().indexOf(filter) > -1) {
						shouldShow.push(true);
					}
				}
			}
			shouldShow.length > 0 ? tr[i].style.display = "" : tr[i].style.display = "none";
		}
	}
}

let validateCredential = function(n) {
	$('.validate .status').text('Đang xác thực thông tin');

	let payload = {
		username: $('.validate').eq(n).find('input').eq(0).val(),
		password: $('.validate').eq(n).find('input').eq(1).val(),
	}

	socket.emit('validateCredential', payload, res => {
		console.log(res);
		switch (res) {
			case 0:
			Credential.username = payload.username;
			Credential.password = payload.password;
			Credential.valid = true;
			socket.emit('session-credential', Credential, res => {
				console.log(res);
			});
			$('.validate').hide();
			$('.need-validate').removeClass('need-validate');
			break;

			case 1:
			$('.validate .status').text('');
			alert('Thông tin đăng nhập không chính xác');
			break;

			case 2:
			$('.validate .status').text('');
			alert('Không hỗ trợ tài khoản sử dụng bảo mật 2 lớp');
			break;
		}
	});
}

let Credential = {
	username: '',
	password: '',
	valid: false,
}


//FACEBOOK PLUGIN
(function(d, s, id){
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) {return;}
	js = d.createElement(s); js.id = id;
	js.src = "https://connect.facebook.net/en_US/sdk.js";
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

window.fbAsyncInit = function() {
	FB.init({
		appId      : '211010336096781',
		cookie     : true,
		xfbml      : true,
		version    : 'v2.12'
	});

	FB.AppEvents.logPageView();

	FB.getLoginStatus(function(res) {
		fbInited = true;
		socket.emit('fb-login', res, fn => {console.log(fn)});

		if (res.status === 'connected') {
			alert('logined');
		} else if (res.status === 'not_authorized') {
			alert('not logined');

		} else {
			alert('not notnotnot');
		}

	});

};

function fbEnsureInit(callback) {
	if(!fbInited) {
		setTimeout(function() {fbEnsureInit(callback);}, 50);
	} else {
		if(callback) {
			callback();
		}
	}
}

$(document).ready(function() {
	
});