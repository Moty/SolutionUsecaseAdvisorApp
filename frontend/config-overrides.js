module.exports = function override(config, env) {
  // Add your customizations here
  config.devServer = {
    ...config.devServer,
    allowedHosts: ['localhost', '.localhost'],
    host: 'localhost',
  };
  
  return config;
}
