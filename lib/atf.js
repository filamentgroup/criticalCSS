/*global require:true*/
/*global window:true*/
/* experimental: [asyncawait, asyncreqawait] */

"use strict";
const fs = require( "fs" );
const puppeteer = require("puppeteer");

module.exports = async function(site, width, height, forceInclude, rulesFile){
	// TODO just take the object as an argument
	try {
		var contents = fs.readFileSync(rulesFile);
		var rules = JSON.parse(contents);
	} catch( e ){
		throw e;
	}

	var browserSettings = {
		defaultViewport: {	width: width , height: height },
		ignoreHTTPSErrors: true
	};

	const browser = await puppeteer.launch(browserSettings);
	const page = await browser.newPage();

	try {
		await page.goto(site, { waitUntil: "networkidle0" });

		var maxTop = await page.evaluate(function(){
			return window.innerHeight;
		});

		var crit = await page.evaluate(function( rules, maxTop, forced ){
			var noEmpties = function( el ){
				return el !== "";
			};

			var isForced = function( rule ){
				return forced.some(function(selector){
					return !!rule.selectorText && rule.selectorText.match( selector );
				});
			};

			var splitCheck = function( rule ){
				var selectors, criticalSelectors;

				if( !rule.selectorText ){
					return false;
				}

				if( forced.length && isForced( rule ) ){
					return rule.cssText;
				}

				selectors = rule.selectorText.split(",");
				criticalSelectors = areAboveFold( selectors, maxTop );

				if( criticalSelectors.length ){
					return criticalSelectors.join(",") + rule.cssText.match( /\{.+/ );
				} else {
					return false;
				}
			};

			var getCriticalRules = function(rule){
				var	matchingRules = [], critCSSText;

				if( rule.media || rule.supports ){
					var innerRules = rule.cssRules || [];

					matchingRules = innerRules.map( getCriticalRules ).filter( function( mr ){
						return !!mr;
					});

					if( matchingRules.length ){
						let type = rule.media ? "media" : "supports";
						let check = rule.media ? rule.media[0] : rule.selectorText;
						matchingRules.unshift( "@" + type + " " + check + "{" );
						matchingRules.push( "}" );
					}
				} else {
					critCSSText = splitCheck( rule );

					if( critCSSText && !critCSSText.match(/^\s+$/) ){
						matchingRules.push( critCSSText );
					}
				}

				return matchingRules.join("\n");
			};

			function areAboveFold( selectors ){
				return selectors.filter(function( selector ){
					var elem = null;
					// before testing the selector, we want to strip pseudo-elements
					// out, because those selectors will not pass querySelector, yet we
					// want them in criticalcss if they modify a critical selector
					var selectorNoPseudos = selector.replace( /\:+(before|after)/gmi, "" );
					try {
						elem = window.document.querySelector( selectorNoPseudos );
					} catch (e){}

					return elem && elem.getBoundingClientRect().top <= maxTop;
				});
			}

			return rules
				.map(getCriticalRules)
				.filter( noEmpties )
				.join("\n");
		}, rules, maxTop, forceInclude );

		if( crit.length === 0 ){
			throw new Error( "criticalCSS didn't run or no critical css, that seems unlikely" );
		}

	} finally {
		await page.close();
		await browser.close();
	}

	return crit;
};

