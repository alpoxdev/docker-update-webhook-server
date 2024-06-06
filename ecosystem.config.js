module.exports = {
  apps: [
    {
      name: 'webhook-server',
      script: './dist/server.js',
      watch: '.',
    },
  ],
};
