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
function wait(time) {
	return new Promise(resolve => {
		setTimeout(resolve, time);
	});
}

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
	for (var i in response_arr) {
		let haveData;
		response_arr[i]['data'] ? haveData = true : haveData = false;
		switch (haveData) {
			case true:
			let res_data = response_arr[i]['data'];
			if (res_data.length == 0) {
				let fielddata = [''];
				data.push(fielddata);
			}
			for (var j in res_data) {
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
async function loginFbPup(username, pass) {
	let jquery = await rp('https://code.jquery.com/jquery-3.3.1.min.js');
	let browser = await puppeteer.launch({ headless : true });
	let page = await browser.newPage();
	await page.goto('https://facebook.com', { waitUntil : 'domcontentloaded', timeout : 20000 });
	await page.addScriptTag({content : jquery});
	await page.evaluate(({username: username, pass: pass}) => {
		$('#email').val(username);
		$('#pass').val(pass);
		$("input[data-testid='royal_login_button']").click();
	}, {username: username, pass: pass});

	return { browser: browser, page: page, jquery: jquery };
}


async function scanPostPup(username, pass, post_id){
	let Passed = await loginFbPup(username, pass);
	let browser = Passed.browser;
	let page = Passed.page;
	let jquery = Passed.jquery;

	try {
		await page.waitFor(2000);
		await page.goto('https://facebook.com/'+post_id, { waitUntil : 'domcontentloaded', timeout : 20000 });
		await page.addScriptTag({content : jquery});
		await page.waitFor(10000);
		await page.keyboard.press('Escape');
		await page.keyboard.press('Escape');
		await page.evaluate(() => {
			$('._4arz span').click();
		});
		await page.waitFor(5000);
		while (true) {
			try {
				await page.click('#reaction_profile_pager a');
				await page.waitFor(3000);
			} catch (e) {
				break;
			}
		}
		
		let react_profile_link_list = await page.evaluate(() => {
			links = [];
			$('.fsl.fwb.fcb a').each((i, ele) => {
				links.push($(ele).attr('href'));
			});

			return links;
		});
		await page.keyboard.press('Escape');
		await page.waitFor(3000);
		let comment_profile_link_list = await page.evaluate(() => {
			links = [];
			$('.UFICommentActorName').each((i, ele)=>{
				links.push($(ele).attr('href'));
			})

			return links;
		});

		let react_id_list = {
			data: []
		};
		if (react_profile_link_list.length > 0) {
			for (var i in react_profile_link_list) {
				let page_temp = await browser.newPage();
				await page_temp.goto(react_profile_link_list[i], { waitUntil : 'domcontentloaded', timeout : 20000 });
				await page_temp.addScriptTag({content : jquery});
				await page_temp.waitFor(2000);
				let chunk = await page_temp.evaluate(() => {
					return {
						id: $('meta').eq(4).attr('content').match(/\d{10,}/g)[0],
						name: $('._1frb').val(),
						type: 'unknown'
					};
				});
				await page_temp.close();
				react_id_list.data.push(chunk);
			}
		}

		let comment_id_list = {
			data: []
		};
		if (comment_profile_link_list.length > 0) {
			for (var i in comment_profile_link_list) {
				let page_temp = await browser.newPage();
				await page_temp.goto(comment_profile_link_list[i], { waitUntil : 'domcontentloaded', timeout : 20000 });
				await page_temp.addScriptTag({content : jquery});
				await page_temp.waitFor(2000);
				let chunk = await page_temp.evaluate(() => {
					return {
						from: {
							id: $('meta').eq(4).attr('content').match(/\d{10,}/g)[0],
							name: $('._1frb').val()
						},
						message: 'unknown'
					};
				});
				await page_temp.close();
				comment_id_list.data.push(chunk);
			}
		}
		
		browser.close();
		return { reactions: react_id_list, comments: comment_id_list }

	} catch (err) {
		browser.close();
		console.log(e);
		throw new Error(e);
	}
}

async function scanFriendPup(username, pass) {
	let Passed = await loginFbPup(username, pass);
	let browser = Passed.browser;
	let page = Passed.page;
	let jquery = Passed.jquery;

	try{
		await page.waitFor(2000);
		await page.goto('https://facebook.com/me/friends', { waitUntil : 'domcontentloaded', timeout : 20000 });
		await page.addScriptTag({content : jquery});
		while (true) {
			console.log('--scrolling--');
			await page.keyboard.press('Escape');
			let height = await page.evaluate(() => {
				window.scrollBy(0, document.documentElement.scrollHeight);
				return document.documentElement.scrollHeight;
			});
			await page.waitFor(2000);
			await page.keyboard.press('Escape');
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
					let uid = JSON.parse(data.attr('data-gt')).engagement.eng_tid;
					let uname = data.text();
					userdata += uid + ':' + uname + ':' + 'facebook.com/' + uid + ';';
				}

			});
			userdata = userdata.split(';').map(x => x.split(':'));
			return userdata;
		});
		browser.close();

		friend_uid_list.pop();
		return friend_uid_list;
	} catch(e) {
		browser.close();
		console.log(e);
		throw new Error(e);
	}
}

