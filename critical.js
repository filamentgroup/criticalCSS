/*global require:true*/
/*global console:true*/
/*global __dirname:true*/
(function( exports ){
	"use strict";

	var phantomJsPath = require("phantomjs").path;
	var execFile = require("child_process").execFile;
	var path = require( "path" );
	var fs = require( "fs" );
	var os = require( "os" );

	var DEFAULT_BUFFER_SIZE = 800*1024; //had this as the set val before, don't want to break things

	exports.getRules = function( url, opts, cb ){
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

		if( !fs.existsSync( url ) ){
			throw new Error( "CSS file must exist" );
		}

		if( typeof opts === "undefined" && typeof cb === "undefined" ){
			opts = {};
			cb = defaultCb;
		}

		if( typeof opts === "function" ){
			cb = opts;
			opts = {};
		}

		var bufferSize = opts.buffer || DEFAULT_BUFFER_SIZE;

		execFile( phantomJsPath,
			[
				path.resolve( path.join( __dirname, "lib", "rules.js" ) ),
				url
			],
			{
				maxBuffer: bufferSize
			},

			function(err, stdout, stderr){
				if( err ){
					console.log("\nSomething went wrong with phantomjs...");
					if( stderr ){
						err.message = stderr;
					}
					cb( err, null );
				} else {
					stdout = stdout.replace("Unsafe JavaScript attempt to access frame with URL about:blank from frame with URL ", "");
					stdout = stdout.replace(/file:\/\/.*rules.js\./, "");
					stdout = stdout.replace(" Domains, protocols and ports must match.\n\n", "");
					stdout = stdout.replace(" Domains, protocols and ports must match.\r\n\r\n", ""); //windows
					cb( null, stdout );
				}

			}
		);
	};

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
		var forceInclude = opts.forceInclude || [];
		var rules = opts.rules || [];
		var tmpfile;

		var bufferSize = opts.buffer || DEFAULT_BUFFER_SIZE;


		if( !Array.isArray( forceInclude ) ){
			throw new Error( "forceInclude must be an array of selectors" );
		}

		var rulesString = JSON.stringify( rules );

		//var MAX_ARG_STRLEN = 131072; // on unix machines, the longest string an argument can be
		tmpfile = path.join( os.tmpdir(), "criticalcss-findcritical-rules" + (new Date()).getTime() );
		try {
			fs.writeFileSync( tmpfile, rulesString );
		} catch( e ){
			throw e;
		}

		var execArgs = [
				path.resolve( path.join( __dirname, "lib", "criticalrunner.js" ) ),
				url,
				width,
				height,
				JSON.stringify( forceInclude ),
				tmpfile
		];

		if( opts.ignoreConsole ){
			execArgs.push( "--ignoreConsole" );
		}

		execFile( phantomJsPath,
						 execArgs,
			{
				maxBuffer: bufferSize
			},

			function(err, stdout, stderr){
				if( err ){
					console.log("\nSomething went wrong with phantomjs...");
					if( stderr ){
						err.message = stderr;
					}
					cb( err, null );
				} else {
					cb( null, stdout );
				}

				if( fs.existsSync(tmpfile) ){
					fs.unlinkSync(tmpfile);
				}
			}
		);

	};

}(typeof exports === "object" && exports || this));
