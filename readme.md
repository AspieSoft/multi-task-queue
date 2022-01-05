# Multi Task Queue

![npm version](https://img.shields.io/npm/v/@aspiesoft/multi-task-queue)
![GitHub top language](https://img.shields.io/github/languages/top/aspiesoft/multi-task-queue)
![GitHub license](https://img.shields.io/github/license/aspiesoft/multi-task-queue)

![npm downloads](https://img.shields.io/npm/dw/@aspiesoft/multi-task-queue)
![npm downloads](https://img.shields.io/npm/dm/@aspiesoft/multi-task-queue)
![jsDelivr hits (GitHub)](https://img.shields.io/jsdelivr/gh/hm/aspiesoft/multi-task-queue)

[![paypal](https://img.shields.io/badge/buy%20me%20a%20coffee-paypal-blue)](https://buymeacoffee.aspiesoft.com/)

## An advanced and easy to use queueing system

This task queue allows you to select/create a queue type, and seperate tasks into different queues. The queue simply runs your callback function to allow endless possibilities.

You can also add a task to multiple queue types, to make that task wait for all its queue types to be ready without blocking other queue types before its ready. You can also (optionally) add non-blocking tasks to the queue and they will wait for blocking tasks to finish, than run at the same time as other non blocking tasks.

This queue was made with custom database queueing in mind. You could queue a seperate type for each file, and a task can require multiple files to block in the queue. Single file reads and writes would be kept isolated, and if that file isn't blocked, it can still run asynchronously. A non-blocking task could be useful for read requests, so if multiple users try to read a file at the same time, it will happen asynchronously, and no reads are blocked until a blocking write request is made.

## Installation

### node.js

```shell script
npm install @aspiesoft/multi-task-queue
```

## cdn

```html
<script src="https://cdn.jsdelivr.net/gh/AspieSoft/multi-task-queue@1.2.0/index.min.js"></script>
```

## Usage

```JavaScript

// require only if using node.js
const multiTaskQueue = require('@aspiesoft/multi-task-queue');

const taskQueue = multiTaskQueue(10 /* interval in milliseconds for the queue to run the next task */)


// you can make more than one queue instance (these queues are isolated)
const taskQueue2ndInstance = multiTaskQueue(100)



// add a task to the coffee queue
taskQueue('coffee', function(){
  // do anything you want here...
  console.log('coffee')
})

// add a task to the donut queue
taskQueue('donut', function() {
  // do anything you want here...
  console.log('donut')
})

// add a task that requires both the coffee and donut queue
taskQueue(['coffee', 'donut'], function() {
  // do anything you want here...
  console.log('coffee and donuts')
})

// add another task to the coffee queue
taskQueue('coffee', function() {
  // do anything you want here...
  console.log('java')
}, false /* non-blocking */)

// add an async task
taskQueue('coffee', async function() {
  // do anything you want here...
  await someAsyncFunction();
  console.log('someone spilled the coffee')
})


// add a non blocking task
taskQueue('coffee', function() {
  // do anything you want here...
  console.log('java anytime, I can wait')
}, false /* blocking = false */)

// add a priority task
taskQueue('coffee', function() {
  // do anything you want here...
  console.log('Need morning coffee ASAP!')
}, true /* blocking = true */, false /* priority = true */)


// by default
// blocking = true
// priority = false


// clear and reset the queue
taskQueue.clear()

```
