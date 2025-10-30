import pino from 'pino';

const logger = pino({
    level: 'info',
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,              // bunte Logs

            ignore: 'pid,hostname'    // pid und hostname ausblenden
        }
    }
});
export default logger;