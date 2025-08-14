// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'ipos-fe',

      // 👇 change this to your real project path
      cwd: 'C:\\Users\\IPOS\\Documents\\IPOSFE',

      // Run your package.json "start" script
      script: 'npm',
      args: 'run start',

      // Process settings
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      restart_delay: 5000,

      // Environment (your start script already hardcodes -H and -p)
      env: {
        NODE_ENV: 'production'
      },

      // Logs (optional)
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
}
