const winston = require( 'winston' );
const _ = require( 'lodash' );

module.exports = function createLogger( options ) {
    winston.configure({
        transports: [
            new winston.transports.Console( _.merge({
                showLevel: false,
                level: 'error',
                handleExceptions: false,
            }, ( options || {}))),
        ],
    });
    winston.cli();
    winston.setLevels({ error: 0, warn: 1, success: 2, info: 3, debug: 4 });
    winston.addColors({ error: 'red', warn: 'yellow', success: 'green', info: 'white', debug: 'white' });
    return winston;
};
