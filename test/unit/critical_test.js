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
			critical.findCritical( "http://localhost:9001/test-site.html", function( err, content ){
				if( err ){
					throw new Error( err );
				} else {
					test.equal( content, "h1{ font-size: 2em; }\np{ font-size: 1.5em; font-weight: bold; }", "Content should match" );
				}
				test.done();
			});
		},
		"url given": function( test ){
			test.expect(1);

			critical.findCritical( "http://localhost:9001/test-site.html", { height: 1000 }, function( err, content ){
				if( err ){
					throw new Error( err );
				} else {
					test.equal( content, "h1{ font-size: 2em; }\np{ font-size: 1.5em; font-weight: bold; }\ndiv{ font-size: 2.5em; font-weight: normal; margin-top: 900px; }\n@media (min-width: 1100px){\ndiv{ font-size: 3em; }\n}", "Content should match" );
				}
				test.done();
			});
		},
		"url given - throws error if filename not found": function( test ){
			test.expect(1);

			critical.findCritical( "http://localhost:9001/test-site.html", { width: 900, height: 1000, filename: "notthere.css" }, function(err){
				if( err ){
					test.ok( err.message.match( "The filename you have given is not found at this url." ) );
				}
				test.done();
			});
		},
		"forceInclude includes selectors": function( test ){
			test.expect(1);

			critical.findCritical( "http://localhost:9001/test-site.html",
														{ width: 900, height: 1000, forceInclude: [".collapsible"] },
														function( err, content ){
				if( err ){
					throw new Error( err );
				} else {
					test.equal( content, "h1{ font-size: 2em; }\np{ font-size: 1.5em; font-weight: bold; }\ndiv{ font-size: 2.5em; font-weight: normal; margin-top: 900px; }\n.collapsible { text-indent: -9999px; }\n@media (min-width: 1100px){\ndiv{ font-size: 3em; }\n}", "Content should match" );
				}
				test.done();
			});
		},
		"forceInclude expects array": function( test ){
			test.expect(1);

			test.throws(function(){
				critical.findCritical( "http://localhost:9001/test-site.html", { width: 900, height: 1000, forceInclude: ".collapsible" });
			}, Error, "Must be array");
			test.done();
		},
		"include forceInclude's parent media query": function( test ){
			test.expect(1);

			critical.findCritical( "http://localhost:9001/test-site-forcedmq.html",
														{ width: 900, height: 1000, filename: "forcedmq.css", forceInclude: [".collapsible"] },
														function( err, content ){
				if( err ){
					throw new Error( err );
				} else {
					test.equal( content, "h1{ font-size: 2em; }\np{ font-size: 1.5em; font-weight: bold; }\ndiv{ font-size: 2.5em; font-weight: normal; margin-top: 900px; }\n@media (max-width: 30em){\n.collapsible { text-indent: -9999px; }\n}\n@media (min-width: 1100px){\ndiv{ font-size: 3em; }\n}", "Content should match" );
				}
				test.done();
			});
		},
		"display none should not show": function( test ){
			test.expect(1);

			critical.findCritical( "http://localhost:9001/test-site-with-display-none.html",
														{ width: 900, height: 1000, filename: "all-with-display-none.css" },
														function( err, content ){
				if( err ){
					throw new Error( err );
				} else {
					test.equal( content, "h1{ font-size: 2em; }\np{ font-size: 1.5em; font-weight: bold; }\ndiv{ font-size: 2.5em; font-weight: normal; margin-top: 900px; }\n@media (min-width: 1100px){\ndiv{ font-size: 3em; }\n}", "Content should match" );
				}
				test.done();
			});
		}
	};
}(typeof exports === "object" && exports || this));
