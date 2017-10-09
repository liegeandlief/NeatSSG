const allowHotModuleReloading = module => {
  // Opt-in to Webpack hot module replacement
  if (module.hot) module.hot.accept()
}

export default allowHotModuleReloading
