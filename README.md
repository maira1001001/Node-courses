<!-- @format -->

# Digging Into Node

- course: [Digging Into Node](https://frontendmasters.com/courses/digging-into-node/)
- duration: 4 hours
- teacher: @getify, [Kyle Simpson](https://me.getify.com/)
- platform: [https://frontendmasters.com/](https://frontendmasters.com/)
- content:
  - Command Line Scripts
  - Streams
  - Database
  - Web servers
  - Child process
  - Debuging

## Introduction

Node is all about modeling I/O in an efficient way. Javascript does not have anything in the spec for I/O feature. This is a reason why JS adapts to other environments. So, it is necessary to understand standar I/O and system integration.

# Content

- Command Line Script
  - `stdin`
    - read _arguments_ from command lines with `process.argv`
    - read _environment variables_ from command line with `process.env`
    - read _content_ from file system with `require('fs').readFileSync`
  - `stdout`
    - write into shell with `process.stdout.write` and `console.log`
    - write into file system with `require('fs').writeFileSync`
  - `stderr`
    - write into shell with `process.stderr.write` and `console.error`

## Command Line Script

> How do we access to those I/O streams that are exposed to out program? `process`

## CommandLineScript.stdin

> How do we get inputs from outer into our program?

We need data to process our program: `stdin`. It could be get data from the shell or from the file system.

## stdin. read arguments from command line with `process.argv`

Let's execute this command in the shell:

```
$ node ex.js --hello=world -c9
```

> How can we get the arguments `--hello=world -c9`? with `process.argv`. It is an array!

And Let's create a file `ex1.js` with this content:

```
// ex1.js

console.log(process.argv)
```

And then, run the node file from shell:

```
$ node ex1.js --hello=world -c9
[
    '/usr/local/bin/node'   //node location
    '/home/mai/example.js'  //file location
    '--hello=world',        // our arguments
    'c9'
]
```

There are bunch of modules which parse the arguments. Kyle chose [`minimist`](https://www.npmjs.com/package/minimist). It is the most popular and it has 0 dependency. We can also choose [`yargs`](https://www.npmjs.com/package/yargs).

Let's modify `ex1.js` so we can parse argument options:

```
// ex1.js

var argv = require('minimist')(process.argv.slice(2));
console.log(argv);
```

And then run it in the shell:

```
$ node ex1.js --hello=world -c9
[ _:{}, hello: 'worl', 'c9']
```

We can set what kind of data type we are taking

```
// ex1.js
var argv = require('minimist')(process.argv.slice(2), {
    boolean: ['help', 'in'],
    string: 'file'
});
if (args.help || process.argv.length <= 2) {
	printHelp()
}
function printHelp() {
	console.log("ex1 usage:");
	console.log("--help                      print this help");
	console.log("-, --in                     read file from stdin");
	console.log("--file={FILENAME}           read file from {FILENAME}");
}
```

And then run in the shell:

```
$ node ex1.js --file=hello.txt --help
ex1 usage:
--help                      print this help
--in                        read file from stdin
--file={FILENAME}           read file from {FILENAME}
```

## stdin. read environment variables from command line with `process.env`

```
console.log(process.env.HELLO)
```

And then run:

```
$ HELLO=WORLD node ex1.js
```

## stdin. read content from file system with `require('fs').readFileSync`

We are going to read the file path from command line, build the file path and read the file content. To read a file, we need to require `fs` module. Let's add this new steps into `ex1.js`

```
var args = require("minimist")(process.argv.slice(2));
var fs = require('fs');
var path = require('path');

var filePath = path.resolve(args.file);
var contents = fs.readFile(filePath);
console.log(contents);
```

We use `path` module to build the file path.

## 1. read file from stdin with `get-stdin`

```
'use strict';

var getStdin = require(get-stdin");

var args = require("minimist")(process.argv.slice(2), {
    boolean: ['in']
});
if (process.argv.length <= 2) {
  console.error('Wrong number of arguments');
} else if (args.file) {
    getStdin().then(processContentFile).catch(printError);
}

function processContentFile(content) {
  content = content.toUpperCase();
  process.stdout.write(content);
}

function printError(error) {
    process.stdout.write(error);
}
```

Notice that we've used [`get-stdin`](https://www.npmjs.com/package/get-stdin) module, because we want to do things in order:

_1°_ first of all _read the file_

_2°_ then _print on console_.

`get-stdin` return a promise. `getStdin()` takes `stdin` as a _string_.

## 2. read file from file name

```
/** @format */

'use strict';

var path = require('path');
var fs = require('fs');

var args = require('minimist')(process.argv.slice(2), {
  string: ['file'],
});
if (process.argv.length <= 2) {
  console.error('Wrong number of arguments');
} else if (args.file) {
  let filePath = path.resolve(args.file);
  let content = fs.readFile(filePath, function (err, data) {
    if (err) {
      printError(err);
    } else {
      processContentFile(data.toString());
    }
  });
}

function processContentFile(content) {
  content = content.toUpperCase();
  process.stdout.write(content);
}

function printError(error) {
  process.stdout.write(error);
}
```

When the file is read, we get `data`. It is a `<Buffer>`, not a string. That is the reason why we do `data.toString()` so we can process the content file.

## CommandLineScript.stdout

Also need to communicate data out of our program: `stdout` or `stderr`. It could be print data in the shell or write data into a file.

There is two alternatives to get inputs from shell:

1. `console.log` for `stdout` and `console.error` for `stderr`
2. `process.stdout.write`

```
var fs = require('fs');
console.log(fs.readFileSync('./hello.txt'));
```

It prints `<Buffer 48 65 6c 6c 6f 20 57 6f 72 6c 64 21>`.

`console.log` stringify the output which is a Buffer, but do not convert it into a string.

```
var fs = require('fs');
process.stdout.write(fs.readFileSync('./hello.txt'));
```

It print `Hello world!"`.

`process.stdout.write` takes the `Buffer` data type and convert it into a `String`

## Asynchrounous read file

Note that everything that it is not part of the startup, it should be asynchrounous. The `require` is synchronous.

# Streams

> How node streams works? 2 modes

1. readable stream
2. writeable stream

And also: `simplex` as uniderectional and `duplex` as bidirectional.

> How do we can connect streams? `pipe`.

```
var fs = require('fs');
var stream1 = fs.createReadStream('./hello.txt');
var stream2 = stream1.pipe(process.stdout);
```

`stream1` is a readable streams which takes a writable stream, `process.stdout`, and returns a readable stream, `stream3`. Let's run this code snippet:

```
$ node ex1.js
Hello world!
```

# Streams.transform

We use `Transform` to step in the middle of a stream pipe and process a chunk at a time.

```
var Transform = require("stream").transform
```

# Database

# Web servers

# Child process

## Debuging

```

```