async function interactFeedPup(username, pass, react_type, wait_time) {
	let Passed = await loginFbPup(username, pass);
	let browser = Passed.browser;
	let page = Passed.page;
	let jquery = Passed.jquery;

	await page.waitFor(2000);
	await page.evaluate(() => { window.scrollBy(0, document.documentElement.scrollHeight); });
	await page.waitFor(4000);
	await page.evaluate(() => { window.scrollBy(0, document.documentElement.scrollHeight); });
	await page.waitFor(4000);
	await page.addScriptTag({content : jquery});
	try {
		let reacting = await page.evaluate(({react_type: react_type, wait_time: wait_time}) => {
			function react(post_id, type) {
				fb_dtsg_list = document.getElementsByName('fb_dtsg');
				if (fb_dtsg_list.length > 0) {
					profile_id = document.cookie.match(/c_user=(\d+)/)[1];
					fb_dtsg = fb_dtsg_list[0].value;
					__dyn = '';
					if (document.head.innerHTML.split('"client_revision":')[1]) {
						__rev = document.head.innerHTML.split('"client_revision":')[1].split(",")[0];
					} else {
						__rev = rand(1111111, 9999999);
					}
					jazoest = '';
					for (var x = 0; x < fb_dtsg.length; x++) {
						jazoest += fb_dtsg.charCodeAt(x);
					}
					jazoest = '2' + jazoest;
					__spin_r = __rev;
					__spin_t = Math.floor(Date.now() / 1000);
				}

				let reaction_type = { like: '1', love: '2', haha: '4', wow: '3', sad: '7', angry: '8' };

				$.post('https://www.facebook.com/ufi/reaction/?dpr=1', {
					ft_ent_identifier: post_id,
					reaction_type: reaction_type[type],
					root_id: 'u_ps_fetchstream_13_0_8',
					source: '1',
					feedback_referrer: '/',
					instance_id: 'u_ps_fetchstream_13_0_6',
					av: profile_id,
					__user: profile_id,
					__a: '1',
					__dyn: __dyn,
					__req: '3d',
					__be: '1',
					__pc: 'PHASED:DEFAULT',
					__rev: __rev,
					fb_dtsg: fb_dtsg,
					jazoest: jazoest,
					__spin_r: __spin_r,
					__spin_b: 'trunk',
					__spin_t: __spin_t,
				});

				console.log('done ' + post_id);
				console.log('https://www.facebook.com/'+post_id);
			}

			window.scrollBy(0, document.documentElement.scrollHeight);

			let post_id_list = [];
			$('span .fsm.fwn.fcg a').each((i, ele) => {
				let data = $(ele);
				console.log(data.attr('href'));
				let post_id = data.attr('href').match(/\d{10,}/g);
				if (post_id) post_id_list.push(post_id[0]);
			});

			for (var i in post_id_list) {
				setTimeout(react, i*wait_time, post_id_list[i], react_type);
			}

			return {
				post_list: post_id_list,
				wait_time: i*wait_time
			};
		}, {react_type: react_type, wait_time: wait_time} );

		await page.waitFor(reacting.wait_time + 2000);
		browser.close();
		return reacting.post_list;
	} catch(e) {
		browser.close();
		console.log(e);
		throw new Error(e);
	}
}

