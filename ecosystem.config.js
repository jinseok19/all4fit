module.exports = {
  apps: [
    {
      name: 'all4fit-web',
      script: 'serve',
      args: '-s /var/www/all4fit -l 3000',
      cwd: '/var/www/all4fit',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      // 자동 재시작 설정
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      
      // 로그 설정
      log_file: '/var/log/all4fit/combined.log',
      out_file: '/var/log/all4fit/out.log',
      error_file: '/var/log/all4fit/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // 모니터링 설정
      min_uptime: '10s',
      max_restarts: 10,
      
      // 무중단 배포 설정
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000
    },
    {
      name: 'all4fit-dev',
      script: 'serve',
      args: '-s /var/www/all4fit-dev -l 3001',
      cwd: '/var/www/all4fit-dev',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      // 자동 재시작 설정
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      
      // 로그 설정
      log_file: '/var/log/all4fit-dev/combined.log',
      out_file: '/var/log/all4fit-dev/out.log',
      error_file: '/var/log/all4fit-dev/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // 모니터링 설정
      min_uptime: '10s',
      max_restarts: 10
    }
  ],

  // 배포 설정
  deploy: {
    production: {
      user: 'ubuntu',
      host: '3.38.85.149',
      ref: 'origin/main',
      repo: 'https://github.com/your-username/all4fit.git',
      path: '/var/www/all4fit',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    },
    development: {
      user: 'ubuntu',
      host: '3.38.85.149',
      ref: 'origin/develop',
      repo: 'https://github.com/your-username/all4fit.git',
      path: '/var/www/all4fit-dev',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env development',
      'pre-setup': ''
    }
  }
};
