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

// TODO: continue with streams

# Web servers

## WebServers.createAServer.steps:

1. require `http` module
2. create a server
3. define how to handle the requests for the server
4. put the server to listen on an specific port
5. handle any request and give a successful response

```
var http = require('http');
const HTTP_PORT = 3000;
let httpServer = http.createServer(handleRequest);

function handleRequest(req, res) {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.write("Hello World");
  res.end();
}

httpServer.listen(HTTP_PORT);
```

browser request: ``

## WebServers.routing

> What if we want to customize the requests?

We are going to handle two request: a `/hello` and any other requests. Both are in the `handleRequest` function.

```
var http = require('http');
const HTTP_PORT = 3000;
let httpServer = http.createServer(handleRequest);

function handleRequest(req, res) {
  if (res.url = "/hello") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.write("Hello World");
    res.end();
  } else {
    res.writeHead(404);
    res.end("Error: not found");
  }
}

httpServer.listen(HTTP_PORT);
```

Browser request one: `http://localhost:3000/hello`
Browser response one: "Hello World!"

Browser request two: `http://localhost:3000/asdasdasd`
Browser response two: "Error: not found"

## WebServers.staticFiles

To serve static files, there is `node-static-alias` module. It has mime types handling, serves up images and css. First of all, we need to create an http server using `http` module.

Steps to add the configuration to serve static files:

1. require `node-static-alias` module
2. create a file server
3. configure the document root and the alias
4. rewrite the handle request function

```
var http = require('http');
let httpServer = http.createServer(handleRequest);
let staticAlias = require('node-static-alias');
let path = require('path');
const HTTP_PORT = 3000;
const WEB_PATH = path.join(__dirname);

var fileServer = new staticAlias.Server(WEB_PATH, {
  cache: 100,
  serverInfo: 'Node Workshop: ex5',
  alias: [
    {
      match: /^\/(?:index\/?)?(?:[?#].*$)?$/,
      serve: 'index.html',
      force: true,
    },
    {
      match: /[^]/,
      serve: '404.html',
    },
  ],
});

function handleRequest(req, res) {
  if (req.url == '/hello') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('Hello World!');
    res.end();
  } else {
    fileServer.serve(req, res);
  }
}

httpServer.listen(HTTP_PORT);
```

- Posible requests

* Browser request one: `http://localhost:3000/hello`
* Browser response one: It responds `Hello World!`
* Browser request two: `http://localhost:3000/index`
* Browser response two: It serves with the file `index.html`
* Browser request three: `http://localhost:3000/asdasdasdasd`
* Browser response three: It serves with the file `404.html`

> How is my new server handling the requests?

- first, look for a `/hello` and response with a `"Hello World!"` (plain text)
- if not, try to match `/index` and response with an `index.html` (static file)
- if not, for any other request, it responses with a `404.html` (static file)

> What kind of data type are `req` and `res`?

Both are `http streams`. So, they are streams! We can `pipe` a request stream into a response stream.

# WebServers.express

Instead of using an if statements, we use the express functions.

Steps to create a server using express:

1. require `express` module
2. instantiate the express application (`let app = express()`)
3. create a server with http which takes a the express application `(let httpServer = http.createServer(app);`)
4. defining the route `/hello`
5. put the server to listen on port `3000`

```
let http = require('http');
let express = require('express');
let app = express();
const HTTP_PORT = 3000;

let httpServer = http.createServer(app);

function definingRoutes() {
  app.get('/hello', async function (req, res) {
    res.writeHead(200, {
      'Content-type': 'application/json',
      'Cache-Control': 'no-cache',
    });
    res.end('Hello World!');
  });
}

function main() {
  definingRoutes();
  httpServer.listen(HTTP_PORT);
}

main();
```

# Child process

# ChildProcess.LoadTester

> How many child process we are gonna handle before the app crashes?

Steps to create a load tester:

0. require `child_process` module
1. create the child process indicatin what child program we are going to run:
   ````
   var child = childProc.spaw('node', ['ex7-child.js'])
   ```
   ````
2. implement the `exit` event for that child

```
child.on("exit", function(code) {
  console.log("Child finished: ", code)
});
```

# ChildProcess.LoadTester.ExitCode

> How does the child process communicate with the main process? with `process.exitCode`

The `process.exitCode` is a number that follows the POSIX standar:

- `0` is a _success_
- otherwise is an _error_.

By default, the task return `process.exitCode = 0`. We can redefine this value inside the child processs. For example:

- `ex7-child.js`

```
async function main() {
  let n = 0;
  for (let i = 0; i < 100000000; i++) {
    n += i;
  }
  process.exitCode = 1;
}
```

And We can receives the exitCode in the main process:

- `ex7.js` as the process which calls the child process.

```
async function main() {
	// console.log(`Load testing http://localhost:${HTTP_PORT}...`);
	let child = childProc.spawn("node", ["./ex7-child.js"]);
	child.on("exit", function(code) {
		console.log("Child finished: ", code)
	});
}
```

> Why is important the exit code?

We can use the exit code to stop or continue the execution of a task. For example:

```
$ node ex7-child.js && ls -la
```

Assuming that `ex7-child.js` returns an exit code with value 1, then `ls -la` is not going to run.

## ChildProcess.LoadTester. How to crash the server?

Testing the server...

> How many requests at a time does the server support?

- Strategy:

* Keep runing the server while we are spinning multiple child process
* 1 request per child, n request at a time.
* Use `promises` to execute all the child process at a time and know if all the children finished

- Steps:

1. execute `$ node /exercises/ex6.js`
2. execute `$ ndoe /exercises/ex7.js`

# Debuging

```

```
