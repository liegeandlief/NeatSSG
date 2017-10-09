import React from 'react'
import renderInBrowser from '../../helpers/renderInBrowser'
import allowHotModuleReloading from '../../helpers/allowHotModuleReloading'

// Entry point components must call this function for hot module reloading to work in development mode
allowHotModuleReloading(module)

class Main extends React.Component {
  render () {
    return (
      <h1>{this.props.h1Text}</h1>
    )
  }
}

// Entry point components must call this function
renderInBrowser(Main)

// Must export the component as default
export default Main
