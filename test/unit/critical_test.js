/*
	======== A Handy Little Nodeunit Reference ========
	https://github.com/caolan/nodeunit

	Test methods:
		test.expect(numAssertions)
		test.done()
	Test assertions:
		test.ok(value, [message])
		test.equal(actual, expected, [message])
		test.notEqual(actual, expected, [message])
		test.deepEqual(actual, expected, [message])
		test.notDeepEqual(actual, expected, [message])
		test.strictEqual(actual, expected, [message])
		test.notStrictEqual(actual, expected, [message])
		test.throws(block, [error], [message])
		test.doesNotThrow(block, [error], [message])
		test.ifError(value)
*/

/*global require:true*/
/*global __dirname:true*/
(function( exports ){
	"use strict";

	var path = require( "path" );
	var critical = require(path.join( "..", "..", "critical.js") );


	exports.findCritical = {
		setUp: function(done) {
			// setup here
			done();
		},
		tearDown: function( done ){
			done();
		},
		"no args": function(test) {
			test.expect(1);
			// tests here
			test.throws( function(){
				critical.findCritical();
			}, TypeError, "Should throw type error if there is no url" );
			test.done();
		},
		"url given but is not string": function( test ){
			test.expect(1);
			// tests here
			test.throws( function(){
				critical.findCritical(5);
			}, TypeError, "Should throw type error if there is no url" );
			test.done();
		},
		"url given - some content out of frame": function( test ){
			test.expect(1);
			critical.findCritical( path.resolve( path.join( __dirname, "..", "files", "test-site.html" ) ), function( err, content ){
				if( err ){
					throw new Error( err );
				} else {
					test.equal( content, "h1{ font-size: 2em; }\np{ font-size: 1.5em; font-weight: bold; }\n\n", "Content should match" );
				}
				test.done();
			});
		},
		"url given": function( test ){
			test.expect(1);

			critical.findCritical( path.resolve( path.join( __dirname, "..", "files", "test-site.html" ) ), { height: 1000 }, function( err, content ){
				if( err ){
					throw new Error( err );
				} else {
					test.equal( content, "h1{ font-size: 2em; }\np{ font-size: 1.5em; font-weight: bold; }\ndiv{ font-size: 2.5em; font-weight: normal; margin-top: 900px; }\n@media (min-width: 1100px){\ndiv{ font-size: 3em; }\n}", "Content should match" );
				}
				test.done();
			});
		},
		"url given - doesn't match MQ": function( test ){
			test.expect(1);

			critical.findCritical( path.resolve( path.join( __dirname, "..", "files", "test-site.html" ) ), { width: 900, height: 1000 }, function( err, content ){
				if( err ){
					throw new Error( err );
				} else {
					test.equal( content, "h1{ font-size: 2em; }\np{ font-size: 1.5em; font-weight: bold; }\ndiv{ font-size: 2.5em; font-weight: normal; margin-top: 900px; }\n", "Content should match" );
				}
				test.done();
			});
		},
		"url given - throws error if filename not found": function( test ){
			test.expect(1);

			critical.findCritical( path.resolve( path.join( __dirname, "..", "files", "test-site.html" ) ), { width: 900, height: 1000, filename: "notthere.css" }, function(err){
				if( err ){
					test.ok( err.message.match( "The filename you have given is not found at this url." ) );
				}
				test.done();
			});
		}
	};
}(typeof exports === "object" && exports || this));
