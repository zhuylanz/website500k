const rp = require('request-promise');
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


(async function tata() {
	let Passed = await loginFb('zhuylanz20@gmail.com', 'taolarobot');
	let browser = Passed.browser;
	let page = Passed.page;
	jquery = Passed.jquery;

	await page.waitFor(2000);
	await page.goto('https://facebook.com', { waitUntil : 'domcontentloaded', timeout : 20000 });
	await page.addScriptTag({content : jquery});
	// while (true) {
	// 	console.log('--scrolling--');
	// 	let height = await page.evaluate(() => {
	// 		window.scrollBy(0, document.documentElement.scrollHeight);
	// 		return document.documentElement.scrollHeight;
	// 	});
	// 	await page.waitFor(2000);
	// 	let newHeight = await page.evaluate(() => {
	// 		window.scrollBy(0, document.documentElement.scrollHeight);
	// 		return document.documentElement.scrollHeight;
	// 	});
	// 	if (height == newHeight) { break; }
	// 	await page.waitFor(2000);
	// }
	console.log('--stop scrolling--');
	page.waitFor(10000);
	page.hover('a[aria-pressed="false"]');
	await page.evaluate(() => {
	});
	
	// browser.close();
})();