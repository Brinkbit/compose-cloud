const fs = require( 'fs-extra' );
const _ = require( 'lodash' );
const yaml = require( 'js-yaml' );
const winston = require( './logger' );

module.exports = function bundle( sourcefiles, options ) {
    const destination = options.file || './docker-cloud.yml';
    if ( sourcefiles.length === 0 ) {
        sourcefiles[0] = './docker-compose.yml';
    }
    const logger = winston( options.logger );
    logger.debug( 'loading source files:', sourcefiles );
    return Promise.all(
        sourcefiles.map(
            source => fs.readFile( source, 'utf8' )
            .then( doc => yaml.safeLoad( doc ))
        )
    )
    .then(( docs ) => {
        const combined = _.mergeWith( ...docs, ( objValue, srcValue ) => {
            if ( _.isArray( objValue )) {
                return _.union( srcValue, objValue );
            }
            return undefined;
        });
        logger.debug( combined );
        logger.debug( 'writing to', destination );
        return fs.outputFile( destination, yaml.safeDump( combined ), 'utf8' );
    })
    .then(() => {
        logger.success( `"${sourcefiles.join( '"+"' )}" >> "${destination}"` );
    })
    .catch(( error ) => {
        logger.error( error );
        process.exit( 1 );
    });
};
