import path from 'path'
import fs from 'fs'
import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import BabiliPlugin from 'babili-webpack-plugin'
import recursive from 'recursive-readdir'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import os from 'os'
import sm from 'sitemap'
import buildConfig from './build-config'
import generateCSSFile from './build_helpers/generateCSSFile'
import StringReplacePlugin from 'string-replace-webpack-plugin'
import HtmlStringReplace from 'html-string-replace-webpack-plugin'
import entryPointStyles from './entry-point-styles'

let pathToSiteFromDomain = buildConfig.pathToSiteFromDomain.development
let pathToSite = buildConfig.pathToSite.development
if (process.env.BUILD_TYPE === 'production') {
  pathToSiteFromDomain = buildConfig.pathToSiteFromDomain.production
  pathToSite = buildConfig.pathToSite.production
}
const supportedBrowsers = buildConfig.supportedBrowsers
const commonsChunkPercentage = buildConfig.commonsChunkPercentage

const webpackConfig = new Promise(resolve => {
  // Get all page JS files
  const isNotDirOrJSFile = (file, stats) => {
    return !stats.isDirectory() && path.extname(file) !== '.js'
  }
  recursive('./pages', [isNotDirOrJSFile], (err, files) => {
    if (err) throw err

    const pages = {
      paths: [],
      dataPromises: []
    }

    // Append ./ to the beginning of each page's file path
    pages.paths = files.map(path => {
      return './' + path
    })

    // Require each page's file path. Page JS files return promises. We put all of these promises into an array.
    pages.dataPromises = pages.paths.map(path => {
      return require(path)
    })

    // When all the above promises have resolved
    Promise.all(pages.dataPromises).then(pageDatas => {
      // Create an object of Webpack entry points. Each page JS file specifies its entry point in the pathFromRoot parameter.
      const entryPoints = pageDatas.reduce((entryPoints, pageData) => {
        const entryPoint = pageData.componentToRender.pathFromRoot
        entryPoints[entryPoint] = entryPoint
        return entryPoints
      }, {})

      // This Babel configuration is used by to transpile the entry point files and their dependencies when bundling
      const babelLoaderConfig = {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          babelrc: false,
          presets: [
            ['env', {
              // Setting modules to false stops Babel converting ES6 modules to CommonJS modules. Tree-shaking is only possible with ES6 modules and we want tree-shaking.
              modules: false,
              targets: {
                browsers: supportedBrowsers
              }
            }], 'react'
          ]
        },
        // Exclude node_modules from Babel transpilation as NPM modules should be published as ES5 so don't require transpiling.
        exclude: /node_modules/
      }

      // In JS files replace §pathToSiteFromDomain§ with the value of pathToSiteFromDomain.
      const stringReplaceInJSFilesLoader = {
        test: /\.js$/,
        loader: StringReplacePlugin.replace({
          replacements: [
            {
              pattern: /§pathToSiteFromDomain§/g,
              replacement: () => {
                return pathToSiteFromDomain
              }
            }
          ]
        })
      }

      // Set NODE_ENV to the value of BUILD_TYPE. NODE_ENV is used in a lot of packages to determine which code to include. We set it here so that unnecessary code does not get put into the bundles e.g. React will include lots of warnings and debugging code if NODE_ENV is not set to 'production'.
      const definePluginInstance = new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify(process.env.BUILD_TYPE)
        }
      })

      // Put code into a common bundle if it appears in a certain percentage of entry point bundles.
      const commonsChunkPluginInstance = new webpack.optimize.CommonsChunkPlugin({
        name: 'commons',
        filename: './bundles/commons.js',
        minChunks: (module, count) => {
          return (count / Object.keys(entryPoints).length) > commonsChunkPercentage
        }
      })

      // Setup plugin instances for generting an HTML file and a CSS file for each page.
      // Also generate sitemap URLs.
      const sitemapURLs = []
      const htmlWebpackPluginInstances = pageDatas.map((pageData, index) => {
        const {head: {title, description, robots}, componentToRender: {pathFromRoot, initialProps}, styles, sitemap, prefetch} = pageData

        const newInitialProps = typeof initialProps !== 'undefined' ? initialProps : {}

        // Require the page's entry component.
        const component = require(pathFromRoot)

        // Build this page's HTML file path relative to the project root.
        const pageHTMLPath = pages.paths[index].replace(new RegExp('.js$'), '.html').replace(new RegExp('^./pages/'), './site/')

        // Generate this entry point's CSS
        const entryPointStylesheetPathFromPage = generateCSSFile(false, entryPointStyles[pathFromRoot], pathFromRoot, pageHTMLPath, pathToSiteFromDomain)

        // Generate this page's CSS
        const pageStylesheetPathFromPage = generateCSSFile(false, styles, pages.paths[index], pageHTMLPath, pathToSiteFromDomain)

        // Build this page's HTML file path relative to the site folder.
        const htmlFilePath = pageHTMLPath.replace(new RegExp('^./site/'), './')

        // Create this page's body class based on its HTML file path.
        const bodyClass = 'page' + htmlFilePath.replace(new RegExp('.html$'), '').replace(new RegExp('[^A-Za-z_0-9-]+', 'g'), '_')

        // Maybe add this page to the sitemap.
        const pageURLPath = htmlFilePath.replace(new RegExp('^./'), '/')
        if (typeof sitemap !== 'undefined' && sitemap !== false) {
          const sitemapURL = { url: pageURLPath }
          if (typeof sitemap === 'object') {
            if (sitemap.hasOwnProperty('changefreq')) sitemapURL.changefreq = sitemap.changefreq
            if (sitemap.hasOwnProperty('priority')) sitemapURL.priority = sitemap.priority
          }
          sitemapURLs.push(sitemapURL)
        }

        // Build prefetch link tags for this page
        let prefetchLinks = ''
        if (typeof 'prefetch' !== 'undefined' && Array.isArray(prefetch)) {
          prefetchLinks = prefetch.reduce((links, page) => {
            return links + '<link rel="prefetch" href="' + pathToSiteFromDomain + '/' + page + '" />'
          }, '')
        }

        // Setup the plugin to generate the page's HTML file.
        return new HtmlWebpackPlugin({
          template: './template.ejs',
          chunks: ['commons', pathFromRoot], // JS chunks to include in this page
          inject: 'body',
          filename: htmlFilePath,
          htmlTitle: typeof title !== 'undefined' ? title : '',
          description: typeof description !== 'undefined' ? description : '',
          robots: typeof robots !== 'undefined' ? robots : 'index, follow',
          language: buildConfig.language,
          prefetch: prefetchLinks,
          canonical: pathToSite + pageURLPath,
          initialProps: JSON.stringify(newInitialProps),
          entryPointStylesheetPath: entryPointStylesheetPathFromPage,
          pageStylesheetPath: pageStylesheetPathFromPage,
          bodyClass: bodyClass,
          content: ReactDOMServer.renderToStaticMarkup(React.createElement(component.default, newInitialProps))
        })
      })

      // Add the sitemap's location to robots.txt
      fs.appendFile('./site/robots.txt', os.EOL + 'Sitemap: ' + pathToSite + '/sitemap.xml')

      // Write sitemap to disk
      fs.writeFile('./site/sitemap.xml',
        sm.createSitemap({
          hostname: pathToSite,
          urls: sitemapURLs
        }).toString()
      )

      // Plugin instance for minification of bundles.
      const babiliPluginInstance = new BabiliPlugin()

      // Plugin for string replacements
      const stringReplacePluginInstance = new StringReplacePlugin()

      // Plugin for replacing strings in generated HTML files
      const htmlStringReplacePluginInstance = new HtmlStringReplace({
        enable: true,
        // In generated HTML files replace §pathToSiteFromDomain§ with the value of pathToSiteFromDomain.
        patterns: [
          {
            match: /§pathToSiteFromDomain§/g,
            replacement: match => {
              return pathToSiteFromDomain
            }
          }
        ]
      })

      // Build array of plugins dependent upon the environment.
      let plugins = []
      if (process.env.BUILD_TYPE === 'production') {
        plugins = plugins.concat(definePluginInstance).concat(commonsChunkPluginInstance).concat(htmlWebpackPluginInstances).concat(babiliPluginInstance).concat(stringReplacePluginInstance).concat(htmlStringReplacePluginInstance)
      } else {
        plugins = plugins.concat(definePluginInstance).concat(commonsChunkPluginInstance).concat(htmlWebpackPluginInstances).concat(stringReplacePluginInstance).concat(htmlStringReplacePluginInstance)
      }

      // Resolve the promise with the Webpack config.
      resolve({
        entry: entryPoints,
        // Where to output bundles and how to name them.
        output: {
          path: path.resolve(__dirname, 'site'),
          filename: './bundles/[name]'
        },
        module: {
          rules: [babelLoaderConfig, stringReplaceInJSFilesLoader]
        },
        plugins: plugins
      })
    })
  })
})

export default webpackConfig
