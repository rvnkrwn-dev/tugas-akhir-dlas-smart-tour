module.exports = {
    apps: [
        {
            name: 'dlas-smart-tour',
            script: './.output/server/index.mjs',
            cwd: '/var/www/dlas',
            instances: 2,
            exec_mode: 'cluster',
            env: {
                NODE_ENV: 'production',
                PORT: 3000,
                HOST: '0.0.0.0'
            },
            error_file: '/var/www/dlas/logs/pm2-error.log',
            out_file: '/var/www/dlas/logs/pm2-out.log',
            log_file: '/var/www/dlas/logs/pm2-combined.log',
            time: true,
            autorestart: true,
            max_restarts: 10,
            min_uptime: '10s',
            max_memory_restart: '1G',
            watch: false,
            merge_logs: true,
            env_file: '/var/www/dlas/.env'
        }
    ]
};
