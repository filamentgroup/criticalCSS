/*global phantom:true*/
/*global require:true*/
/*global window:true*/
/* eslint esnext: true */

"use strict";
const fs = require( "fs" );
const cc = require( "./criticalcss.js" );
const puppeteer = require('puppeteer');

module.exports = {
	extract: async function(site, width, height, forceInclude, rulesFile){

		// var system = require( "system" );

		var contents, rules;

		var browserSettings = {
			defaultViewport: {	width: width , height: height },
			ignoreHTTPSErrors: true
		};

		try {
			contents = fs.readFileSync(rulesFile);
			rules = JSON.parse(contents);
		} catch( e ){
			throw e;
		}

		const browser = await puppeteer.launch(browserSettings);
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
		return crit;
	}
};
