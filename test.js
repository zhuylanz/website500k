const rp = require('request-promise');
const cookiejar = rp.jar();
const tough = require('tough-cookie');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');


async function loginFb(id, pass) {
	let jquery = await rp('https://code.jquery.com/jquery-3.3.1.min.js');
	let browser = await puppeteer.launch({ headless : false });
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


// (async function tata() {
// 	let Passed = await loginFb('zhuylanz20@gmail.com', 'taolarobot');
// 	let browser = Passed.browser;
// 	let page = Passed.page;
// 	jquery = Passed.jquery;

// 	await page.waitFor(5000);
// 	let cookies = await page.cookies();
// 	console.log(cookies);

// 	// browser.close();
// })();

// let options = {
// 	method: 'GET',
// 	uri: 'https://www.facebook.com/',
// 	headers: {
// 		'accept-encoding': 'gzip',
// 		'cookie': 'sb=X4iIWrab9bjigNsDyMT968pT; datr=X4iIWmsi5yQ61bjP2CDdqLqc; c_user=100000064077046; xs=19%3AYEiLJhTUFbkB0g%3A2%3A1519366874%3A2539%3A6165; pl=n; act=1520383026417%2F9; fr=0cdsMYvDh986SHBbf.AWVdnOFm4frPdsvMJUkmZ8bZIu0.BaiIhf.WY.Fqc.0.0.BanzVm.AWU_-CzD; presence=EDvF3EtimeF1520383555EuserFA21BB64077046A2EstateFDt3F_5bDiFA2user_3a1B01660886017A2ErF1EoF1EfF1C_5dEutc3F1520383026706G520383555565CEchFDp_5f1BB64077046F2CC; wd=1306x965',
// 		'accept-language': 'en-US,en;q=0.9',
// 		'upgrade-insecure-requests': '1',
// 		'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.146 Safari/537.36',
// 		'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
// 		'cache-control': 'max-age=0',
// 		'authority': 'www.facebook.com',
// 		'origin': 'https://www.facebook.com'
// 	},
// 	json: true,
// 	gzip: true
// }

// rp(options)
// .then(res => {
// 	let fb_dtsg = res.match(/value=".{12}:.{12}/g)[0].slice(7);
// 	let __rev = res.match(/client_revision":\d{7}/g)[0].slice(17);
// 	let __dyn = '';
// 	let jazoest = '';
// 	for (var x = 0; x < fb_dtsg.length; x++) {
// 		jazoest += fb_dtsg.charCodeAt(x);
// 	}
// 	jazoest = '2' + jazoest;
// 	let __spin_r = __rev;
// 	let __spin_t = Math.floor(Date.now() / 1000);

// 	let optionsa = {
// 		method: 'POST',
// 		uri: 'https://www.facebook.com/ajax/profile/removefriendconfirm.php?dpr=1',
// 		form: {
// 			uid: '100011434977965',
// 			unref: 'bd_profile_button',
// 			floc: 'profile_button',
// 			__user: '100000064077046',
// 			__a: '1',
// 			__dyn: __dyn,
// 			__req: '3d',
// 			__be: '1',
// 			__pc: 'PHASED:DEFAULT',
// 			__rev: __rev,
// 			fb_dtsg: fb_dtsg,
// 			jazoest: jazoest,
// 			__spin_r: __spin_r,
// 			__spin_b: 'trunk',
// 			__spin_t: __spin_t,
// 		},
// 		headers: {
// 			'accept-encoding': 'gzip, deflate, br',
// 			'cookie': 'sb=X4iIWrab9bjigNsDyMT968pT; datr=X4iIWmsi5yQ61bjP2CDdqLqc; c_user=100000064077046; xs=19%3AYEiLJhTUFbkB0g%3A2%3A1519366874%3A2539%3A6165; pl=n; act=1520383026417%2F9; fr=0cdsMYvDh986SHBbf.AWVdnOFm4frPdsvMJUkmZ8bZIu0.BaiIhf.WY.Fqc.0.0.BanzVm.AWU_-CzD; presence=EDvF3EtimeF1520383555EuserFA21BB64077046A2EstateFDt3F_5bDiFA2user_3a1B01660886017A2ErF1EoF1EfF1C_5dEutc3F1520383026706G520383555565CEchFDp_5f1BB64077046F2CC; wd=1306x965',
// 			'accept-language': 'en-US,en;q=0.9',
// 			'upgrade-insecure-requests': '1',
// 			'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
// 			'accept': '*/*',
// 			'authority': 'www.facebook.com',
// 			'x-requested-with': 'XMLHttpRequest',
// 			'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.146 Safari/537.36',
// 			'origin': 'https://www.facebook.com'
// 		},
// 		gzip: true
// 	}

// 	rp(optionsa).then(resa => console.log(resa)).catch(erra => console.log(erra));

// })
// .catch(err => console.log(err));

let options = {
	method: 'POST',
	uri: 'https://www.facebook.com/login.php?login_attempt=1&lwv=110',
	form: {
		lsd: '',
		email: 'zhuylanz20@gmail.com',
		pass: 'taolarobot',
		timezone: '-420',
		lgndim: '',
		lgnrnd: '',
		lgnjs: '',
		ab_test_data: '',
		locale: 'vi_VN',
		login_source: 'login_bluebar',
		prefill_contact_point: '',
		prefill_source: '',
		prefill_type: '',
		skstamp: ''
	},
	headers: {
		'cookie': 'fr=0cXvTIxTmCaQCDlaE..Ban6PX.sr.AAA.0.0.Ban6PX.AWXbSkVP; sb=16OfWmty2a539R1PJDY2BYzQ; _js_reg_fb_ref=https%3A%2F%2Fwww.facebook.com%2F; datr=16OfWsThjKP3bMtfFlUogmu-; reg_fb_ref=https%3A%2F%2Fwww.facebook.com%2F; reg_fb_gate=https%3A%2F%2Fwww.facebook.com%2F; wd=1306x965',
		'origin': 'https://www.facebook.com',
		'accept-encoding': 'gzip, deflate, br',
		'accept-language': 'en-US,en;q=0.9',
		'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.146 Safari/537.36',
		'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
		'accept': '*/*',
		'referer': 'https://www.facebook.com/',
		'authority': 'www.facebook.com',
		'x-requested-with': 'XMLHttpRequest',
	},
	// json: true,
	gzip: true
}

rp(options)
.then(res => {
	console.log(res);
})
.catch(err => {
	console.log(err.response.headers['set-cookie'])
});

// curl 'https://www.facebook.com/' ' age=0' -H 'authority: www.facebook.com' -H 'cookie: fr=0bRij7aLPMxh55DmF..Ban5d2.45.AAA.0.0.Ban5d2.AWWr9-vy; sb=dpefWiY6kJk9l_pmhMTw3OwP; _js_reg_fb_ref=https%3A%2F%2Fwww.facebook.com%2F; datr=dpefWvJKIZy1LgV5g7D2NJBV; reg_fb_ref=https%3A%2F%2Fwww.facebook.com%2F; reg_fb_gate=https%3A%2F%2Fwww.facebook.com%2F; wd=1306x965' --compressed
// curl 'https://www.facebook.com/' -H 'accept-encoding: gzip, deflate, br' -H 'accept-language: en-US,en;q=0.9' -H 'upgrade-insecure-requests: 1' -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.146 Safari/537.36' -H 'accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8' -H 'cache-control: max-age=0' -H 'authority: www.facebook.com' -H 'cookie: fr=02xvkq8MdHaEscUPN..Ban5kC.Ds.AAA.0.0.Ban5kC.AWWzpcHP; sb=ApmfWtPwy1sYQJVcIMbCUI-u; _js_reg_fb_ref=https%3A%2F%2Fwww.facebook.com%2F; datr=ApmfWuw2w1bSrvlKyE1wUC-U; reg_fb_ref=https%3A%2F%2Fwww.facebook.com%2F; reg_fb_gate=https%3A%2F%2Fwww.facebook.com%2F; wd=1306x965' --compressed
// curl 'https://www.facebook.com/login.php?login_attempt=1&lwv=110' -H 'cookie: sb=ApmfWtPwy1sYQJVcIMbCUI-u; datr=ApmfWuw2w1bSrvlKyE1wUC-U; reg_fb_ref=https%3A%2F%2Fwww.facebook.com%2F; reg_fb_gate=https%3A%2F%2Fwww.facebook.com%2F; wd=1306x965; fr=02xvkq8MdHaEscUPN..Ban5kC.Ds.AAA.0.0.Ban5kG.AWXuXeLm' -H 'origin: https://www.facebook.com' -H 'accept-encoding: gzip, deflate, br' -H 'accept-language: en-US,en;q=0.9' -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.146 Safari/537.36' -H 'content-type: application/x-www-form-urlencoded; charset=UTF-8' -H 'accept: */*' -H 'referer: https://www.facebook.com/' -H 'authority: www.facebook.com' -H 'x-requested-with: XMLHttpRequest' --data 'lsd=&email=zhuylanz20%40gmail.com&pass=taolarobot&timezone=-420&lgndim=&lgnrnd=&lgnjs=&ab_test_data=&locale=vi_VN&login_source=login_bluebar&prefill_contact_point=&prefill_source=&prefill_type=&skstamp=' --compressed
// curl 'https://www.facebook.com/' -H 'accept-encoding: gzip, deflate, br' -H 'accept-language: en-US,en;q=0.9' -H 'upgrade-insecure-requests: 1' -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.146 Safari/537.36' -H 'accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8' -H 'cache-control: max-age=0' -H 'authority: www.facebook.com' -H 'cookie: sb=QZqfWgPIPvThG8aMr6YcO7ez; datr=QZqfWv_cDDemab_BCd1TSF7-; reg_fb_ref=https%3A%2F%2Fwww.facebook.com%2F; reg_fb_gate=https%3A%2F%2Fwww.facebook.com%2F; wd=1306x965; fr=0bM8KzBVVpGFcQUjv..Ban5pB.zr.AAA.0.0.Ban5sJ.AWW7fuOs' --compressed
// curl 'https://www.facebook.com/login.php?login_attempt=1&lwv=110' -H 'cookie: fr=0hjC0lToPS7fMXJPU..Ban5vi.Dk.AAA.0.0.Ban5vi.AWXilPHe; sb=4pufWlLVM3mXzZmySMxtTUjf; _js_reg_fb_ref=https%3A%2F%2Fwww.facebook.com%2F; datr=4pufWs73BBn-GVGnPBF21mjr; reg_fb_ref=https%3A%2F%2Fwww.facebook.com%2F; reg_fb_gate=https%3A%2F%2Fwww.facebook.com%2F; wd=1306x965' -H 'origin: https://www.facebook.com' -H 'accept-encoding: gzip, deflate, br' -H 'accept-language: en-US,en;q=0.9' -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.146 Safari/537.36' -H 'content-type: application/x-www-form-urlencoded; charset=UTF-8' -H 'accept: */*' -H 'referer: https://www.facebook.com/' -H 'authority: www.facebook.com' -H 'x-requested-with: XMLHttpRequest' --data 'lsd=&email=zhuylanz20%40gmail.com&pass=taolarobot&timezone=-420&lgndim=&lgnrnd=&lgnjs=&ab_test_data=&locale=vi_VN&login_source=login_bluebar&prefill_contact_point=&prefill_source=&prefill_type=&skstamp=' --compressed