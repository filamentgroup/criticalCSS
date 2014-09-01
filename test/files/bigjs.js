(function( window ){
	"use strict";

	var document = window.document;
	/*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license */
	window.matchMedia = window.matchMedia || (function() {

		// For browsers that support matchMedium api such as IE 9 and webkit
		var styleMedia = (window.styleMedia || window.media);

		// For those that don't support matchMedium
		if (!styleMedia) {
			var style       = document.createElement("style"),
				script      = document.getElementsByTagName("script")[0],
				info        = null;

			style.type  = "text/css";
			style.id    = "matchmediajs-test";

			script.parentNode.insertBefore(style, script);

			// "style.currentStyle" is used by IE <= 8 and "window.getComputedStyle" for all other browsers
			info = ("getComputedStyle" in window) && window.getComputedStyle(style, null) || style.currentStyle;

			styleMedia = {
				matchMedium: function(media) {
					var text = "@media " + media + "{ #matchmediajs-test { width: 1px; } }";

					// "style.styleSheet" is used by IE <= 8 and "style.textContent" for all other browsers
					if (style.styleSheet) {
						style.styleSheet.cssText = text;
					} else {
						style.textContent = text;
					}

					// Test if media query is true or false
					return info.width === "1px";
				}
			};
		}

		return function(media) {
			return {
				matches: styleMedia.matchMedium(media || "all"),
				media: media || "all"
			};
		};
	}());
}(this));

(function(window){
	"use strict";
	// HTML shim|v it for old IE (IE9 will still need the HTML video tag workaround)
	window.document.createElement( "picture" );
}(this));

(function( window ){
	"use strict";

	var document = window.document;

	if( typeof window.TEST === "undefined" ) {
		window.TEST = {};
	}

	var testVendorPrefixes = function( prop, unprefixedProp ) {
		var style = document.createElement("test").style,
			prefixes = "webkit Moz o ms".split(" ");

		if( unprefixedProp in style ) {
			return true;
		}
		for( var j = 0, k = prefixes.length; j < k; j++ ) {
			if( ( prefixes[ j ] + prop ) in style ) {
				return true;
			}
		}
		return false;
	};

	var supports = {
		// Thanks Modernizr & Erik Dahlstrom
		svg: !!window.document.createElementNS && !!window.document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect,

		// CSS box shadow
		boxshadow: testVendorPrefixes( "BoxShadow", "boxShadow" ),

		// CSS transitions
		csstransitions: (function(){
			var prefixes = "webkit Moz O Ms".split( " " ),
				supported = false,
				property;

				while( prefixes.length ){
					property = prefixes.shift() + "Transition";

					if ( property in document.documentElement.style !== undefined && property in document.documentElement.style !== false ) {
						supported = true;
						break;
					}
				}
				return supported;
		}())
	};



	window.TEST = {
		supports: supports,

		// Define default potential files to load
		files: {
			js: {
				global: "/_js/global.js",
				testid: "",
				externalApis: ""
			},
			css: {
				all: "/_css/all.css",
				fontsWOFF: "/_css/fonts-data-woff.css",
				fontsTTF: "/_css/fonts-data-ttf.css",
				bgSVG: "/_css/_grunticon/icons.data.svg.css",
				bgPNG: "/_css/_grunticon/icons.data.png.css",
				bgFallback: "/_css/_grunticon/icons.data.fallback.css"
			}
		},

		extConfig: {
			analyticsEnabled: false,
			i2aEnabled: false
		},

		components: {},

		// Overriding defaults
		initPage: window.extendFiles,

		acceptedCreditCards: [{
			"id": "mastercard",
			"regex": "^5[1-5]"
		},
		{
			"id": "visa",
			"regex": "^4"
		},
		{
			"id": "discover",
			"regex": "^6(011|5)"
		},
		{
			"id": "amex",
			"regex": "^3[47]"
		}]
	};

	// Extend file defs
	if ( window.extendFiles ) {
		window.extendFiles();
	}

})( this );

