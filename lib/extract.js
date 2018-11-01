/*global phantom:true*/
/*global require:true*/
/*global window:true*/
"use strict";
var fs = require( "fs" );
var cc = require( "./criticalcss.js" );
module.exports = {
	extract: function(site, width, height, forceInclude, rulesFile){

	// var system = require( "system" );

	var contents, rules;

	var errorHandler = function(msg, trace) {
		var msgStack = ["PHANTOM ERROR: " + msg];
		if (trace && trace.length) {
			msgStack.push("TRACE:");
			trace.forEach(function(t) {
				msgStack.push(" -> " + (t.file || t.sourceURL) + ": " + t.line + (t.function ? " (in function " + t.function +")" : ""));
			});
		}
		system.stderr.write( msgStack.join("\n") );
		phantom.exit(1);
	};


	//var page = require( "webpage" ).create();
	// var cc = require( "./criticalcss" );

	// TODO
	// phantom.onError = errorHandler;
	// page.onError = errorHandler;
	// page.onConsoleMessage = function(msg) {
	//	if(!ignoreConsole){
	//		system.stdout.write( "Console output: " + msg );
	//		system.stderr.write( "Console output error: " + msg );
	//	}
	// };

	// TODO
	var browserSettings = {
		defaultViewport: {	width: width , height: height },
		ignoreHTTPSErrors: true,
		dumpio: true
	};

	// page.settings.localToRemoteUrlAccessEnabled = true;

	try {
		contents = fs.readFileSync(rulesFile);
		rules = JSON.parse(contents);
	} catch( e ){
		throw e;
	}

	const puppeteer = require('puppeteer');

	puppeteer.launch(browserSettings).then(async browser => {
		const page = await browser.newPage();

		// TODO handle failed page load
		await page.goto(site);

		var maxTop = await page.evaluate(function(){
			return window.innerHeight;
		});

		var opts = {
			maxTop: maxTop,
			forceInclude: forceInclude,
			criticalSelectorList: (async (list, maxTop) => {
				return await page.evaluate(function( selectors, maxTop ){
					return selectors.filter(function( selector ){
						var elem = null;
						// before testing the selector, we want to strip pseudo-elements
						// out, because those selectors will not pass querySelector, yet we
						// want them in criticalcss if they modify a critical selector
						var selectorNoPsuedos = selector.replace( /\:+(before|after)/gmi, "" );
						try {
							elem = window.document.querySelector( selectorNoPsuedos );
						} catch (e){}

						return elem && elem.getBoundingClientRect().top <= maxTop;
					});
				}, list, maxTop );
			})
		};

		var crit = await cc.criticalCSS( rules, opts );

		if( crit.length === 0 ){
			throw new Error( "criticalCSS didn't run or no critical css, that seems unlikely" );
		}

		await browser.close();
	})
	.catch((e) => console.log(e));
	}
};
