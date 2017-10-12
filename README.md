#Things to note

##Assets
Put any assets (e.g. images or fonts) into the `assets` directory. This is copied into the `site` directory when a development or production build is run.

Assets should be pre-optimised as they are not optimised in any way at build time.

##Reserved things
Don't create directories called `assets`, `bundles`, `styles` or `entry_point_styles` in the `pages` directory as these directories are already created during the build process.

Do not start CSS class names with `page_` as this is reserved for the class on each page's `body` tag.

Do not use the ID `appRoot` on any elements as this is used on the container into which the React application is mounted.

##Components

File paths in components should relative to the `site` directory and should be prefixed with `§pathToSiteFromDomain§/`. e.g. if there is an image in `assets/images` then this should referenced as `§pathToSiteFromDomain§/assets/images/image.jpg`. At build time `§pathToSiteFromDomain§` will be replaced with the `pathToSiteFromDomain` as set in `build-config.js`.

##CSS

Don't use `@import` statements in CSS files.

File paths in CSS should relative to the `site` directory and should be prefixed with `§pathToSiteFromDomain§/`. e.g. if there is an image in `assets/images` then this should referenced as `§pathToSiteFromDomain§/assets/images/image.jpg`. At build time `§pathToSiteFromDomain§` will be replaced with the `pathToSiteFromDomain` as set in `build-config.js`.

When specifying the stylesheets used by an entry point in `entry-point-styles.js` they should be specified in the following order:

1. Global stylesheets used by all pages.
2. Stylesheets corresponding to each module used by the page. All styles in these stylesheets should be prefixed by the parent class of the module.

Page specific override styles should be included in the page's config file. They will be included after the entry point styles. All styles in these stylesheets should be prefixed with the page's `body` class.
