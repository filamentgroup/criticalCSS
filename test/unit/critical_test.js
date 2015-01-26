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

	var allJSRules = [{"cssText":"h1 { font-size: 2em; }","selectorText":"h1","cssRules":[]},{"cssText":"p { font-size: 1.5em; font-weight: bold; }","selectorText":"p","cssRules":[]},{"cssText":"div { font-size: 2.5em; font-weight: normal; margin-top: 900px; }","selectorText":"div","cssRules":[]},{"cssText":".collapsible { text-indent: -9999px; }","selectorText":".collapsible","cssRules":[]},{"media": {"0":"(min-width: 1100px)","length":1,"mediaText":"(min-width: 1100px)"},"cssText":"@media (min-width: 1100px) { \\n  div { font-size: 3em; }\\n}","cssRules":[{"cssText":"div { font-size: 3em; }","selectorText":"div","cssRules":[]}]}];
	var forcedMQRules = [{"cssText":"h1 { font-size: 2em; }","selectorText":"h1","cssRules":[]},{"cssText":"p { font-size: 1.5em; font-weight: bold; }","selectorText":"p","cssRules":[]},{"cssText":"div { font-size: 2.5em; font-weight: normal; margin-top: 900px; }","selectorText":"div","cssRules":[]},{"media":{"0":"(max-width: 30em)","length":1,"mediaText":"(max-width: 30em)"},"cssText":"@media (max-width: 30em) { \n  .collapsible { text-indent: -9999px; }\n}","cssRules":[{"cssText":".collapsible { text-indent: -9999px; }","selectorText":".collapsible","cssRules":[]}]},{"media":{"0":"(min-width: 1100px)","length":1,"mediaText":"(min-width: 1100px)"},"cssText":"@media (min-width: 1100px) { \n  div { font-size: 3em; }\n}","cssRules":[{"cssText":"div { font-size: 3em; }","selectorText":"div","cssRules":[]}]}];

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
			critical.findCritical( "http://localhost:9001/test-site.html", { rules: allJSRules  }, function( err, content ){
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

			critical.findCritical( "http://localhost:9001/test-site.html", { height: 1000, rules: allJSRules }, function( err, content ){
				if( err ){
					throw new Error( err );
				} else {
					test.equal( content, "h1{ font-size: 2em; }\np{ font-size: 1.5em; font-weight: bold; }\ndiv{ font-size: 2.5em; font-weight: normal; margin-top: 900px; }\n@media (min-width: 1100px){\ndiv{ font-size: 3em; }\n}", "Content should match" );
				}
				test.done();
			});
		},
		"forceInclude includes selectors": function( test ){
			test.expect(1);

			critical.findCritical( "http://localhost:9001/test-site.html",
														{ width: 900, height: 1000, forceInclude: [".collapsible"], rules: allJSRules },
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
				critical.findCritical( "http://localhost:9001/test-site.html", { width: 900, height: 1000, forceInclude: ".collapsible", rules: allJSRules });
			}, Error, "Must be array");
			test.done();
		},
		"include forceInclude's parent media query": function( test ){
			test.expect(1);

			critical.findCritical( "http://localhost:9001/test-site-forcedmq.html",
														{ width: 900, height: 1000, forceInclude: [".collapsible"], rules: forcedMQRules },
														function( err, content ){
				if( err ){
					throw new Error( err );
				} else {
					test.equal( content, "h1{ font-size: 2em; }\np{ font-size: 1.5em; font-weight: bold; }\ndiv{ font-size: 2.5em; font-weight: normal; margin-top: 900px; }\n@media (max-width: 30em){\n.collapsible { text-indent: -9999px; }\n}\n@media (min-width: 1100px){\ndiv{ font-size: 3em; }\n}", "Content should match" );
				}
				test.done();
			});
		},
		"passes even if JS is on page": function( test ){
			test.expect(1);

			critical.findCritical( "http://localhost:9001/test-site-loading.html", { height: 1000, rules: allJSRules }, function( err, content ){
				if( err ){
					throw new Error( err );
				} else {
					test.equal( content, "h1{ font-size: 2em; }\np{ font-size: 1.5em; font-weight: bold; }\ndiv{ font-size: 2.5em; font-weight: normal; margin-top: 900px; }\n@media (min-width: 1100px){\ndiv{ font-size: 3em; }\n}", "Content should match" );
				}
				test.done();
			});
		},
		"console ignored": function( test ){
			test.expect(1);

			critical.findCritical( "http://localhost:9001/test-site-console.html", { height: 1000, rules: allJSRules, ignoreConsole: true }, function( err, content ){
				if( err ){
					throw new Error( err );
				} else {
					test.equal( content, "h1{ font-size: 2em; }\np{ font-size: 1.5em; font-weight: bold; }\ndiv{ font-size: 2.5em; font-weight: normal; margin-top: 900px; }\n@media (min-width: 1100px){\ndiv{ font-size: 3em; }\n}", "Content should match" );
				}
				test.done();
			});
		}
	};

	exports.getRules = {
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
				critical.getRules();
			}, TypeError, "Should throw type error if there is no url" );
			test.done();
		},
		"url given but is not string": function( test ){
			test.expect(1);
			// tests here
			test.throws( function(){
				critical.getRules(5);
			}, TypeError, "Should throw type error if there is no url" );
			test.done();
		},
		"url given": function( test ){
			test.expect(1);
			// tests here
			critical.getRules(path.resolve(path.join(__dirname, "..", "files", "all.css")), function( err, content ){
				if( err ){
					throw new Error( err );
				} else {
					test.equal( content, "[{\"cssText\":\"h1 { font-size: 2em; }\"," +
										"\"selectorText\":\"h1\",\"cssRules\":[]}," +
										"{\"cssText\":\"p { font-size: 1.5em; font-weight: bold; }\"," +
										"\"selectorText\":\"p\",\"cssRules\":[]}," +
										"{\"cssText\":\"div { font-size: 2.5em; font-weight: normal; margin-top: 900px; }\"," +
										"\"selectorText\":\"div\",\"cssRules\":[]}," +
										"{\"cssText\":\".collapsible { text-indent: -9999px; }\"," +
										"\"selectorText\":\".collapsible\",\"cssRules\":[]},{\"media\":" +
										"{\"0\":\"(min-width: 1100px)\",\"length\":1,\"mediaText\":" +
										"\"(min-width: 1100px)\"},\"cssText\":\"@media (min-width: 1100px) " +
										"{ \\n  div { font-size: 3em; }\\n}\",\"cssRules\":[{\"cssText\"" +
										":\"div { font-size: 3em; }\",\"selectorText\":\"div\",\"cssRules\"" +
										":[]}]}]", "Content should match" );
				}
				test.done();
			});
		},
		"opera dpi rules": function( test ){
			critical.getRules(path.resolve(path.join(__dirname, "..", "files", "dpi.css")), function( err, content ){
				// Just trying to avoid an error at this point, Phantom blows up on this MQ
				if( err ){ throw err; }

				test.equal( content, "[]");
				test.done();
			});
		},
		"pseudo-selector": function( test ){
			test.expect(1);
			// tests here
			critical.getRules(path.resolve(path.join(__dirname, "..", "files", "all-pseudo.css")), function( err, content ){
				if( err ){
					throw new Error( err );
				} else {
					test.equal( content, "[{\"cssText\":\"h1 { font-size: 2em; }\"," +
										"\"selectorText\":\"h1\",\"cssRules\":[]},{\"cssText\":" +
										"\"p { font-size: 1.5em; font-weight: bold; }\"," +
										"\"selectorText\":\"p\",\"cssRules\":[]}," +
										"{\"cssText\":\".collapsible { text-indent: -9999px; }\"," +
										"\"selectorText\":\".collapsible\",\"cssRules\":[]}," +
										"{\"cssText\":\".clear-container::before, " +
										".clear-container::after { content: \' \'; display: table; }\"," +
										"\"selectorText\":\".clear-container::before, .clear-container::after\"," +
										"\"cssRules\":[]},{\"cssText\":\".clear-container::after { clear: both; }\"," +
										"\"selectorText\":\".clear-container::after\",\"cssRules\":[]}," +
										"{\"cssText\":\".clear { float: left; }\",\"selectorText\":\".clear\"," +
										"\"cssRules\":[]},{\"media\":{\"0\":\"(min-width: 1100px)\"," +
										"\"length\":1,\"mediaText\":\"(min-width: 1100px)\"}," +
										"\"cssText\":\"@media (min-width: 1100px) " +
										"{ \\n  div { font-size: 3em; }\\n}\"," +
										"\"cssRules\":[{\"cssText\":\"div { font-size: 3em; }\"," +
										"\"selectorText\":\"div\",\"cssRules\":[]}]}]", "Content should match" );
				}
				test.done();
			});
		}
	};
}(typeof exports === "object" && exports || this));
