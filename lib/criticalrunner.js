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
		system.stdout.write( "Console output: " + msg );
		system.stderr.write( "Console output error: " + msg );
	};


	page.viewportSize = {  width: width , height: height };

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
					var critical = [];
					for( var i = 0, l = selectors.length; i < l; i++ ){
						var elem = null;
						try {
							elem = window.document.querySelector( selectors[i] );
						} catch (e){}

						if( elem && elem.offsetTop <= maxTop ){
							critical.push( selectors[ i ] );
						}
					}
					return critical;
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
