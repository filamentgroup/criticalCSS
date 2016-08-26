/*global require:true*/
/*global __dirname:true*/
(function( exports ){
	"use strict";

	var path = require( "path" );
	var critical = require(path.join( "..", "..", "critical.js") );

	exports.installOriginalDefinitions = {
		setUp: function(done) {
			// setup here
			done();
		},
		tearDown: function( done ){
			done();
		},
		"adds stripped definitions": function(test) {
			test.expect(1);
			// tests here
			var originalCSS = "body { color: red; } div {}";
			var criticalCSS = "body { color: blue; }";

			var result = critical
						.installOriginalDefinitions(originalCSS, criticalCSS, { compress: true });

			test.equal(result, "body{color:red;}");
			test.done();
		}
	};
}(typeof exports === "object" && exports || this));
