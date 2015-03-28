/*global phantom:true*/
/*global require:true*/
/*global window:true*/

/*
phantom args sent from critical.js:
	[0] - url
	[1] - width of page
	[2] - height of page
	[3] - selectors that should be forced to be included
	[4] - filename of rules
*/
(function(){
	"use strict";

	var system = require( "system" );
	var fs = require( "fs" );

	var site = phantom.args[0],
		width = phantom.args[1],
		height = phantom.args[2],
		forceInclude = JSON.parse(phantom.args[3]),
		rulesFile = phantom.args[4],
		ignoreConsole = phantom.args.length >= 6 && phantom.args[5] === "--ignoreConsole" ? true : false,
		contents, rules;

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


	var page = require( "webpage" ).create();
	var cc = require( "./criticalcss" );

	phantom.onError = errorHandler;
	page.onError = errorHandler;
	page.onConsoleMessage = function(msg) {
		if(!ignoreConsole){
			system.stdout.write( "Console output: " + msg );
			system.stderr.write( "Console output error: " + msg );
		}
	};


	page.viewportSize = {  width: width , height: height };

	page.settings.webSecurityEnabled = false;
	page.settings.localToRemoteUrlAccessEnabled = true;

	try {
		contents = fs.read(rulesFile);
		rules = JSON.parse(contents);
	} catch( e ){
		throw e;
	}

	page.open( site, function( status ){
		if( status !== "success" ){
			throw new Error( "Page didn't open: " + site );
		}

		var maxTop = page.evaluate(function(){
			return window.innerHeight;
		});

		var opts = {
			maxTop: maxTop,
			forceInclude: forceInclude,
			criticalSelectorList: function( list, maxTop ){
				return page.evaluate( function( selectors, maxTop ){
					return selectors.filter(function( selector ){
						var elem = null;
						// before testing the selector, we want to strip pseudo-elements out,
						// because those selectors will not pass querySelector, yet we want them in criticalcss if they modify a critical selector
						var selectorNoPsuedos = selector.replace( /\:+(before|after)/gmi, "" );
						try {
							elem = window.document.querySelector( selectorNoPsuedos );
						} catch (e){}

						return elem && elem.offsetTop <= maxTop;
					});
				}, list, maxTop );
			}

		};

		var crit = cc.criticalCSS( rules, opts );
		if( crit.length === 0 ){
			throw new Error( "criticalCSS didn't run or no critical css, that seems unlikely" );
		} else {
			system.stdout.write(crit);
			phantom.exit();
		}
	});

}());
