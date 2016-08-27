/*global require:true*/
(function( exports ){
	"use strict";

	var path = require( "path" );
	var critical = require(path.join( "..", "..", "critical.js") );

	function testDefs(test, opts) {
		test.expect(1);

		var result = critical
					.restoreOriginalDefs(opts.original, opts.critical, { compress: true })
					.replace(/\s/g, "");

		test.equal(result, opts.expected.replace(/\s/g, ""));
		test.done();
	}

	exports.restoreOriginalDefs = {
		"adds stripped definitions": function(test) {
			testDefs(test, {
				original: "body { color: red; }",
				critical: "body {}",
				expected: "body { color:red; }"
			});
		},

		"adds muliple stripped definitions": function(test) {
			testDefs(test, {
				original: "body { color: red; font-size: 20px; }",
				critical: "body {}",
				expected: "body { color:red; font-size:20px; }"
			});
		},

		"does not include removed selectors": function(test) {
			testDefs(test, {
				original: "body { color: red; } div.removed {}",
				critical: "body {}",
				expected: "body { color:red; }"
			});
		},

		"includes media queries": function(test) {
			testDefs(test, {
				original: "@media (max-width: 600px) { body { color: red; } div.removed {} }",
				critical: "@media (max-width: 600px) { body {} }",
				expected: "@media (max-width: 600px) { body { color:red; } }"
			});
		}
	};
}(typeof exports === "object" && exports || this));
