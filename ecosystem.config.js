module.exports = {
  apps: [
    {
      name: 'ipos-fe',
      cwd: 'C:/Users/IPOS/Documents/IPOSFE',

      // Run npm via Windows shell to avoid npm.cmd parsing issues
      script: 'cmd',
      args: '/c npm run start',

      interpreter: 'none',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      env: { NODE_ENV: 'production' }
    }
  ]
}
