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