async function postFriendPup(username, pass, id_list, content, wait_time) {
	let Passed = await loginFbPup(username, pass);
	let browser = Passed.browser;
	let page = Passed.page;
	let jquery = Passed.jquery;

	await page.waitFor(2000);
	await page.addScriptTag({content : jquery});
	try {
		let posting = await page.evaluate(({id_list: id_list, content: content, wait_time: wait_time}) => {
			function post(uid, content) {
				fb_dtsg_list = document.getElementsByName('fb_dtsg');
				if (fb_dtsg_list.length > 0) {
					profile_id = document.cookie.match(/c_user=(\d+)/)[1];
					fb_dtsg = fb_dtsg_list[0].value;
					__dyn = '';
					if (document.head.innerHTML.split('"client_revision":')[1]) {
						__rev = document.head.innerHTML.split('"client_revision":')[1].split(",")[0];
					} else {
						__rev = rand(1111111, 9999999);
					}
					jazoest = '';
					for (var x = 0; x < fb_dtsg.length; x++) {
						jazoest += fb_dtsg.charCodeAt(x);
					}
					jazoest = '2' + jazoest;
					__spin_r = __rev;
					__spin_t = Math.floor(Date.now() / 1000);
				}

				$.post('https://www.facebook.com/webgraphql/mutation/?doc_id=1931212663571278&dpr=1', {
					variables: '{"client_mutation_id":"ec4cf7c9-9cd2-404f-a6d2-75bf36de75cc","actor_id":"'+profile_id+'","input":{"actor_id":"'+profile_id+'","client_mutation_id":"df783954-dc35-4a0e-a85b-514e9bd5d714","source":"WWW","audience":{"to_id":"'+uid+'"},"message":{"text":"'+content+'","ranges":[]},"logging":{"composer_session_id":"ec8570e5-d00d-492a-b4ee-b75cf9127ce5","ref":"timeline"},"with_tags_ids":[],"multilingual_translations":[],"composer_source_surface":"timeline","composer_entry_time":-1,"composer_session_events_log":{"composition_duration":57,"number_of_keystrokes":62},"direct_share_status":"NOT_SHARED","sponsor_relationship":"WITH","web_graphml_migration_params":{"target_type":"wall","xhpc_composerid":"rc.u_ps_fetchstream_1_2_1","xhpc_context":"profile","xhpc_publish_type":"FEED_INSERT","xhpc_timeline":true},"extensible_sprouts_ranker_request":{"RequestID":"ZvBXCwABAAAAJDYxMGUyYjZhLWQ3ZTUtNDIzOC1lMmE3LTRjNzIxNjY2ZjdjNwoAAgAAAABantyLCwADAAAABFNFTEwGAAQADgsABQAAABhVTkRJUkVDVEVEX0ZFRURfQ09NUE9TRVIA"},"place_attachment_setting":"HIDE_ATTACHMENT"}}',
					__user: profile_id,
					__a: '1',
					__dyn: __dyn,
					__req: '42',
					__be: '1',
					__pc: 'PHASED:DEFAULT',
					__rev: __rev,
					fb_dtsg: fb_dtsg,
					jazoest: jazoest,
					__spin_r: __spin_r,
					__spin_b: 'trunk',
					__spin_t: __spin_t
				});

				console.log('done ' + uid);
				console.log('https://www.facebook.com/'+uid);
			}

			for (var i in id_list) {
				setTimeout(post, i*wait_time, id_list[i], content);
			}

			return {id_list: id_list, wait_time: i*wait_time};
		}, {id_list: id_list, content: content, wait_time: wait_time} );

		await page.waitFor(posting.wait_time + 2000);
		browser.close();
		return posting;
	} catch(e) {
		browser.close();
		console.log(e);
		throw new Error(e);
	}
}

