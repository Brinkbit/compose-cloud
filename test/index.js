const chai = require( 'chai' );
const chaiAsPromised = require( 'chai-as-promised' );
const fs = require( 'fs-extra' );
const buffertools = require( 'buffertools' );

const core = require( '../src' );

chai.use( chaiAsPromised );
chai.config.includeStack = true;

const expect = chai.expect;

function filesMatch( path1, path2 ) {
    return Promise.all([ path1, path2 ].map( path => fs.readFile( path, null )))
    .then( results => Promise.resolve( !buffertools.compare( results[0], results[1])));
}

describe( 'compose-cloud', function() {
    describe( 'bundle', function() {
        const dest = './test/dest/docker-compose.yml';

        afterEach( function() {
            return fs.remove( './test/dest' );
        });

        it( 'should combine two docker-compose files', function() {
            return core.bundle(
                [ './test/source/docker-compose.yml', './test/source/docker-compose.override.yml' ],
                { file: dest }
            ).then(() =>
                expect( filesMatch( dest, './test/match/docker-compose.yml' ))
                    .to.eventually.be.true
            );
        });

        it( 'should properly handle extended services', function() {
            return core.bundle(
                ['./test/source/docker-compose.extends-twice.yml'],
                { file: dest }
            ).then(() =>
                expect( filesMatch( dest, './test/match/docker-compose.extends-twice.yml' ))
                    .to.eventually.be.true
            );
        });
    });

    describe( 'convert', function() {
        const dest = './test/dest/docker-cloud.yml';

        afterEach( function() {
            return fs.remove( './test/dest' );
        });

        it( 'should convert a docker-compose file to a docker-cloud file', function() {
            return core.convert( './test/source/docker-compose.yml', { file: dest })
            .then(() =>
                expect( filesMatch( dest, './test/match/docker-cloud.yml' ))
                    .to.eventually.be.true
            );
        });
    });
});
