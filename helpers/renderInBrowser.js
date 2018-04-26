import React from 'react'
import ReactDOM from 'react-dom'

const renderInBrowser = component => {
  // If being called from the browser then render the passed-in component into the #appRoot element passing it props from window.NeatSSGInitialProps
  if (typeof document !== 'undefined' && typeof window !== 'undefined') {
    ReactDOM.render(React.createElement(component, window.NeatSSGInitialProps), document.querySelector('#appRoot'))
  }
}

export default renderInBrowser
