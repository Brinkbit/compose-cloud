# CLI

Install: `npm i -g compose-cloud`

```
  Usage: compose-cloud [options] [command]

  Commands:

    bundle [options] [sourcefiles...]  Bundles multiple compose files into a single file
    convert [options] [sourcefile]     Converts a docker-compose file into a docker-cloud file

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```

bundle:

```
  Usage: bundle [options] [sourcefiles...]

  Bundles multiple compose files into a single file

  Options:

    -h, --help             output usage information
    -f, --file [file]      The destination file
    -l, --logger [logger]  Logging options
```

convert:

```
  Usage: convert [options] [sourcefile]

  Converts a docker-compose file into a docker-cloud file

  Options:

    -h, --help             output usage information
    -f, --file [file]      The destination file
    -l, --logger [logger]  Logging options
    -r, --reverse          Reverse the direction (docker-cloud to docker-compose)
```

# API

Install: `npm i -s compose-cloud`

Exposes two methods:
- composeCloud.bundle( sourcePaths, options );
- composeCloud.convert( sourcePath, options );

## Options:
- **file** *string* a destination path
- **logger** *bbject* [winston console transport options](https://github.com/winstonjs/winston/blob/master/docs/transports.md#console-transport)
- **reverse** *boolean* for `convert()` reverses the direction (docker-cloud to docker-compose)

```javascript
const composeCloud = require( 'compose-cloud' );

// returns a promise
composeCloud.bundle(
    // source file paths
    [ './test/source/docker-compose.yml', './test/source/docker-compose.override.yml' ],
    // destination
    { file: './test/dest/docker-compose.yml' },
);

// returns a promise
composeCloud.convert(
    // source file
    './test/source/docker-compose.yml',
    // destination
    { file: './test/dest/docker-cloud.yml' },
);
```

# Running Tests

`npm test`
