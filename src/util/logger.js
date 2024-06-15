import { colorConsole } from 'tracer';

const loglevel = process.env.LOGLEVEL || 'trace';

const logger = colorConsole({
    format: ['{{timestamp}} <{{title}}> {{file}}:{{line}} : {{message}}'],
    preprocess: function (data) {
        data.title = data.title.toUpperCase();
    },
    dateformat: 'isoUtcDateTime',
    level: loglevel
});

export default logger;