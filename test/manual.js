var criticalcss = require("../critical.js");

criticalcss.getRules("test/files/all.css", function(err, output) {
  if (err) {
    throw new Error(err);
  } else {
    criticalcss.findCritical("http://107.170.208.194:8080/test/files/test-site.html", { rules: JSON.parse(output) }, function(err, output) {
      if (err) {
        throw new Error(err);
      } else {
        console.log(output);
      }
    });
  }
});
