#!/usr/bin/env node

const program = require( 'commander' );
const core = require( '../src' );
const pkg = require( '../package.json' );

program
    .version( pkg.version );

program
    .command( 'bundle [sourcefiles...]' )
    .description( 'Bundles multiple compose files into a single file' )
    .option( '-f, --file [file]', 'The destination file' )
    .option( '-l, --logger [logger]', 'Logging options', JSON.parse )
    .action( function bundle( sourcefiles ) {
        core.bundle( sourcefiles, this.opts());
    });

program
    .command( 'convert [sourcefile]' )
    .description( 'Converts a docker-compose file into a docker-cloud file' )
    .option( '-f, --file [file]', 'The destination file' )
    .option( '-l, --logger [logger]', 'Logging options', JSON.parse )
    .option( '-r, --reverse', 'Reverse the direction (docker-cloud to docker-compose)' )
    .action( function bundle( sourcefile ) {
        core.convert( sourcefile, this.opts());
    });

program.parse( process.argv );
