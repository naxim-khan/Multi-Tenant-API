import { Params } from 'nestjs-pino';
import { join } from 'path';

export const loggerConfig: Params = {
    pinoHttp: {
        transport: {
            targets: [
                {
                    target: 'pino-pretty',
                    level: 'info',
                    options: {
                        colorize: true,
                        levelFirst: true,
                        translateTime: 'HH:MM:ss',
                        ignore: 'pid,hostname',
                        singleLine: true,
                        messageFormat: '{req.method} {req.url} {res.statusCode} - {responseTime}ms',
                    },
                },
                {
                    target: join(process.cwd(), 'dist', 'src', 'common', 'utils', 'log-splitter.js'),
                    level: 'info',
                    options: {},
                },
            ],
        },
        customProps: () => ({
            context: 'HTTP',
        }),
        serializers: {
            req: (req) => ({
                method: req.method,
                url: req.url,
            }),
            res: (res) => ({
                statusCode: res.statusCode,
            }),
        },
        autoLogging: {
            ignore: (req) => req.url === '/health' || req.url === '/api/health',
        },
        customLogLevel: (req, res, err) => {
            if (res.statusCode >= 400 && res.statusCode < 500) {
                return 'warn';
            } else if (res.statusCode >= 500 || err) {
                return 'error';
            }
            return 'info';
        },
    },
};
