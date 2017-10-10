const generateCSSFile = require('./generateCSSFile')

const pagePath = process.argv[2]

require('../' + pagePath).then(pageData => {
  // Build this page's HTML file path relative to the project root.
  const pageHTMLPath = pagePath.replace(new RegExp('.js$'), '.html').replace(new RegExp('^./pages/'), './site/')

  // Generate this page's CSS
  generateCSSFile(pageData.styles, pagePath, pageHTMLPath)
})
