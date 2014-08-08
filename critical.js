/*global require:true*/
/*global console:true*/
/*global __dirname:true*/
(function( exports ){
	"use strict";

	var phantomJsPath = require("phantomjs").path;
	var execFile = require("child_process").execFile;
	var path = require( "path" );

	exports.findCritical = function( url, opts, cb ){
		var defaultCb = function( err, output ){
			if( err ){
				throw new Error( err );
			} else {
				console.log( output );
			}
		};

		if( typeof url !== "string" ){
			throw new TypeError( "URL must be a string" );
		}

		if( typeof opts === "undefined" && typeof cb === "undefined" ){
			opts = {};
			cb = defaultCb;
		}

		if( typeof opts === "function" ){
			cb = opts;
			opts = {};
		}

		var width = opts.width || 1200;
		var height = opts.height || 900;
		var filename = opts.filename || "all.css";
		var cookies = opts.cookies;

		if( cookies ){
			cookies = JSON.stringify( cookies );
		}

		execFile( phantomJsPath,
			[
				path.resolve( path.join( __dirname, "lib", "criticalrunner.js" ) ),
				url,
				filename,
				width,
				height,
				cookies
			],

			function(err, stdout, stderr){
				if( err ){
					console.log("\nSomething went wrong with phantomjs...");
					if( stderr ){
						err.message = stderr;
					}
					cb( err, null );
				} else {
					var output = JSON.parse(stdout);
					cb( null, output.css );
				}

			}
		);

	};

}(typeof exports === "object" && exports || this));
