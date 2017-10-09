const config = {

  // Array of browserlist queries
  supportedBrowsers: ['> 1% in GB'],

  // A number between 0 and 1 indicating the percentage of entry point chunks a module should be in before it is moved in to the commons chunk
  commonsChunkPercentage: 0.1,

  // Path to site including protocol and domain. e.g. https://www.domain.com or https://subdomain.domain.com/subfolder - no trailing slash.
  pathToSite: 'http://www.site.com',

  // Path to site from domain. If the site is not in a subfolder this should just be blank. If the site is in a subfolder then this should be /subfolderName or /subfolder1Name/subfolder2Name - with preceeding slash but no trailing slash
  pathToSiteFromDomain: {
    development: '',
    production: ''
  }

}

module.exports = config
