const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const CleanCSS = require('clean-css')
const postcss = require('postcss')
const cssnext = require('postcss-cssnext')
const config = require('../config')

const generateCSSFile = (styles, pagePath, pageHTMLPath, pathToSiteFromDomain) => {
  // Generate a CSS file for this page if the page's JS file specifies at least one stylesheet.
  let stylesheetPathFromPage = ''
  let stylesheetPath = ''
  if (styles.length) {
    // Concatenate the contents of all the CSS files needed by the page.
    const css = styles.reduce((css, path) => {
      return css + fs.readFileSync(path, 'utf8')
    }, '')

    // Build this page's stylesheet file path.
    stylesheetPath = pagePath.replace(new RegExp('.js$'), '.css').replace(new RegExp('^./pages/'), './site/styles/')

    // Determine the relative path from the page's HTML file to its CSS file.
    stylesheetPathFromPage = path.relative(path.dirname(pageHTMLPath), stylesheetPath)

    // Post-process the CSS
    postcss([
      cssnext({
        browsers: config.supportedBrowsers
      })
    ]).process(css).then(result => {
      let css = new CleanCSS({
        rebase: false
      }).minify(result.css).styles

      // Make file paths in the CSS relative to the domain.
      const pathToSiteFromDomainToUse = typeof pathToSiteFromDomain !== 'undefined' ? pathToSiteFromDomain : config.pathToSiteFromDomain.development
      css = css.replace(new RegExp('§pathToSiteFromDomain§', 'g'), pathToSiteFromDomainToUse)

      // Write the stylesheet to disk.
      const stylesheetDir = path.dirname(stylesheetPath)
      if (!fs.existsSync(stylesheetDir)) mkdirp.sync(stylesheetDir)
      fs.writeFileSync(stylesheetPath, css)
    })
  }

  return {
    stylesheetPath,
    stylesheetPathFromPage
  }
}

module.exports = generateCSSFile
