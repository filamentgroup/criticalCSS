/*global require:true*/
/*global console:true*/
(function( exports ){
	"use strict";

	var phantomJsPath = require('phantomjs').path;
	var execFile = require('child_process').execFile;
	var path = require( 'path' );

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
		var output = opts.output || "dist.css";
		var filename = opts.filename || "all.css";


		execFile( phantomJsPath,
			[
				path.join( 'lib', 'criticalrunner.js' ),
				url,
				filename,
				output,
				width,
				height
			],

			function(err, stdout, stderr){
				console.log( "Hi" );
				if( err ){
					console.log("\nSomething went wrong with phantomjs...");
					if( stderr ){
						console.log( stderr );
					}
					cb( err, null );
				} else {
					console.log( stdout );
					cb( null, stdout );
				}

			}
		);

	};

}(typeof exports === 'object' && exports || this));