async function addFriendPup(username, pass, id_list) {
	let Passed = await loginFbPup(username, pass);
	let browser = Passed.browser;
	let page = Passed.page;
	let jquery = Passed.jquery;

	await page.waitFor(2000);
	await page.addScriptTag({content : jquery});
	try {
		let adding = await page.evaluate((id_list) => {
			function addFriend(uid) {
				fb_dtsg_list = document.getElementsByName('fb_dtsg');
				if (fb_dtsg_list.length > 0) {
					profile_id = document.cookie.match(/c_user=(\d+)/)[1];
					fb_dtsg = fb_dtsg_list[0].value;
					__dyn = '';
					if (document.head.innerHTML.split('"client_revision":')[1]) {
						__rev = document.head.innerHTML.split('"client_revision":')[1].split(",")[0];
					} else {
						__rev = rand(1111111, 9999999);
					}
					jazoest = '';
					for (var x = 0; x < fb_dtsg.length; x++) {
						jazoest += fb_dtsg.charCodeAt(x);
					}
					jazoest = '2' + jazoest;
					__spin_r = __rev;
					__spin_t = Math.floor(Date.now() / 1000);
				}

				$.post('https://www.facebook.com/ajax/add_friend/action.php?dpr=1', {
					to_friend: uid,
					action: 'add_friend',
					how_found: 'profile_button',
					ref_param: 'none',
					'link_data[gt][type]': 'xtracking',
					'link_data[gt][xt]': '48.{"event":"add_friend","intent_status":null,"intent_type":null,"profile_id":'+uid+',"ref":1}',
					'link_data[gt][profile_owner]': uid,
					'link_data[gt][ref]': 'timeline:about',
					outgoing_id: 'js_2q',
					logging_location: '',
					no_flyout_on_click: 'true',
					ego_log_data: '',
					floc: 'profile_button',
					'frefs[0]': 'none',
					__user: profile_id,
					__a: '1',
					__dyn: __dyn,
					__req: '3e',
					__be: '1',
					__pc: 'PHASED:DEFAULT',
					__rev: __rev,
					fb_dtsg: fb_dtsg,
					jazoest: jazoest,
					__spin_r: __spin_r,
					__spin_b: 'trunk',
					__spin_t: __spin_t
				});

				console.log('done ' + uid);
				console.log('https://www.facebook.com/'+uid);
			}
			let wait_time = 5000;
			for (var i in id_list) {
				setTimeout(addFriend, i*wait_time, id_list[i]);
			}

			return {id_list: id_list, wait_time: i*wait_time};
		}, id_list);

		await page.waitFor(adding.wait_time + 2000);
		browser.close();
		return adding;
	} catch(e) {
		browser.close();
		console.log(e);
		throw new Error(e);
	}
}

async function unFriendPup(username, pass, id_list) {
	let Passed = await loginFbPup(username, pass);
	let browser = Passed.browser;
	let page = Passed.page;
	let jquery = Passed.jquery;

	await page.waitFor(2000);
	await page.addScriptTag({content : jquery});
	try {
		let unning = await page.evaluate((id_list) => {
			function unFriend(uid) {
				fb_dtsg_list = document.getElementsByName('fb_dtsg');
				if (fb_dtsg_list.length > 0) {
					profile_id = document.cookie.match(/c_user=(\d+)/)[1];
					fb_dtsg = fb_dtsg_list[0].value;
					__dyn = '';
					if (document.head.innerHTML.split('"client_revision":')[1]) {
						__rev = document.head.innerHTML.split('"client_revision":')[1].split(",")[0];
					} else {
						__rev = rand(1111111, 9999999);
					}
					jazoest = '';
					for (var x = 0; x < fb_dtsg.length; x++) {
						jazoest += fb_dtsg.charCodeAt(x);
					}
					jazoest = '2' + jazoest;
					__spin_r = __rev;
					__spin_t = Math.floor(Date.now() / 1000);
				}

				$.post('https://www.facebook.com/ajax/profile/removefriendconfirm.php?dpr=1', {
					uid: uid,
					unref: 'bd_profile_button',
					floc: 'profile_button',
					__user: profile_id,
					__a: '1',
					__dyn: __dyn,
					__req: '3d',
					__be: '1',
					__pc: 'PHASED:DEFAULT',
					__rev: __rev,
					fb_dtsg: fb_dtsg,
					jazoest: jazoest,
					__spin_r: __spin_r,
					__spin_b: 'trunk',
					__spin_t: __spin_t,
				});

				console.log('done ' + uid);
				console.log('https://www.facebook.com/'+uid);
			}
			let wait_time = 5000;
			for (var i in id_list) {
				setTimeout(unFriend, i*wait_time, id_list[i]);
			}

			return {id_list: id_list, wait_time: i*wait_time};
		}, id_list);

		await page.waitFor(unning.wait_time + 2000);
		browser.close();
		return unning;
	} catch(e) {
		browser.close();
		console.log(e);
		throw new Error(e);
	}
}

