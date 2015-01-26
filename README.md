# CriticalCSS

[![Filament Group](http://filamentgroup.com/images/fg-logo-positive-sm-crop.png) ](http://www.filamentgroup.com/)

Finds the Above the Fold CSS for your page, and outputs it into a file

## Getting Started
Install the module with: `npm install criticalcss`

```javascript
var criticalcss = require("criticalcss");

criticalcss.findCritical("path/to/file/or/url", options (only rules required), function(err, output){
	if( err ){
		throw new Error( err );
	} else {
		fs.writeFileSync( filename, output );
  }
});

criticalcss.getRules("path/to/css/file/", function(err, output){
	if( err ){
		throw new Error( err );
	} else {
		fs.writeFileSync( filename, output );
  }
});


```

## Documentation
`.findCritical`

Takes url or path to file, an options hash, and a callback function

### Default values for options hash

* `width`:  1200;
* `height`: 900;
* `forceInclude`: [];
* `rules`: []; // REQUIRED
* `buffer`: 800*1024;
* `ignoreConsole`: false;

#### options.width
Type: `Integer`
Default value: `1200`

The width of the window being used for determining "above the fold"

#### options.height
Type: `Integer`
Default value: `900`

The height of the window being used for determining "above the fold"

#### options.forceInclude
Type: `Array`
Default value: `[]`

An array of selectors that should be included in the critical css no
matter what. This is sometimes necessary with js-enhanced components.

#### options.rules
Type: `Array`
Default value: `[]`

A `JSON.stringify`d version of a
[CSSRuleList](https://developer.mozilla.org/en-US/docs/Web/API/CSSRuleList)

#### options.buffer
Type: `Integer`
Default value: `800*1024`

Sets the `maxBuffer` for [child_process.execFile](http://nodejs.org/api/child_process.html#child_process_child_process_execfile_file_args_options_callback) in Node.
Necessary for potential memory issues.

#### options.ignoreConsole
Type: `Boolean`
Default value: `false`

Since criticalCSS handles output from STDOUT, it will also catch any
outputs to `console` that are in the JavaScript on a page. If set to
`true`, those will be silenced.

`.getRules`

Takes a path to the CSS file and a callback function and returns a `JSON.stringify`'d subset of a `CSSRuleList`

### Default values for options hash

* `buffer`: 800*1024;

## Examples
Check out the tests!

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
* v0.4.0 - Moved to using a local filename for `getRules` and moved to passing in a required `Array` of rules into the options hash on `findCritical`
* v0.3.0 - Added `forceInclude` functionality. This allows the user to
  pass in an array of strings that are selectors. These selectors, if
found in the CSS, will be treated as though they are above the fold and
will therefore be automatically included.
* v0.2.0 - Refactor
* v0.1.0 - Hey, released this thing

## License
Copyright (c) 2014 Scott Jehl/Jeffrey Lembeck/Filament Group
Licensed under the MIT license.
