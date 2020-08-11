# Node hard parts

* course: [The Hard Parts of Servers & Node.js](https://frontendmasters.com/courses/servers-node-js/)
* duration: 5 hours,  16 minutes
* platform: [Frontend Masters](https://frontendmasters.com/)
* teacher: [Will Sentance](http://willsentance.com/), Codesmith
* content: 
    - Using Node APIs
    - Node with HTTP
    - Events & Error Handling
    - File System
    - Streams
    - Asynchronicity in Node

# The hard parts of Servers and NodeJS

We have 4 elements:

1. Internet
2. JS 
3. C++
4. NodeJs
5. computer feature
    - network socket
    - fyle system
    - CPU
    - Kernel i/o managment

> How does `NodeJS` born?
JS can not access to the features of the computer. Instead, C++ let us directly interact with the OS. JS has to work with C++ to control the computer features

# Javascript features

1. saves `data` and `functionality` (code)
2. uses the `data`by running `functionality` (code) on it. 
3. have `built-in labels` that trigger nodejs features (*)

Where does JS store the data? in the global variable environment or global memory

(*) what are does nodejs features? These features are built in C++ to use our computer's internal

# incomming message from outside

We have 4 important components:
1.  outside, client
2.  Node C++ features
3.  Computes's internal features
4.  JS engine

First of all, We trigger two functionalities frmo JS through the built-in function `http`:

1. create the server
2. run the server
   
## 1. create the server: `http.createServer(doOnIncoming)`

When we create the server, 3 importants things happens, 1 in JS and 2 in Node:
1. JS: we store in local memory an object (server) with some function, such as "listen"
2. Node: We store the function  `doOnIncoming` to be auto-run 
3. Node: We auto-create two objects:
    - `{url: ...., method: ...., ...}`
    - `{end: ... }`
  
## 2. run the server: `server.listen(80)`

This function open a socket at port number 80. To communicate between the computer's internal features and Node C++ features, there is a `libuv`.

When a client make a request, the computers's internal get the inbound message (http request) and pass through Node C++ .
### Steps with inbound message:

1. Computer's internal and Node C++ interaction: **auto-insert** the inbound data (*http request*) into these objects `{url: "/tweets/will", method: "GET"}` and `{end: aFunction}`.  This communication happens through `libuv` library!
   
2. C++ and JS interaction: **auto-run** `doOnIncomming` and **auto-insert** the argument of `odOnIncoming`. This communication happens through `Node`

## Steps with outbound message

Node create an execution context where the function runs. Once the function finish the execution, Node get the response and communicate to the computer's internal (networking).


# Asynchronicity

> What is the main purpose? 

Use JS engine to interact with computer's internal features (developed in C++) through Node.

So, we distinguish three important components:

1. JS engine
2. Node C++ features
3. Computer's internal features

See the example below:

``` 
1.  function useImportedtweets(errorData, data){
2.    const tweets = JSON.parse(data)
3.    console.log(tweets.tweet1)
4.  }
5.  function immediately(){console.log("Run me last! ")}
6.  function printHello(){console.log("Hello")}
7.  function blockFor500ms(){
8.  // Block JS thread DIRECTLY for 500 ms
9.  // With e.g. a for loop with 5m elements
10. }
11. setTimeout(printHello,0)
12. fs.readFile('./tweets.json', useImportedtweets)
13. blockFor500ms()
14. console.log("Me first")
15. setImmediate(immediately)

16. const server = http.createServer(doOnRequest)

17. server.listen(3000);
```

We have lots of functions.

> What functions are really Js functions and what not? 

We know that **JS** is a `single-thread` and `synchronous` language. JS does not have the features to access to the computer's internal features. JS engine can not access directly into the network socket, the file system, the CPU neither  the kernel. Instead, We use **Node** to interact with all these features through JS. 

## example.JS

In JS we have an `execution context`, which is built with:

1. `Global memory`, where it's the declarations
2. `a single-thread of execution`, where the code is executed
3. `a call stack`: where functions from JS are being run

### example.JS.stages

We should think JS as two pass processing:
1. first pass: compilation or parsing phase.
2. Second pass: execution phase.

### example.JS.stages.first

In this phase, we have:

1. the `compiler`
2. and the `scope manager`.

So, We are going to declare some stuffs in the `global memory`:

1. We declare the label `useImportedtweets (1)` in `global memory` to store a *function*
2. We declare the label `immediately (5)` in `global memory` to store a *function*
3. We declare the label `printHello (6)` in `global memory` to store a *function*
4. We declare the label `blockFor500ms (7)` in `global memory` to store a *function* 

### example.Js.stages.second

We execute the code in this phase. 

### example.Js.stages.second.setTimeout

We execute line 11: `setTimeout(printHello,0)`. 

> Is ``setTimeout` a JS function? No, it is not. It is a facade function.


> How does JS manage this kind of functionality?

JS engine triggers a Node feature, called *Timer*. 

> Does something happen in JS (1)? Does something happen in Node (2)?

Most of the work take place in Node (in background): When the timer goes to 0 (zero),  

1. Node will auto-run the `printHello` function
2. Node will auto-insert the arguments into `printHello`

So, the task has finished and it is queued into **Timer QUEUE**.

### example.JS.stages.second.fs

We execute line 12: `fs.readFile('./tweets.json', useImportedtweets)`

> Is `fs` a JS function? No, it is not. It is a facade function.

> Where does all the work happen? In Node C++  features.

Three important things happen:

1. **auto-run function** by node: the function `useImportedtweets` is storage to be auto-run
2. **auto-created objects** by node: the `error` and the `data` object.

Node interact with the file system through [`libuv`](https://github.com/libuv/libuv). Once the file `tweets.json` is read, Node

3. **auto-insert data** into the error object and the data object. We assume we got all the tweets, so:
3.a. `error` object has `null` value
3.b. `data` object has all the tweets. the content is a `Buffer` data type.  

Once the file is read, Node trigger the `data` event, and `useImportedtweets` is queued on  **I/O QUEUE**.

### example.JS.stages.second.blockFor300ms

Meanwhile the file is read, JS push `blockFor300ms` into the `call stack` to be executed. 

> What kind of task block the execution during 300 ms? 

It could be a large amount of loops to get data from arrays. For example:

```
let counter = 0;
for (let i = 0; i < 30000000; i++) {
  counter += i;
}
```

This snippet of code consumes 300 ms approximately.  

It is created a new execution context: a local memory and a thread of execution.

### example.JS.stages.second.console

Once `blockFor300ms` has finished, it is executed line 14: `console.log("Me first")`.

### example.JS.stages.second.setInmediate

Once `console.log` has finished, it is executed line  15: `setImmediate(immediately)`.

> Is `setImmediate` a JS feature? No, it is not. Is a Node C++ feature.

This functino trigger a Node C++ feature.

> What does Node do? 

Node queue the `immediately` function in **Check QUEUE**.

> And how do we continue with the execution? 

There are bunch of functions delayed in the queues: 
1. `printHello` pushed into the **Timer QUEUE** 
2. `useImportedtweets` pushed into the **I/O QUEUE** 
3. `immediately` pushed into the **Check QUEUE** 


> Which task comes first? 

We need rules to determine which task comes first.

> Who writes the rules? 

The `Event loop` determines what function/code to run next from the queue(s). 

> Who manage the `Event loop`? Node with the help of `libuv`.

### example.JS.stages.second.queues

> What rules does it set for what code to run next and when it may run?

#### 1. First and most important rule

The Event loop checks two conditions
- *condition 1*: Is something already running on the execution environment? 
- *condition 2*: Has the call stack functions to run?

If both conditions are false, then it continues with the second rule:

#### 2. Second rule

It determines the order of execution. Priority:

0. `Micro-task` Queue, `promises` go here.
1. `Callback` Queue
2. `I/O callback` Queue
3. `Check` Queue
4. `Close` Queue

