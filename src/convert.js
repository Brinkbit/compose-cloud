const fs = require( 'fs-extra' );
const _ = require( 'lodash' );
const yaml = require( 'js-yaml' );
const winston = require( './logger' );

module.exports = function convert( sourcefile, options ) {
    const destination = options.file || './docker-cloud.yml';
    const src = sourcefile || './docker-compose.yml';
    const logger = winston( options.logger );
    logger.debug( 'loading source file:', src );
    return fs.readFile( src, 'utf8' )
    .then(( doc ) => {
        let loaded = yaml.safeLoad( doc );
        if ( loaded.version && loaded.services ) {
            loaded = loaded.services;
        }
        logger.debug( 'source:', loaded );
        const converted = _.mapValues( loaded, ( service, key ) => {
            if ( !service.image ) {
                throw ( new Error( `Missing required property image in service ${key}` ));
            }
            logger.debug( key, ':', service );
            return _.omit(
                service,
                options.reverse ?
                [
                    'autodestroy',
                    'autoredeploy',
                    'deployment_strategy',
                    'roles',
                    'sequential_deployment',
                    'tags',
                    'target_num_containers',
                ] :
                [ 'build', 'external_links', 'env_file' ]
            );
        });
        logger.debug( 'converted:', converted );
        logger.debug( 'writing to', destination );
        return fs.outputFile( destination, yaml.safeDump( converted ), 'utf8' );
    })
    .then(() => {
        logger.success( `"${sourcefile}" >> "${destination}"` );
    })
    .catch(( error ) => {
        logger.error( error );
        process.exit( 1 );
    });
};
