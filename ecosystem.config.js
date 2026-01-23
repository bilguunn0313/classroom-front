module.exports = {
  apps: [{
    name: 'training-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/home/training/Desktop/root/training-web',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
