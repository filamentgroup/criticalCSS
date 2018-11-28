var criticalcss = require("../critical.js");
criticalcss.getRules("test/files/all.css")
  .then(function(rules) {
    console.log("getRules promise output:", rules);
    return criticalcss.findCritical("http://" + process.env.CRITICAL_CSS_DOMAIN +  "/test-site-print.html", {
      rules: JSON.parse(rules)
    });
  })
  .then((critCSS) => console.log("findCritical promise output:", critCSS))
  .then(() => process.exit());

