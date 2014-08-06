# CriticalCSS

[![Filament Group](http://filamentgroup.com/images/fg-logo-positive-sm-crop.png) ](http://www.filamentgroup.com/)

Finds the Above the Fold CSS for your page, and outputs it into a file

## Getting Started
Install the module with: `npm install criticalcss`

```javascript
var criticalcss = require("criticalcss");

criticalcss.findCritical("path/to/file/or/url", options (not required), function(err, output){
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
* `filename`: "all.css";

## Examples
Check out the tests!

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
* v0.1.0 - Hey, released this thing

## License
Copyright (c) 2014 Scott Jehl/Jeffrey Lembeck/Filament Group
Licensed under the MIT license.
