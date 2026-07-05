module.exports = {
  apps: [
    {
      name: 'pitch-avatar-converter',
      cwd: './converter-service',
      script: './start.sh',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development'
      }
    }
  ]
};
