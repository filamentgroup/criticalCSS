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

Using both together:

```JavaScript
var request = require('request');
var path = require( 'path' );
var criticalcss = require("criticalcss");
var fs = require('fs');
var tmpDir = require('os').tmpdir();

var cssUrl = 'http://site.com/style.css';
var cssPath = path.join( tmpDir, 'style.css' );
request(cssUrl).pipe(fs.createWriteStream(cssPath)).on('close', function() {
  criticalcss.getRules(cssPath, function(err, output) {
    if (err) {
      throw new Error(err);
    } else {
      criticalcss.findCritical("https://site.com/", { rules: JSON.parse(output) }, function(err, output) {
        if (err) {
          throw new Error(err);
        } else {
          console.log(output);
        }
      });
    }
  });
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

## CLI?

Sure, we got that.

```

Commands:
  run  Run criticalcss

Options:
  --help                   Show help                                   [boolean]
  -u, --url                The url you would like to run criticalcss against
                                                             [string] [required]
  -f, --file               The local css file you're referencing for criticalcss
                                                             [string] [required]
  -w, --width              The width of your viewport            [default: 1200]
  -h, --height             The height of your viewport            [default: 900]
  -o, --output             The name of your output css file
                                             [string] [default: "dist/dist.css"]
  -b, --buffer             Specifies the largest amount of data allowed on
                           stdout or stderr - if this value is exceeded then the
                           child process is killed             [default: 819200]
  --force, --forceInclude  Sometimes selectors need to be forced into the
                           criticalcss                     [array] [default: []]
  -i, --ignoreConsole      Criticalcss will pick up console errors, set this to
                           ignore them                [boolean] [default: false]

```
## Examples
Check out the tests!

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
* v2.0.0 - Append the declarations from the original input CSS to selectors chosen by criticalCSS (includes vendor prefixes and other bits that the CSS object model misses). 
* v1.0.0 - Upgrade the underlying tool to Phantom 2.1
* v0.6.0 - Add a CLI version
* v0.5.0 - Add `ignoreConsole` option
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
