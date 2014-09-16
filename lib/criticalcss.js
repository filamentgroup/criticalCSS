/*
criticalCSS by @scottjehl && @jefflembeck. Run this on your CSS, get the styles that are applicable in the viewport (critical). The url arg should be any part of the URL of the stylesheets you"d like to parse. So, "all.css" or "/css/" would both work.
*/
(function(exports){
	"use strict";

	var criticalCSS = function( url, opts ){
		if( !url ){
			throw new Error( "URL needs to be passed into criticalCSS for it to run" );
		}
		var sheets = opts.sheets,
			maxTop = opts.maxTop,
			forced = opts.forceInclude;

		var notNull = function( el ){
			return el !== null;
		};

		var noEmpties = function( el ){
			return el !== "";
		};

		var isForced = function( rule ){
			return forced.some(function(selector){
				return !!rule.selectorText && rule.selectorText.match( selector );
			});
		};

		var aboveFold = function( rule ){
			var selectors, criticalSelectors;

			if( !rule.selectorText ){
				return false;
			}
			if( forced.length && isForced( rule ) ){
				return rule.cssText;
			}

			selectors = rule.selectorText.split(",");
			criticalSelectors = opts.criticalSelectorList( selectors, maxTop );

			if( criticalSelectors.length ){
				return criticalSelectors.join(",") + rule.cssText.match( /\{.+/ );
			} else {
				return false;
			}
		};

		var getCriticalRules = function(rule){
			var media = rule.media,
				matchingRules = [],
				critCSSText;

			if( media ){
				var innerRules = rule.cssRules || [];

				innerRules = Array.prototype.filter.call( innerRules, notNull );

				matchingRules = innerRules.map( aboveFold ).filter( function( mr ){
					return !!mr;
				});

				if( matchingRules.length ){
					matchingRules.unshift( "@media " + media.mediaText + "{" );
					matchingRules.push( "}" );
				}

			} else {
				critCSSText = aboveFold( rule );
				if( critCSSText && !critCSSText.match(/^\s+$/) ){
					matchingRules.push( critCSSText );
				}
			}
			return matchingRules;
		};

		sheets = Array.prototype.filter.call(sheets, notNull);

		sheets = sheets.filter(function(sheet){
			var href = sheet.href;

			if( href && href.indexOf( url ) > -1 ){
				return sheet;
			}
		});

		var rulesList = sheets.map(function( sheet ){
			return sheet.rules;
		});

		var critical = rulesList.map(function(rules){
			rules = Array.prototype.filter.call( rules, notNull );

			var criticalRulesList = rules.map(getCriticalRules);

			return criticalRulesList.map(function(cr){
				cr = cr.filter( noEmpties );
				return cr.join( "\n" );
			});
		});

		critical = critical.reduce(function(a, b) {
			return a.concat(b);
		});

		critical = critical.filter( noEmpties );

		return critical.join( "\n" );
	};

	exports.criticalCSS = criticalCSS;

}(typeof exports === "object" && exports || this));
