/*
criticalCSS by @scottjehl. Run this on your CSS, get the styles that are applicable in the viewport (critical). The url arg should be any part of the URL of the stylesheets you'd like to parse. So, 'all.css' or '/css/' would both work.
*/
(function(exports){
	"use strict";
	/**
	 * opts
	 * opts.sheets = document.styleSheets
	 * opts.maxTop = window.innerHeight
	 * opts.criticalSelectorList: function( list, maxTop ){
			return page.evaluate( function( selectors, maxTop ){
				var critical = [];
				for( var i = 0, l = selectors.length; i < l; i++ ){
					var elem = null;
					try {
						elem = window.document.querySelector( selectors[i] );
					} catch (e){}

					if( elem && elem.offsetTop <= maxTop ){
						critical.push( selectors[ i ] );
					}
				}
				return critical;
			}, list, maxTop );
		}
	 * opts.matchMedia = window.matchMedia
	 */
	var criticalCSS = function( url, opts ){
		var sheets = opts.sheets,
			maxTop = opts.maxTop,
			critical = [];

			var removeNull = function( el ){
				return el !== null;
			};

		var critCSSText;
		var aboveFold = function( rule ){
			if( !rule.selectorText ){
				return false;
			}
			var selectors = rule.selectorText.split(","),
				criticalSelectors = opts.criticalSelectorList( selectors, maxTop );
			if( criticalSelectors.length ){
				return criticalSelectors.join(",") + rule.cssText.match( /\{.+/ );
			}
			else {
				return false;
			}
		};

		sheets = Array.prototype.filter.call(sheets, removeNull);

		for( var i = 0, l = sheets.length; i < l; i++ ){
			var sheet = sheets[ i ],
				href = sheet.href,
				rules = sheet.rules;

				rules = Array.prototype.filter.call( rules, removeNull );

			if( url && href && href.indexOf( url ) > -1 ){
				for( var j = 0, rl = rules.length; j < rl; j++ ){
					var rule = rules[j];

					var media = rule.media,
						matchingRules = [];
					if( media && opts.matchMedia( media.mediaText ).matches ){
						var innerRules = rule.cssRules || [];

						innerRules = Array.prototype.filter.call( innerRules, removeNull );

						for( var k = 0, irl = innerRules.length; k < irl; k++ ){
							critCSSText = aboveFold( innerRules[ k ] );
							if( critCSSText ){
								matchingRules.push( critCSSText );
							}
						}
						if( matchingRules.length ){
							matchingRules.unshift( "@media " + media.mediaText + "{" );
							matchingRules.push( "}" );
						}

					} else if( !media ){
						critCSSText = aboveFold( rule );
						if( critCSSText && !critCSSText.match(/^\s+$/) ){
							matchingRules.push( critCSSText );
						}
					}
					critical.push( matchingRules.join( "\n" ) );
				}

			}
		}
		return critical.join( "\n" );
	};

	exports.criticalCSS = criticalCSS;

}(typeof exports === 'object' && exports || this));
