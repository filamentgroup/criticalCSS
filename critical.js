/*global require:true*/
/*global console:true*/
/*global __dirname:true*/
/* eslint esnext: true */

(function( exports ){
	"use strict";

	var execFile = require("child_process").execFile;
	var path = require( "path" );
	var fs = require( "fs" );
	var os = require( "os" );
	var postcss = require( "postcss" );
	var css = require("css");
	var _ = require("lodash");
	const extract = require("./lib/extract.js");
	const rules = require("./lib/rules.js");

	// add finally to build in Promise, will no-op when added to node
	require('promise.prototype.finally').shim();

	exports.getRules = function( cssfile, opts, cb ){
		var defaultCb = function( err, output ){
			if( err ){
				throw new Error( err );
			}
		};

		if( typeof cssfile !== "string" ){
			throw new TypeError( "The CSS filename must be a string" );
		}

		if( !fs.existsSync( cssfile ) ){
			throw new Error( "CSS file must exist" );
		}

		if( typeof opts === "undefined" && typeof cb === "undefined" ){
			opts = {};
			cb = defaultCb;
		}

		if( typeof opts === "function" ){
			cb = opts;
			opts = {};
		}

		cb = cb || defaultCb;

		return rules(cssfile)
			.then((rules) => { cb(null, rules); return rules; })
			.catch((err) => cb(err, null));
	};

	exports.findCritical = function( url, opts, cb ){
		var defaultCb = function( err, output ){
			if( err ){
				throw new Error( err );
			}
		};

		if( typeof url !== "string" ){
			throw new TypeError( "URL must be a string" );
		}

		if( typeof opts === "undefined" && typeof cb === "undefined" ){
			opts = {};
			cb = defaultCb;
		}

		if( typeof opts === "function" ){
			cb = opts;
			opts = {};
		}

		cb = cb || defaultCb;

		var width = opts.width || 1200;
		var height = opts.height || 900;
		var forceInclude = opts.forceInclude || [];
		var rules = opts.rules || [];
		var usepostcss = opts.postcss;
		var tmpfile;

		if( !Array.isArray( forceInclude ) ){
			throw new Error( "forceInclude must be an array of selectors" );
		}

		var rulesString = JSON.stringify( rules );

		// TODO use "tmp" file library instead of date time
		tmpfile = path.join( os.tmpdir(), "criticalcss-findcritical-rules" + (new Date()).getTime());
		try {
			fs.writeFileSync( tmpfile, rulesString );
		} catch( e ){
			throw e;
		}


		// TODO switch tmpfile to js object
		return extract(url, width, height, forceInclude, tmpfile)
			.then((critCSS) => {
				if( usepostcss ){
					return postcss([ require('postcss-initial') ])
						.process(critCSS)
						.then(function (result) {
							cb(null, result.css);

							return result.css;
						});
				}

				cb( null, critCSS);
				return critCSS;
			})
			.catch((err) => cb(err, null))
			.finally(() => {
				if( fs.existsSync(tmpfile) ){
					fs.unlinkSync(tmpfile);
				}
			});
	};

	// create a function that can be passed to `map` for a collection of critical
	// css rules. The function will match original rules against the selector of
	// the critical css declarations, concatenate them together, and then keep
	// only the unique ones
	function replaceDecls(originalRules, check){
		return function(criticalRule){
			// restrict the declaration mapping to a certain type of rule, e.g. 'rule'
			// or 'media'
			if(check && !check(criticalRule.type)){
				return criticalRule;
			}

			// find all the rules in the original CSS that have the same selectors and
			// then create an array of all the associated declarations. Note that this
			// works with mutiple duplicate selectors on the original CSS
			var originalDecls = _.flatten(
				originalRules
					.filter(function(rule){
						return _.isEqual(rule.selectors, criticalRule.selectors);
					})
					.map(function(rule){
						return rule.declarations;
					})
			);

			// take all the declarations that were found from the original CSS and use
			// them here, make sure that we de-dup any declarations from the original CSS
			criticalRule.declarations =
				_.uniqBy(criticalRule.declarations.concat(originalDecls),	function(decl){
					return decl.property + ":" + decl.value;
				});

			return criticalRule;
		};
	}

	var nested = ["media", "supports", "document"];

	exports.restoreOriginalDefs = function(originalCSS, criticalCSS, stringifyOpts){
		// parse both the original CSS and the critical CSS so we can deal with the
		// ASTs directly
		var originalAST = css.parse(originalCSS);
		var criticalAST = css.parse(criticalCSS);

		var newRules;

		// run two maps over the rules in the critical CSS
		//
		// 1. map the top level rules to rules where the declarations are replaced
		//		by the declarations from the same selectors in the original CSS
		// 2. map the media query rules to rules where the declarations are replaced
		//		by the declarations from the same selectors in the same media queries
		//		in the original CSS
		newRules = criticalAST
			.stylesheet
			.rules
			// for all the top level rules that are in the criticalCSS AST replace them
			// with the original rule definitions from the original AST
			.map(replaceDecls(originalAST.stylesheet.rules, function(ruleType){
				// only deal with top level rules here
				return ruleType === "rule";
			}))
			// for all the rules that are in media queries match the same media
			// queries in the original and use the rules from there
			.map(function(criticalNested){
				// handle media rules only here
				if( nested.indexOf(criticalNested.type) == -1){
					return criticalNested;
				}

				var type = criticalNested.type;

				// find all the rules that apply for the current media query
				var originalMediaRules;

				// get all of the rules inside media queries that match the critical
				// media query media string
				originalMediaRules = _.flatten(
					originalAST
						.stylesheet
						.rules
						.filter(function(rule){
							return rule[type] == criticalNested[type];
						})
						.map(function(media){
							return media.rules;
						})
				);

				// replace the declarations in each of the rules for this media query
				// with the declarations in the original css for the same media query
				criticalNested.rules = criticalNested
					.rules
					.map(replaceDecls(originalMediaRules));

				return criticalNested;
			});

		criticalAST.stylesheet.rules = newRules;

		// return the CSS as a string
		return css.stringify(criticalAST, stringifyOpts);
	};

	function collectFontFamilies(rule){
		return rule.declarations.reduce(function(acc, decl){
			if(decl.property === "font-family"){
				acc.push(decl.value);
			}

			return acc;
		}, []);
	}

	exports.restoreFontFaces = function(originalCSS, criticalCSS, stringifyOpts){
		// parse both the original CSS and the critical CSS so we can deal with the
		// ASTs directly
		var originalAST = css.parse(originalCSS);
		var criticalAST = css.parse(criticalCSS);

		var fontFaceRules, requiredFontFamilies, requiredFontFaces;

		fontFaceRules = originalAST
			.stylesheet
			.rules
			.filter(function(rule){
				return rule.type === "font-face";
			});

		requiredFontFamilies = criticalAST
			.stylesheet
			.rules
			.reduce(function(acc, rule){
				var type = rule.type;

				if(type === "rule") {
					return acc.concat(collectFontFamilies(rule));
				} else if (nested.indexOf(type) > -1){
					return acc.concat(_.flatten(rule.rules.map(function(nestedRule){
						return collectFontFamilies(nestedRule);
					})));
				} else {
					return acc;
				}
			}, []);

		requiredFontFaces = requiredFontFamilies.reduce(function(acc, requiredFamily){
			return acc.concat(fontFaceRules.filter(function(fontFace){
				var familyNameDecls, familyName;

				familyNameDecls = fontFace
					.declarations
					.filter(function(decl){
						return decl.property == "font-family";
					});

				// choose the value of the last of many possibly family name declarations
				familyName = familyNameDecls[familyNameDecls.length - 1]
					.value
					.replace(/'|"/g, "");

				// if the required family matches the family name of the rule
				// then we want to keep this font face
				return requiredFamily.indexOf(familyName) > -1;
			}));
		}, []);

		// the above reduce will include each font face for every appearence
		// in a `font-family` declaration, here we remove duplicates
		requiredFontFaces = _.uniq(requiredFontFaces);

		// prepend the font faces to the critical css output
		criticalAST.stylesheet.rules =
			requiredFontFaces.concat(criticalAST.stylesheet.rules);

		return css.stringify(criticalAST, stringifyOpts);
	};

}(typeof exports === "object" && exports || this));
