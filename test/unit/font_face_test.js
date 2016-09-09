/*global require:true*/
(function( exports ){
	"use strict";

	var path = require("path");
	var critical = require(path.join( "..", "..", "critical.js") );
	var fs = require("fs");

	function readTestCSSFile(name){
		return fs
			.readFileSync(path.join(__dirname, "..", "files", name + ".css"))
			.toString();
	}

	function testDefs(test, opts) {
		test.expect(1);

		var result = critical
					.restoreFontFaces(opts.original, opts.critical, { compress: true })
					.replace(/\s/g, "");

		test.equal(result, opts.expected.replace(/\s/g, ""));
		test.done();
	}

	exports.fontFaceRules = {
		"adds font-face back in": function(test) {
			testDefs(test, {
				original: readTestCSSFile("font-face"),
				critical: readTestCSSFile("font-face-critical"),
				expected: readTestCSSFile("font-face-expected")
			});
		}
	};
}(typeof exports === "object" && exports || this));
