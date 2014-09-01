/*
criticalCSS by @scottjehl && @jefflembeck. Run this on your CSS, get the styles that are applicable in the viewport (critical). The url arg should be any part of the URL of the stylesheets you"d like to parse. So, "all.css" or "/css/" would both work.
*/
(function(exports){
	"use strict";

	var criticalCSS = function( rules, opts ){
		var maxTop = opts.maxTop,
			forced = opts.forceInclude;

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

		var criticalRulesList = rules.map(getCriticalRules);

		var critical = criticalRulesList.map(function(cr){
			cr = cr.filter( noEmpties );
			return cr.join( "\n" );
		});

		critical = critical.filter( noEmpties );

		if( critical.length  === 0 ){ return ""; }
		return critical.join( "\n" );
	};

	exports.criticalCSS = criticalCSS;

}(typeof exports === "object" && exports || this));
