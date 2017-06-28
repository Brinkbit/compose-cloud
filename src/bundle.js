const fs = require( 'fs-extra' );
const _ = require( 'lodash' );
const yaml = require( 'js-yaml' );
const winston = require( './logger' );

let logger;

function smartMerge( objValue, srcValue, key ) {
    const objSplit = _.map( objValue, val => val.split( key ));
    const srcSplit = _.map( srcValue, val => val.split( key ));
    logger.debug( 'split vals:', objSplit, srcSplit );
    const union = _.unionBy( srcSplit, objSplit, val => val[0]);
    logger.debug( 'union:', union );
    return _.map( union, val => val.join( key ));
}

function merge( ...docs ) {
    logger.debug( 'merging docs:', docs );
    const merged = _.mergeWith( ...docs, ( objValue, srcValue, key ) => {
        if ( _.indexOf([
            'environment',
            'labels',
            'args',
        ], key ) !== -1 ) {
            logger.debug( 'smart merging', key, objValue, srcValue );
            return smartMerge( objValue, srcValue, '=' );
        }
        if ( _.indexOf([
            'volumes',
            'devices',
        ], key ) !== -1 ) {
            logger.debug( 'smart merging', key );
            return smartMerge( objValue, srcValue, ':' );
        }
        if ( _.isArray( objValue )) {
            return _.union( srcValue, objValue );
        }
        return undefined;
    });
    logger.debug( 'merged:', merged );
    return merged;
}

function load( sourcefile ) {
    return fs.readFile( sourcefile, 'utf8' )
    .then( doc => yaml.safeLoad( doc ))
    .then(( doc ) => {
        logger.debug( 'loaded doc:', doc );
        return doc;
    })
    .then( doc =>
        Promise.all( _.map( _.toPairs( doc.services ), ( servicePair ) => {
            logger.debug( 'servicePair', servicePair );
            const service = servicePair[1];
            if ( _.has( service, 'extends.file' ) && _.has( service, 'extends.service' )) {
                logger.debug( 'extending', service.extends.file, service.extends.service );
                return load( `./${service.extends.file}` )
                .then(( extended ) => {
                    logger.debug( 'loaded extended:', extended.services[service.extends.service]);
                    return merge( extended.services[service.extends.service], service );
                })
                .then(( merged ) => {
                    delete merged.extends;
                    servicePair[1] = merged;
                    return servicePair;
                });
            }
            return Promise.resolve( servicePair );
        }))
        .then(( servicePairs ) => {
            doc.services = _.fromPairs( servicePairs );
            return doc;
        })
    );
}

module.exports = function bundle( sourcefiles, options ) {
    const destination = options.file || './docker-cloud.yml';
    if ( sourcefiles.length === 0 ) {
        sourcefiles[0] = './docker-compose.yml';
    }
    logger = winston( options.logger );
    logger.debug( 'loading source files:', sourcefiles );
    return Promise.all( _.map( sourcefiles, load ))
    .then(( docs ) => {
        const combined = merge( ...docs );
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
