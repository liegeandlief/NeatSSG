const purify = require('purify-css')

const purifyCSS = settings => {
  // Purify the passed in stylesheet against the passed in file paths. Overwrite the passed in stylesheet with the result and minify the result.
  purify(settings.contentToScan, [settings.css], {output: settings.css, minify: true})
}

module.exports = purifyCSS
