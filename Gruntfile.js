/*global module:true*/
/*global require:true*/
(function(){
	"use strict";

	var path = require( "path" );

	module.exports = function(grunt) {

		// Project configuration.
		grunt.initConfig({
			nodeunit: {
				files: ["test/**/*_test.js"]
			},
			jshint: {
				options: {
					jshintrc: ".jshintrc"
				},
				gruntfile: {
					src: "Gruntfile.js"
				},
				lib: {
					src: ["lib/**/*.js"]
				},
				test: {
					src: ["test/**/*.js"]
				}
			},
			watch: {
				gruntfile: {
					files: "<%= jshint.gruntfile.src %>",
					tasks: ["jshint:gruntfile"]
				},
				lib: {
					files: "<%= jshint.lib.src %>",
					tasks: ["jshint:lib", "nodeunit"]
				},
				test: {
					files: "<%= jshint.test.src %>",
					tasks: ["jshint:test", "nodeunit"]
				}
			},
			connect: {
				server: {
					options: {
						port: 9001,
						base: path.join( "test", "files" )
					}
				}
			}
		});

		// These plugins provide necessary tasks.
		grunt.loadNpmTasks("grunt-contrib-nodeunit");
		grunt.loadNpmTasks("grunt-contrib-jshint");
		grunt.loadNpmTasks("grunt-contrib-watch");
		grunt.loadNpmTasks("grunt-contrib-connect");

		grunt.registerTask("test", ["jshint", "connect", "nodeunit"]);

		// Default task.
		grunt.registerTask("default", ["test"]);

	};
}());
