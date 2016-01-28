/*global phantom:true*/
/*global require:true*/
/*global window:true*/

/*
system.args sent from critical.js:
	[1] - url
	[2] - width of page
	[3] - height of page
	[4] - selectors that should be forced to be included
	[5] - filename of rules
*/
(function(){
	"use strict";

	var system = require( "system" );
	var fs = require( "fs" );

	var site = system.args[1],
		width = system.args[2],
		height = system.args[3],
		forceInclude = JSON.parse(system.args[4]),
		rulesFile = system.args[5],
		ignoreConsole = system.args.length > 6 && system.args[6] === "--ignoreConsole" ? true : false,
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

						return elem && elem.getBoundingClientRect().top <= maxTop;
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
