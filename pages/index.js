// Must use module.exports as it is not possible to export a naked promise from an ES6 module (i.e. it must be assigned to a variable). We need naked promises as in Webpack config we build an array of promises which is passed to Promises.all.

module.exports = new Promise(resolve => {
  resolve({
    head: {
      title: 'This is kind of neat',
      description: 'What he said',
      robots: 'noindex, nofollow'
    },
    componentToRender: {
      pathFromRoot: './components/entry_points/Main.js', // Include ./ and file extension
      initialProps: {
        h1Text: 'I get passed into the component when it is initially rendered on the server and in the browser'
      }
    },
    // Paths should be relative to the project root
    styles: [
      './styles/Main.css'
    ],
    // Either true, false or an object containing at least one of the keys: changefreq, priority (see https://www.sitemaps.org/protocol.html)
    sitemap: {
      changefreq: 'daily',
      priority: 0.8
    },
    // Array of other pages to prefetch. Paths should relative to the site folder and should not start with a forward slash e.g. index.html, about/careers.html.
    prefetch: [
      'about/careers.html'
    ]
  })
})