async function postGroupPup(username, pass, payload) {
	let Passed = await loginFbPup(username, pass);
	let browser = Passed.browser;
	let page = Passed.page;
	let jquery = Passed.jquery;

	await page.waitFor(2000);
	await page.addScriptTag({content : jquery});
	try {
		let unning = await page.evaluate((payload) => {
			function post(gid, message, time) {
				fb_dtsg_list = document.getElementsByName('fb_dtsg');
				if (fb_dtsg_list.length > 0) {
					profile_id = document.cookie.match(/c_user=(\d+)/)[1];
					fb_dtsg = fb_dtsg_list[0].value;
					__dyn = '';
					if (document.head.innerHTML.split('"client_revision":')[1]) {
						__rev = document.head.innerHTML.split('"client_revision":')[1].split(",")[0];
					} else {
						__rev = rand(1111111, 9999999);
					}
					jazoest = '';
					for (var x = 0; x < fb_dtsg.length; x++) {
						jazoest += fb_dtsg.charCodeAt(x);
					}
					jazoest = '2' + jazoest;
					__spin_r = __rev;
					__spin_t = Math.floor(Date.now() / 1000);
				}

				$.post('https://www.facebook.com/webgraphql/mutation/?doc_id=1931212663571278&dpr=1', {
					variables: '{"client_mutation_id":"a8174f7e-3c2b-471d-9c7a-5af840dcd15e","actor_id":"'+profile_id+'","input":{"actor_id":"'+profile_id+'","client_mutation_id":"24aa8dcf-ec1e-4721-acec-6c3dd9761df5","source":"WWW","audience":{"to_id":"'+gid+'"},"message":{"text":"'+message+'","ranges":[]},"logging":{"composer_session_id":"bc15bf4c-1487-4dbc-be98-b025be8beb3d","ref":"group"},"with_tags_ids":[],"multilingual_translations":[],"composer_source_surface":"group","composer_entry_time":1316,"composer_session_events_log":{"composition_duration":23,"number_of_keystrokes":44},"direct_share_status":"NOT_SHARED","sponsor_relationship":"WITH","web_graphml_migration_params":{"target_type":"group","xhpc_composerid":"rc.u_fetchstream_12_w","xhpc_context":"profile","xhpc_publish_type":"FEED_INSERT"},"place_attachment_setting":"HIDE_ATTACHMENT","unpublished_content_data":{"unpublished_content_type":"SCHEDULED","scheduled_publish_time":'+time+'}}}',
					__user: profile_id,
					__a: '1',
					__dyn: '',
					__req: '7z',
					__be: '1',
					__pc: 'PHASED:DEFAULT',
					__rev: __rev,
					fb_dtsg: fb_dtsg,
					jazoest: jazoest,
					__spin_r: __spin_r,
					__spin_b: 'trunk',
					__spin_t: __spin_t,
				});

				console.log('done ' + gid);
				console.log('https://www.facebook.com/'+gid);
			}
			
			post(payload.gid, payload.message, payload.time);

			return;
		}, payload);

		await page.waitFor(5000);
		browser.close();
		return 'OK';
	} catch(e) {
		browser.close();
		console.log(e);
		throw new Error(e);
	}
}

async function kickMemberPup(username, pass, payload) {
	let Passed = await loginFbPup(username, pass);
	let browser = Passed.browser;
	let page = Passed.page;
	let jquery = Passed.jquery;

	await page.waitFor(2000);
	await page.addScriptTag({content : jquery});
	try {
		await page.evaluate(payload => {
			function kick(gid, uid) {
				fb_dtsg_list = document.getElementsByName('fb_dtsg');
				if (fb_dtsg_list.length > 0) {
					profile_id = document.cookie.match(/c_user=(\d+)/)[1];
					fb_dtsg = fb_dtsg_list[0].value;
					__dyn = '';
					if (document.head.innerHTML.split('"client_revision":')[1]) {
						__rev = document.head.innerHTML.split('"client_revision":')[1].split(",")[0];
					} else {
						__rev = rand(1111111, 9999999);
					}
					jazoest = '';
					for (var x = 0; x < fb_dtsg.length; x++) {
						jazoest += fb_dtsg.charCodeAt(x);
					}
					jazoest = '2' + jazoest;
					__spin_r = __rev;
					__spin_t = Math.floor(Date.now() / 1000);
				}

				$.post('https://www.facebook.com/ajax/groups/members/remove.php?group_id='+gid+'&uid='+uid+'&is_undo=0&source=profile_browser&dpr=1', {
					fb_dtsg: fb_dtsg,
					confirm: 'true',
					__user: profile_id,
					__a: '1',
					__dyn: '',
					__req: '1l',
					__be: '1',
					__pc: 'PHASED:DEFAULT',
					__rev: __rev,
					jazoest: jazoest,
					__spin_r: __spin_r,
					__spin_b: 'trunk',
					__spin_t: __spin_t,
				});

				console.log('done ' + uid);
				console.log('https://www.facebook.com/'+uid);
			}
			
			for (var i in payload.uid) {
				kick(payload.gid, payload.uid[i]);
			}

			return;
		}, payload);

		await page.waitFor(30000);
		browser.close();
		return 'OK';
	} catch(e) {
		browser.close();
		console.log(e);
		throw new Error(e);
	}
}


