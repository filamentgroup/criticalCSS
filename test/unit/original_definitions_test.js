/*global require:true*/
/*global __dirname:true*/
(function( exports ){
	"use strict";

	var path = require( "path" );
	var critical = require(path.join( "..", "..", "critical.js") );

	exports.installOriginalDefinitions = {
		"adds stripped definitions": function(test) {
			test.expect(1);
			// tests here
			var originalCSS = "body { color: red; }";
			var criticalCSS = "body {}";

			var result = critical
						.installOriginalDefinitions(originalCSS, criticalCSS, { compress: true });

			test.equal(result, "body{color:red;}");
			test.done();
		},

		"adds muliple stripped definitions": function(test) {
			test.expect(1);
			// tests here
			var originalCSS = "body { color: red; font-size: 20px; }";
			var criticalCSS = "body {}";

			var result = critical
						.installOriginalDefinitions(originalCSS, criticalCSS, { compress: true });

			test.equal(result, "body{color:red;font-size:20px;}");
			test.done();
		},

		"does not include removed selectors": function(test) {
			test.expect(1);
			// tests here
			var originalCSS = "body { color: red; } div.removed {}";
			var criticalCSS = "body {}";

			var result = critical
						.installOriginalDefinitions(originalCSS, criticalCSS, { compress: true });

			test.equal(result, "body{color:red;}");
			test.done();
		}
	};
}(typeof exports === "object" && exports || this));
