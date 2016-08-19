/*global phantom:true*/
/*global require:true*/
/*global window:true*/

/**
 * system.args
 * [1] - fs path for css file
 */
(function(){
	"use strict";

	var system = require( "system" );
	var fs = require( "fs" );

	var errorHandler = function(msg, trace) {
		var msgStack = ["PHANTOM ERROR: " + msg];
		if (trace && trace.length) {
			msgStack.push("TRACE:");
			trace.forEach(function(t) {
				msgStack.push(" -> " + (t.file || t.sourceURL) + ": " + t.line + (t.function ? " (in function " + t.function +")" : ""));
			});
		}
		system.stderr.write( msgStack.join("\n") + "\n" );
		phantom.exit(1);
	};

	var cssFile = system.args[1];

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
			condition = false, interval;

			interval = window.setInterval(function() {
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
						window.clearInterval(interval);
					}
				}
			}, 250); //< repeat check every 250ms
	};


	var page = require("webpage").create();
	page.settings.webSecurityEnabled = false;
	page.settings.localToRemoteUrlAccessEnabled = true;
	phantom.onError = errorHandler;
	page.onError = errorHandler;

	page.onConsoleMessage = function(msg) {
		system.stdout.write( "Console output: " + msg + "\n");
		system.stderr.write( "Console output error: " + msg + "\n");
	};


	page.onLoadFinished = function(status) {
		if( status !== "success" ){
			throw new Error( "page didn't open properly" );
		}
		waitFor(function(){
			return page.evaluate(function(){
				return window.document.styleSheets.length && Array.prototype.every.call(window.document.styleSheets, function(sheet){
					return !!sheet && !!sheet.cssRules && !!sheet.cssRules.length;
				});
			});
		}, function(){
			var styleSheet = page.evaluate(function(){
				var Rule = function(rule){
					var rules = [];
					this.media = rule.media;
					this.cssText = rule.cssText;
					this.selectorText = rule.selectorText;

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
					// Sometimes Phantom is terrible. This is for when those times blow the whole world up
					try {
						return new Rule(rule);
					} catch (e){ }
				})
				.filter(function(el){
					return !!el;
				});
				return JSON.stringify(ret);
			});
			system.stdout.write(styleSheet);
			phantom.exit();
		});
	};

	var contents = fs.read( cssFile );
	page.content = "<!DOCTYPE html><html><head><style>" + contents + "</style></head><body></body></html>";

}());