let Profile = {
	scanPost : function(pid, token) {
		let path = '/' + pid + '?fields=reactions.limit(5000),comments.limit(5000),sharedposts.limit(5000)';
		return fbReq(path, token);
	},
	scanPostPup: scanPostPup,
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
	scanFriend : function(username, pass) {
		return scanFriendPup(username, pass);
	},
	interactFeed : function(username, pass, type, delay) {
		return interactFeedPup(username, pass, type, delay);
	},
	postFriend : function(username, pass, id_list, content, delay) {
		return postFriendPup(username, pass, id_list, content, delay);
	},
	addFriend : function(username, pass, id_list) {
		return addFriendPup(username, pass, id_list);
	},
	unFriend : function(username, pass, id_list) {
		return unFriendPup(username, pass, id_list);
	},
}

let Group = {
	listGroup: function(token) {
		let path = '/me/groups';
		return fbReq(path, token);
	},
	listPost: function(gid, token) {
		let path = '/' + gid + '/feed?limit=5000';
		return fbReq(path, token);
	},
	post: function(gid, payload, token) {
		let path = '/' + gid + '/feed';
		return fbReq(path, token, 'POST', payload);
	},
	postSchedule: function(username, pass, payload) {
		return postGroupPup(username, pass, payload);
	},
	listMember: function(gid, token) {
		let path = '/' + gid + '/members?limit=5000';
		return fbReq(path, token);
	},
	kickMember : function(username, pass, payload) {
		return kickMemberPup(username, pass, payload);
	},
}

let Ad = {
	createAdCreative : function(act, payload, token) {
		let path = '/v2.11/act_'+act+'/adcreatives';
		return fbReq(path, token, 'POST', payload);
	},
	listAd: function(act, token) {
		let path = '/v2.12/act_'+act+'/adsets?limit=5000&fields=status,daily_budget,ads{name,campaign_id,adset_id,effective_status,insights.date_preset(lifetime){spend,impressions,unique_clicks}}';
		return fbReq(path, token);
	},
	updateAd: function(ad, payload, token) {
		let path = '/v2.12/'+ad;
		return fbReq(path, token, 'POST', payload);
	},
}

let validateCredential = async function(username, password) {
	let Passed = await loginFbPup(username, password);
	let browser = Passed.browser;
	let page = Passed.page;
	let jquery = Passed.jquery;

	await page.waitFor(2000);
	await page.addScriptTag({content : jquery});
	try {
		let status = await page.evaluate(() => {
			fb_dtsg_list = document.getElementsByName('fb_dtsg');
			if (fb_dtsg_list.length > 0) {
				fb_dtsg = fb_dtsg_list[0].value;
				if (document.cookie.match(/c_user=(\d+)/)) {
					return 0;
				}
				return 2;
			} else {
				return 1;
			}

		});

		page.waitFor(2000);
		browser.close();
		return status; //0: ok, 1: wrong cre, 2: 2 layer;
	} catch(e) {
		browser.close();
		console.log(e);
		throw new Error(e);
	}
}


//2ND FUNCTIONS//

module.exports = {
	wait: wait,
	fbReq: fbReq,
	fbRes: fbRes,
	Profile: Profile,
	Group: Group,
	Ad: Ad,
	validateCredential: validateCredential,
}