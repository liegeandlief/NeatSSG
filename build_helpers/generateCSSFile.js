const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const CleanCSS = require('clean-css')
const postcss = require('postcss')
const cssnext = require('postcss-cssnext')
const buildConfig = require('../build-config')

const generateCSSFile = (forceRecreate, styles, ownerPath, pageHTMLPath, pathToSiteFromDomain) => {
  let stylesheetPathFromPage = ''

  // Generate a CSS file if the styles variable specifies at least one stylesheet.
  if (styles.length) {
    // Concatenate the contents of all the CSS files specified in the styles variable.
    const css = styles.reduce((css, path) => {
      return css + fs.readFileSync(path, 'utf8')
    }, '')

    // Build this stylesheet's file path relative to the project root.
    const stylesheetPath = ownerPath.replace(new RegExp('.js$'), '.css').replace(new RegExp('^./pages/'), './site/styles/').replace(new RegExp('^./components/entry_points/'), './site/entry_point_styles/')

    // Determine the relative path from the page's HTML file to the stylesheet file.
    stylesheetPathFromPage = path.relative(path.dirname(pageHTMLPath), stylesheetPath)

    const stylesheetDir = path.dirname(stylesheetPath)

    // Post-process the CSS and write the stylesheet to disk if forceRecreate is true or the stylesheet doesn't exist yet
    if (forceRecreate || !fs.existsSync(stylesheetDir) || !fs.existsSync(stylesheetPath)) {
      postcss([
        cssnext({
          browsers: buildConfig.supportedBrowsers
        })
      ]).process(css).then(result => {
        let css = new CleanCSS({
          rebase: false
        }).minify(result.css).styles

        // Make file paths in the CSS relative to the domain.
        const pathToSiteFromDomainToUse = typeof pathToSiteFromDomain !== 'undefined' ? pathToSiteFromDomain : buildConfig.pathToSiteFromDomain.development
        css = css.replace(new RegExp('§pathToSiteFromDomain§', 'g'), pathToSiteFromDomainToUse)

        // Write the stylesheet to disk.
        if (!fs.existsSync(stylesheetDir)) mkdirp.sync(stylesheetDir)
        fs.writeFileSync(stylesheetPath, css)
      })
    }
  }

  return stylesheetPathFromPage
}

module.exports = generateCSSFile
