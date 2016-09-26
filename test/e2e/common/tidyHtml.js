
module.exports = function tidyHTML(html) {

    var tidy = require("tidy-html5").tidy_html5

    var options = {
        "indent": "auto",
        "indent-spaces": 2,
        "wrap": 72,
        "markup": "yes",
        "output-xml": "no",
        "input-xml": "no",
        "show-warnings": "yes",
        "numeric-entities": "yes",
        "quote-marks": "yes",
        "quote-nbsp": "yes",
        "quote-ampersand": "no",
        "break-before-br": "no",
        "uppercase-tags": "no",
        "uppercase-attributes": "no",
        "show-body-only": "yes",
        "show-warnings": "no",
        "show-info": "no",
        "show-errors": 0,
        "hide-comments": "yes",
        "force-output": "yes",
        "quiet": "yes",
        "tidy-mark": "no"
    };

    var result = tidy(html, options);

    return result;
};