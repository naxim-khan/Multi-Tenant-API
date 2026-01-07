import build from 'pino-abstract-transport';
import pinoRoll from 'pino-roll';
import { join } from 'path';

interface LogEntry {
    level: number;
    time: number;
    pid: number;
    hostname: string;
    context?: string;
    msg?: string;
    req?: {
        method: string;
        url: string;
    };
    res?: {
        statusCode: number;
    };
    responseTime?: number;
}

export = async function (opts: any) {
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

    return build(async function (source: any) {
        for await (let log of source) {
            try {
                const data: LogEntry = typeof log === 'string' ? JSON.parse(log) : log;
                const context = data.context || '';
                const level = data.level;
                const logStr = typeof log === 'string' ? log : JSON.stringify(log);

                // Route to combined-errors if level is WARN (40) or ERROR (50)
                if (level >= 40) {
                    errorRoll.write(logStr + '\n');
                }

                // Route to users.log if context mentions Users or the URL starts with /api/users
                if (context.includes('Users') || data.req?.url?.includes('/api/users')) {
                    usersRoll.write(logStr + '\n');
                }

                // Route to auth.log if context mentions Auth or the URL starts with /api/auth
                if (context.includes('Auth') || data.req?.url?.includes('/api/auth')) {
                    authRoll.write(logStr + '\n');
                }
            } catch (err) {
                console.error('Failed to parse log entry in splitter:', err);
            }
        }
    });
}
