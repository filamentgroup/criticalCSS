var criticalcss = require("../critical.js");
criticalcss.getRules("test/files/all.css")
  .then(function(rules) {
    console.log("getRules promise output:", rules);
    return criticalcss.findCritical("http://107.170.208.194:8080/test-site-print.html", {
      rules: JSON.parse(rules)
    });
  })
  .then((critCSS) => console.log("findCritical promise output:", critCSS))
  .then(() => process.exit());

