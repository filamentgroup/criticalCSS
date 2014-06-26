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
	'use strict';

	var path = require( 'path' );
	var critical = require(path.join( "..", "..", "critical.js") );


	exports.findCritical = {
		setUp: function(done) {
			// setup here
			done();
		},
		tearDown: function( done ){
			done();
		},
		'no args': function(test) {
			test.expect(1);
			// tests here
			test.throws( function(){
				critical.findCritical();
			}, TypeError, "Should throw type error if there is no url" );
			test.done();
		},
		'url given but is not string': function( test ){
			test.expect(1);
			// tests here
			test.throws( function(){
				critical.findCritical(5);
			}, TypeError, "Should throw type error if there is no url" );
			test.done();
		}
	};
}(typeof exports === 'object' && exports || this));
