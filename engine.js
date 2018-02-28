const rp = require('request-promise');


//ARRAY METHODs//
Object.defineProperty(Array.prototype, 'to1D', {
	enumerable: false, 
	value: function () {
		let newArr = [];
		for (let i = 0; i < this.length; i++) {
			newArr = newArr.concat(this[i]);
		}
		return newArr;
	}
});


//FUNCTIONS//
function fbReq(path, token, method, param) {
	let payload = {};
	for (let i in param) {
		let pair = param[i].split(':');
		payload[pair[0]] = pair[1];
	}
	let options = {
		method: method,
		uri: 'https://graph.facebook.com' + path,
		qs: {
			access_token: token
		},
		body: {
			payload: payload
		},
		json: true
	};
	return rp(options);
}

function fbRes(response_arr, field_arr, field_arr2, field_arr3) {
	let data = [];
	for (let i in response_arr) {
		let haveData;
		response_arr[i]['data'] ? haveData = true : haveData = false;
		switch (haveData) {
			case true:
			let res_data = response_arr[i]['data'];
			if (res_data.length == 0) {
				let fielddata = [''];
				data.push(fielddata);
			}
			for (let j in res_data) {
				let fielddata = [];
				for (let k in field_arr) {
					let field = field_arr[k];
					res_data[j][field] ? fielddata.push(res_data[j][field]) : fielddata.push('');
				}
				data.push(fielddata);
			}
			break;

			case false:
			let res = response_arr[i];
			let fielddata = [];
			for (let k in field_arr) {
				let field = field_arr[k];
				res[field] ? fielddata.push(res[field]) : fielddata.push('');
			}
			data.push(fielddata);
			break;
		}
	}
	if (field_arr2) {
		let data2 = fbRes(data.to1D(), field_arr2, field_arr3);
		return data2;
	} else {return data;}
}



(async function(){
	// let path = '/me?metadata=1';
	// let token = 'EAACZC6awggg0BAGQUNDOZAALjkW7ItUMzFCbxxscq6yfyQxqFUT2qUtM1jdOXBwuJZBe3R9W6xf2cazCBXvw7PGsK8ZCbtRX7oIrk8Eccpa7FbcSp7fGHo63GqHsHOx71W2wimywirtZCCIN1ZA5yxM6emDI01UFRcgAamkB8wXPNSoRhNO8iqOGKt7hYIEj18A3L8CVCAYAZDZD';

	// let a = await fbReq(path, token,);
	// let b = fbRes([a], ['metadata'], ['fields']);

	// console.log(b[0][0][0]);

	let a = [], b = [2], c = [5];
	console.log((a.concat(b)).concat(c));
})()


module.exports = {
	fbReq: fbReq,
	fbRes: fbRes
}