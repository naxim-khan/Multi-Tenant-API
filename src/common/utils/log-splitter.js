const pinoRoll = require('pino-roll');
const { join } = require('path');

module.exports = async (opts) => {
    const usersRoll = await pinoRoll({
        file: join(process.cwd(), 'logs', 'users.log'),
        frequency: 'daily',
        size: '10M',
        mkdir: true,
    });

    const authRoll = await pinoRoll({
        file: join(process.cwd(), 'logs', 'auth.log'),
        frequency: 'daily',
        size: '10M',
        mkdir: true,
    });

    const errorRoll = await pinoRoll({
        file: join(process.cwd(), 'logs', 'combined-errors.log'),
        frequency: 'daily',
        size: '10M',
        mkdir: true,
    });

    return (log) => {
        const data = JSON.parse(log);
        const context = data.context || '';
        const level = data.level;

        // Route to combined-errors if level is WARN (40) or ERROR (50)
        if (level >= 40) {
            errorRoll.write(log + '\n');
        }

        // Route to users.log if context mentions Users
        if (context.includes('Users') || data.req?.url?.includes('/api/users')) {
            usersRoll.write(log + '\n');
        }

        // Route to auth.log if context mentions Auth
        if (context.includes('Auth') || data.req?.url?.includes('/api/auth')) {
            authRoll.write(log + '\n');
        }
    };
};