/*
	this file
		* determines whether a browser is qualified for enhancements at all, and if so,
		* define available CSS and JS assets that may be loaded
		* test features and device conditions and environment to determine which files to load
		* load files as needed
*/
(function( window, undefined ){
	"use strict";

	var navigator = window.navigator;
	var document = window.document;

	var ua = navigator.userAgent,
		// this references a meta tag's name whose content attribute should define the path to the full CSS file for the site
		fullCSSKey = "fullCSS",
		tmpl = "",
		docClasses = [ "enhanced" ];

	// loadCSS: load a CSS file asynchronously. [c]2014 @scottjehl, Filament Group, Inc. Licensed MIT
	function loadCSS( href, before, media ){
		// Arguments explained:
		// `href` is the URL for your CSS file.
		// `before` optionally defines the element we'll use as a reference for injecting our <link>
		// By default, `before` uses the first <script> element in the page.
		// However, since the order in which stylesheets are referenced matters, you might need a more specific location in your document.
		// If so, pass a different reference element to the `before` argument and it'll insert before that instead
		// note: `insertBefore` is used instead of `appendChild`, for safety re: http://www.paulirish.com/2011/surefire-dom-element-insertion/
		var ss = document.createElement( "link" );
		var ref = before || document.getElementsByTagName( "script" )[ 0 ];
		ss.rel = "stylesheet";
		ss.href = href;
		// temporarily, set media to something non-matching to ensure it'll fetch without blocking render
		ss.media = "only x";
		// inject link
		ref.parentNode.insertBefore( ss, ref );
		// set media back to `all` so that the styleshet applies once it loads
		window.setTimeout( function(){
			ss.media = media || "all";
		} );
	}

	/*! loadJS: load a JS file asynchronously. [c]2014 @scottjehl, Filament Group, Inc. (Based on http://goo.gl/REQGQ by Paul Irish). Licensed MIT */
	function loadJS( src ){
		var ref = document.getElementsByTagName( "script" )[ 0 ];
		var script = document.createElement( "script" );
		script.src = src;
		ref.parentNode.insertBefore( script, ref );
		return script;
	}

	// getMeta function: get a meta tag by name
	// NOTE: meta tag must be in the HTML source before this script is included in order to guarantee it'll be found
	function getMeta( metaname ){
		var metas = document.getElementsByTagName( "meta" );
		var meta;
		for( var i = 0; i < metas.length; i ++ ){
			if( metas[ i ].name && metas[ i ].name === metaname ){
				meta = metas[ i ];
				break;
			}
		}
		return meta;
	}

	// cookie function from https://github.com/filamentgroup/cookie/
	function cookie( name, value, days ){
		// if value is undefined, get the cookie value
		var expires = "";
		if( value === undefined ){
			var cookiestring = "; " + document.cookie;
			var cookies = cookiestring.split( "; " + name + "=" );
			if ( cookies.length === 2 ){
				return cookies.pop().split( ";" ).shift();
			}
			return null;
		}
		else {
			// if value is a false boolean, we'll treat that as a delete
			if( value === false ){
				days = -1;
			}
			if ( days ) {
				var date = new Date();
				date.setTime( date.getTime() + ( days * 24 * 60 * 60 * 1000 ) );
				expires = "; expires="+date.toGMTString();
			}
			else {
				expires = "";
			}
			document.cookie = name + "=" + value + expires + "; path=/";
		}
	}



	// expose some functions
	window.TEST.helpers = {
		loadCSS: loadCSS,
		loadJS: loadJS,
		cookie: cookie,
		getMeta: getMeta
	};

	// modified grunticon loader -
	// use yepnope's loader to fetch our backgrounds and icons css
	function grunticon( css ){

		var load = function( data ){
				loadCSS( css[ data && window.TEST.supports.svg ? 0 : data ? 1 : 2 ] );
			},

			// Thanks Modernizr
			img = new window.Image();

		img.onerror = function(){
			load( false );
		};

		img.onload = function(){
			load( img.width === 1 && img.height === 1 );
		};

		img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
	}

	// load 'em
	grunticon([ window.TEST.files.css.bgSVG, window.TEST.files.css.bgPNG, window.TEST.files.css.bgFallback ]);

	if( window.TEST.files.css.all && cookie( fullCSSKey ) === null && window.location.search.indexOf( "cached" ) === -1 ){
		loadCSS( window.TEST.files.css.all );
		// set cookie to mark this file fetched
		cookie( fullCSSKey, "true", 5 );
	}

	// ============== CTM ==========================
	// Add your qualifications for major browser experience divisions here.
	// For example, you might choose to only enhance browsers that support document.querySelector (IE8+, etc).
	// Use case will vary, but basic browsers: last stop here!
	if( !( "querySelector" in window.document ) ||
		window.operamini !== undefined ||
		window.navigator.userAgent.indexOf( "Series40" ) !== -1 ){
		return;
	}

	var template = getMeta( "template" );

	// Get template, if defined
	if( template ){
		tmpl = template.content;
	}

	if( window.TEST.supports.svg ) {
		docClasses.push( "test-support-svg" );
	}

	if( window.TEST.supports.boxshadow ) {
		docClasses.push( "test-support-boxshadow" );
	}

	// Add scoping classes to HTML element
	window.document.documentElement.className += " " + docClasses.join(" ");

	// test for font-face version to load via Data URI'd CSS
	// Basically, load WOFF unless it's android's default browser, which needs TTF
	var fontFile = window.TEST.files.css.fontsWOFF;

	if( ua.indexOf( "Android 4." ) > -1 && ua.indexOf( "like Gecko" ) > -1 && ua.indexOf( "Chrome" ) === -1 ){
		fontFile = window.TEST.files.css.fontsTTF;
	}

	// load fonts
	if( fontFile ) {
		loadCSS( fontFile );
	}

	// load global js on any template
	loadJS( window.TEST.files.js.global );

	// load TEST id JS if conditions are met
	if( !!window.TEST.files.js.testid && ( tmpl === "shop" || tmpl === "home" || tmpl === "bag" || tmpl === "vip" || tmpl === "checkout-confirm" ) ){
		loadJS( window.TEST.files.js.testid );
	}

	// load analytics if conditions are met
	if( !!window.TEST.files.js.externalApis && window.TEST.extConfig.analyticsEnabled === true ){
		loadJS( window.TEST.files.js.externalApis );
	}

	// load i2a if needed
	if( !!window.TEST.files.js.i2a && tmpl === "checkout-confirm" && window.TEST.extConfig.i2aEnabled === true ){
		loadJS( window.TEST.files.js.i2a );
	}


}( this ));

(function( window ) {
	"use strict";

	var document = window.document;

	var callback = function(){
		if( !window.overthrow ){
			return;
		}

		var scrollers = document.querySelectorAll( ".overthrow-enabled .sidescroll-nextprev" );
		window.overthrow.sidescroller( scrollers, "refresh" );
	};

	if( document.addEventListener ){
		window.addEventListener( "load", callback, false );
	} else {
		window.attachEvent( "load", callback );
	}
})( this );
