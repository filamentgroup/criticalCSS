/*global require:true*/
/*global window:true*/

const puppeteer = require("puppeteer");
const tmp = require("tmp");
const fs = require("fs-extra");

function tmpdirAsync(){
	return new Promise((resolve, reject) => {
		tmp.dir((err, path) =>{
			if(err) {
				reject(err);
				return;
			}

			resolve(path);
		});
	});
}

module.exports = async function(cssFile) {
	/**
	 * Wait until the test condition is true or a timeout occurs. Useful for waiting
	 * on a server response or for a ui change (fadeIn, etc.) to occur.
	 *
	 * @param testFx javascript condition that evaluates to a boolean,
	 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
	 * as a callback function.
	 * @param onReady what to do when testFx condition is fulfilled,
	 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
	 * as a callback function.
	 * @param timeOutMillis the max amount of time to wait. If not specified, 3 sec is used.
	 */
	var waitFor = async function(testFx, onReady, timeOutMillis) {
		return new Promise((resolve, reject) => {
			var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
					start = new Date().getTime(),
					condition = false, interval;

			interval = setInterval(async function() {
				clearInterval(interval);
				condition = await testFx();
				if ((new Date().getTime() - start >= maxtimeOutMillis) || condition ) {
					if(!condition) {
						// If condition still not fulfilled (timeout but condition is 'false')
						reject(new Error( "Timeout waiting for CSS rules" ));
						return;
					}

					resolve(await onReady());
				}
			}, 250); //< repeat check every 250ms
		});
	};

	var browserSettings = {
		ignoreHTTPSErrors: true
	};

	const browser = await puppeteer.launch(browserSettings);
	const page = await browser.newPage();

	const tmpdir = await tmpdirAsync();
	const pagePath = `${tmpdir}/page.html`;
	var contents = fs.readFileSync( cssFile );

	fs.writeFileSync(pagePath, "<!DOCTYPE html><html><head><style>" + contents + "</style></head><body></body></html>");

	await page.goto(`file://${pagePath}`);


	return waitFor(async function(){
		return await page.evaluate(function(){
			return window.document.styleSheets.length && Array.prototype.every.call(window.document.styleSheets, function(sheet){
				return !!sheet && !!sheet.cssRules && !!sheet.cssRules.length;
			});
		});
	}, async function(){
		return await page.evaluate(function(){
			var Rule = function(rule){
				var rules = [];
				this.media = rule.media;
				this.cssText = rule.cssText;
				this.selectorText = rule.selectorText;
				this.supports = rule.type === CSSRule.SUPPORTS_RULE;

				// TODO we are reusing `selectorText` here because adding new properties
				// to the rule object breaks a ton of tests that check the stringfied list
				// of rule objects.
				// FIX THE TESTS AND USE A NEW PROPERTY
				if(this.supports) {
					this.selectorText = rule.conditionText;
				}

				try {
					rules = Array.prototype.slice.call(rule.cssRules);
				} catch(e) {
					rules = [];
				}

				this.cssRules = rules.map(function(r){
					return new Rule(r);
				});

				if( this.media ){
					this.media.mediaText = rule.media.mediaText;
				}
			};

			var rules = Array.prototype.slice.call(window.document.styleSheets[0].cssRules);
			var ret = rules.map(function(rule){
				return new Rule(rule);
			}).filter(function(el){
				return !!el;
			});

			// TODO why do we do this, when used externally it's always converted back to json
			return JSON.stringify(ret);
		});
	}).finally(async () => {
		fs.removeSync(tmpdir);
		await page.close();
		await browser.close();
	});
};
