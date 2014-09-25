/*global phantom:true*/
/*global require:true*/
/*global window:true*/

/*
phantom args sent from critical.js:
	[0] - url
	[1] - filename
	[2] - width of page
	[3] - height of page
	[4] - selectors that should be forced to be included
*/
(function(){
	"use strict";

	var site = phantom.args[0],
		filename = phantom.args[1],
		width = phantom.args[2],
		height = phantom.args[3],
		forceInclude = JSON.parse(phantom.args[4]);


	var system = require( "system" );

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
	var cc = require( "./criticalCSS" );


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
	var waitFor = function(testFx, onReady, timeOutMillis) {
		var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
			start = new Date().getTime(),
			condition = false,
			interval = setInterval(function() {
				if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
					// If not time-out yet and condition not yet fulfilled
					condition = testFx();
				} else {
					if(!condition) {
						// If condition still not fulfilled (timeout but condition is 'false')
						throw new Error( "The filename you have given is not found at this url." );
					} else {
						// Condition fulfilled (timeout and/or condition is 'true')
						onReady();
						clearInterval(interval);
					}
				}
			}, 250); //< repeat check every 250ms
	};

	phantom.onError = errorHandler;
	page.onError = errorHandler;
	page.onConsoleMessage = function(msg) {
		system.stdout.write( "Console output: " + msg );
		system.stderr.write( "Console output error: " + msg );
	};


	page.viewportSize = {  width: width , height: height };

	page.open( site, function( status ){
		if( status === "success" ){
			waitFor(function(){
				// Wait for document.stylesheets to include the filename we're looking for before running
				return page.evaluate(function(file){
					return Array.prototype.slice.call(window.document.styleSheets).some(function(sheet){
						return !!sheet.href.match(file);
					});
				}, filename);
			}, function(){
				var maxTop = page.evaluate(function(){
					return window.innerHeight;
				});

				var stylesheets = page.evaluate(function(){
					return window.document.styleSheets;
				});

				var opts = {
					sheets: stylesheets,
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

								if( elem && (window.getComputedStyle(elem).display !== "none") && elem.offsetTop <= maxTop ){
									critical.push( selectors[ i ] );
								}
							}
							return critical;
						}, list, maxTop );
					}

				};

				var crit = cc.criticalCSS( filename, opts );
				if( crit.length === 0 ){
					throw new Error( "criticalCSS didn't run or no critical css, that seems unlikely" );
				} else {
					system.stdout.write(crit);
					phantom.exit();
				}
			});

		} else {
			throw new Error( "Page didn't open: " + site );
		}
	});

}());
