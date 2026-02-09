module.exports = {
  apps: [
    {
      name: 'demand-planning-backend',
      script: 'server.js',  // Relative to cwd
      cwd: './backend',     // ⭐ Set working directory to backend folder
      exec_mode: 'fork',    // Use fork mode (not cluster) for better env loading
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5002,
      },
      env_file: '.env',     // ⭐ Now relative to ./backend/
      error_file: '../logs/backend-error.log',  // Relative to backend/
      out_file: '../logs/backend-out.log',
      log_file: '../logs/backend-combined.log',
      time: true,
    },
    {
      name: 'demand-planning-frontend',
      script: 'npm',
      args: 'start',
      cwd: './frontend',    // ⭐ Working directory is frontend folder
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_file: '.env.local',  // ⭐ Now relative to ./frontend/
      error_file: '../logs/frontend-error.log',  // Relative to frontend/
      out_file: '../logs/frontend-out.log',
      log_file: '../logs/frontend-combined.log',
      time: true,
    },
  ],
};
