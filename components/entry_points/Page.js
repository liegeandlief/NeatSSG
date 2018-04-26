import React from 'react'
import renderInBrowser from '../../helpers/renderInBrowser'
import allowHotModuleReloading from '../../helpers/allowHotModuleReloading'
import Menu from '../Menu'

// Entry point components must call this function for hot module reloading to work in development mode
allowHotModuleReloading(module)

class Page extends React.Component {
  render () {
    return (
      <div>
        <Menu />
        <h1>{this.props.heading}</h1>
      </div>
    )
  }
}

// Entry point components must call this function
renderInBrowser(Page)

// Must export the component as default
export default Page
