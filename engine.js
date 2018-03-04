const rp = require('request-promise');
const puppeteer = require('puppeteer');


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
//ARRAY METHODs//


//1ST FUNCTIONS//
function fbReq(path, token, method, payload) {
	let options = {
		method: method,
		uri: 'https://graph.facebook.com' + path,
		qs: {
			access_token: token
		},
		body: payload,
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
//1ST FUNCTIONS//


//2ND FUNCTIONS//
async function loginFb(id, pass) {
	let jquery = await rp('https://code.jquery.com/jquery-3.3.1.min.js');
	let browser = await puppeteer.launch({ headless : true });
	let page = await browser.newPage();
	await page.goto('https://facebook.com', { waitUntil : 'domcontentloaded', timeout : 20000 });
	await page.addScriptTag({content : jquery});
	await page.evaluate(({id: id, pass: pass}) => {
		$('#email').val(id);
		$('#pass').val(pass);
		$("input[data-testid='royal_login_button']").click();
	}, {id: id, pass: pass});

	return { browser: browser, page: page, jquery: jquery };
}


async function scanFriendPup(id, pass) {
	let Passed = await loginFb(id, pass);
	let browser = Passed.browser;
	let page = Passed.page;
	let jquery = Passed.jquery;

	try{
		await page.waitFor(2000);
		await page.goto('https://facebook.com/me/friends', { waitUntil : 'domcontentloaded', timeout : 20000 });
		await page.addScriptTag({content : jquery});
		while (true) {
			console.log('--scrolling--');
			let height = await page.evaluate(() => {
				window.scrollBy(0, document.documentElement.scrollHeight);
				return document.documentElement.scrollHeight;
			});
			await page.waitFor(2000);
			let newHeight = await page.evaluate(() => {
				window.scrollBy(0, document.documentElement.scrollHeight);
				return document.documentElement.scrollHeight;
			});
			if (height == newHeight) { break; }
			await page.waitFor(2000);
		}
		console.log('--stop scrolling--');
		let friend_uid_list = await page.evaluate(() => {
			let userdata = '';
			$('div.fsl>a').each((i, ele) => {
				let data = $(ele);
				if (data.attr('data-gt')) {
					userdata += data.text() + ':' + JSON.parse(data.attr('data-gt')).engagement.eng_tid + ';';
				}

			});
			userdata = userdata.split(';').map(x => x.split(':'));
			return userdata;
		});
		console.log(friend_uid_list);
		browser.close();

		return friend_uid_list;
	} catch(e) {
		browser.close();
		console.log(e);
		throw new Error(e);
	}


}


let Profile = {
	scanPostReact : function(pid, token) {
		let path = '/' + pid + '?fields=reactions.limit(5000)';
		return fbReq(path, token);
	},
	scanPostComment : function(pid, token) {
		let path = '/' + pid + '?fields=comments.limit(5000)';
		return fbReq(path, token);
	},
	searchPage : function(keyword, token) {
		let path = '/search?type=page&limit=5000&q=' + keyword + '&fields=id,username,name,link,category,fan_count,location';
		return fbReq(path, token);
	},
	searchGroup : function(keyword, token) {
		let path = '/search?type=group&limit=5000&q=' + keyword + '&fields=id,name,owner';
		return fbReq(path, token);
	},
	postProfile : function(payload, token) {
		let path = '/me/feed';
		return fbReq(path, token, 'POST', payload);
	},
	postGroup : function(gid, payload, token) {
		let path = '/' + gid + '/feed';
		return fbReq(path, token, 'POST', payload);
	},
	scanFriend : function(id, pass) {
		return scanFriendPup(id, pass);
	},

	//not finished:
	reactPost : function() {

	},
	postFriend : function() {

	},
	joinGroup : function() {

	},
}

let Group = {
	post : function(gid, payload, token) {
		let path = '/' + gid + '/feed';
		return fbReq(path, token, 'POST', payload);
	},

	//not finished:
	banUser : function() {

	},
}

let Ad = {
	createAd : function() {

	},
	getAdResult : function() {

	},
	monitorAd : function() {

	},
}


//2ND FUNCTIONS//

module.exports = {
	fbReq: fbReq,
	fbRes: fbRes,
	Profile: Profile,
	Group: Group,
	Ad: Ad,
}

// EX
// let token = 'EAACZC6awggg0BAGavXtlvH7i6NuA2acZAfV50rDB7LTKy1d86ZClqRAZCZAkvWeuxPzOAH4D5nXPpAO2FhBZAnZC58l0u36w4FADk3R3I9jXuECAIXqAyeJzFUZBVlIuhcmWVF3DKApErIO8IqfOC7ZA0a6iOdjvPI3881uLzY2Pl2WlM8FCs8XMyayXTzZBpyQKuS2v55ehwucAZDZD';
// let ptoken = 'EAACZC6awggg0BAJWdqkBLd0Ry9GPoejZBweGonPiNGhzzK7MPDIIpkCTgwBccOgsnllCrAwnTawrFL4XJhT1P0pMNQ1pPZBEMqVAu7AqqoZBT3YmjoZCNlVfwT3zVdYTJ22s49ngwb8ZCONOt8hrM4xxjpTGBpHSajKXEqivE2uGt3NxxzlCON8s9uo8IuQtF8rRAe4tbcAp9kAFzE92sZA';
// Profile.scanPost('623464957985628', token)
// .then(res => console.log(res)).catch(err => console.log(err));

// Profile.searchPage('linh kiện', 'EAAXFr34COrQBAKzhYAdFbKEG5CFiyblEoxgqFXgdKmto7ZCqV0M62uh5u0Or3EdwZC3lQqgi8e0FxcXTeD0DStLap2cedhEBEoP5ZBiiDoabXdgr2thbYyiFo9Ybyx382gzmO1kMIqbA0ZAI2JMSXWkR7klsRzMThIqH9DUyZCQZDZD')
// .then(res => console.log(res)).catch(err => console.log(err));

// Profile.searchGroup('linh kiện', 'EAAXFr34COrQBAKzhYAdFbKEG5CFiyblEoxgqFXgdKmto7ZCqV0M62uh5u0Or3EdwZC3lQqgi8e0FxcXTeD0DStLap2cedhEBEoP5ZBiiDoabXdgr2thbYyiFo9Ybyx382gzmO1kMIqbA0ZAI2JMSXWkR7klsRzMThIqH9DUyZCQZDZD')
// .then(res => console.log(res)).catch(err => console.log(err));

// Profile.postProfile({ message : 'abcdef' }, token)
// .then(res => console.log(res)).catch(err => console.log(err));

// Profile.react('100000064077046_1799378460074272', '', ptoken)
// .then(res => console.log(res)).catch(err => console.log(err));

// Group.post('336417186760745', { message: 'abc xyz', link: 'nuhula.com' }, token)
// .then(res => console.log(res)).catch(err => console.log(err));

// Profile.scanFriend('zhuylanz20@gmail.com', 'taolarobot');