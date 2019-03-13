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

	exports.fontFaceRules = {
		"adds supports back in": function(test) {
			critical.getRules(path.join(__dirname, "..", "files", "supports.css"), function( err, content ){
				if( err ){
					throw new Error( err.message );
				}

				critical.findCritical( "http://localhost:9001/test-site-print.html", { rules: JSON.parse(content) }, function(err, content){

					if( err ){
						throw new Error( err.message );
					}

					test.equal(content.replace(/(\n|\s)/g, ""), readTestCSSFile("supports-expected").replace(/(\n|\s)/g, ""));
					test.done();
			});
		});
		}
	}
}(typeof exports === "object" && exports || this));
