# Multi Task Queue

![npm version](https://img.shields.io/npm/v/multi-task-queue)
![GitHub top language](https://img.shields.io/github/languages/top/aspiesoft/multi-task-queue)
![GitHub license](https://img.shields.io/github/license/aspiesoft/multi-task-queue)

![npm downloads](https://img.shields.io/npm/dw/multi-task-queue)
![npm downloads](https://img.shields.io/npm/dm/multi-task-queue)
![jsDelivr hits (GitHub)](https://img.shields.io/jsdelivr/gh/hm/aspiesoft/multi-task-queue)

[![square](https://img.shields.io/badge/buy%20me%20a%20coffee-square-blue)](https://buymeacoffee.aspiesoft.com/)

## An advanced and easy to use queueing system

This task queue allows you to select/create a queue type, and seperate tasks into different queues. The queue simply runs your callback function to allow endless possibilities.

You can also add a task to multiple queue types, to make that task wait for all its queue types to be ready without blocking other queue types before its ready. You can also (optionally) add non-blocking tasks to the queue and they will wait for blocking tasks to finish, than run at the same time as other non blocking tasks.

This queue was made with custom database queueing in mind. You could queue a seperate type for each file, and a task can require multiple files to block in the queue. Single file reads and writes would be kept isolated, and if that file isn't blocked, it can still run asynchronously. A non-blocking task could be useful for read requests, so if multiple users try to read a file at the same time, it will happen asynchronously, and no reads are blocked until a blocking write request is made.

Tasks are blocking by default. This means the current task must finish, before the next task of that same type can start.
When blocking is disabled, 2 tasks of the same type can run async at the same time.
Once a blocking task shows up in the queue, the non blocking tasks behind it may wait.

Tasks are non priority by default. This means new tasks are added to the end of the queue.
When a task is set as a priority, it will be added to the front of the queue.
A priority task will Not stop a currently running task, it will still wait its turn, but cut in front of the other tasks that are still waiting in the queue.

## What's New

- Added "manual" option to use a "next" function to run the next task in the queue.
- If the "manual" option is not explicitly set to false, this module will auto detect if your function requests an argument, and set the functions "manual" option to true if it does.

## Installation

### node.js

```shell script
npm install multi-task-queue
```

## cdn

```html
<script src="https://cdn.jsdelivr.net/gh/AspieSoft/multi-task-queue@1.3.1/index.min.js"></script>
```

## Usage

```JavaScript

// require only if using node.js
const multiTaskQueue = require('multi-task-queue');

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
}, true /* blocking = true */, true /* priority = true */)


// by default
// blocking = true
// priority = false
// manual = false (new)


// new ways of setting blocking and priority (this module is backwards compatable with the old method)

// object
taskQueue('coffee', function() {
  console.log('Need morning coffee ASAP! I will Fill The Pot For Everyone!')
}, {blocking: false, priority: true})

// swap function placement
taskQueue('coffee', {blocking: false, priority: true}, function() {
  console.log('Need morning coffee ASAP! I will Fill The Pot For Everyone!')
})

// array
taskQueue('coffee', [true /* blocking = true */, false /* priority = false */], function() {
  console.log('more coffee')
})

// swap blocking and priority default values {blocking: false, priority: true}
taskQueue('coffee', null, function() {
  console.log('Need morning coffee ASAP! I will Fill The Pot For Everyone!')
})

// set blocking and priority to true
taskQueue('coffee', true, function() {
  console.log('Must Have Coffee!!!')
})

// set blocking and priority to false
taskQueue('coffee', false, function() {
  console.log('maybe some more coffee later')
})


// new option to manually finish queue
taskQueue('icecream', function(next) {
  console.log('ice cream')
  next()
}, {manual: true /* setting this to true means you need to run the "next" function when your done */})

taskQueue('icecream', function(next) {
  console.log('extra ice cream')
  // next() // not running "next" should prevent the next task
}, {manual: true})

taskQueue('icecream', function(next) {
  // this function should never be called
  console.log('no more ice cream :(')
  next()
}) /* note: if manual in undefined, this module will auto detect if your function accepts an argument */


// clear and reset the queue
taskQueue.clear()

// clear and reset the queue for a specific type
taskQueue.clear('coffee')

// clear and reset the queue for a lest of types
taskQueue.clear(['coffee', 'donut'])


// get the number of tasks queued for a specific type
taskQueue.len('coffee')

// get the total number of tasks queued for multiple types (added together)
taskQueue.len(['coffee', 'donut'])

// get the number of Running tasks for a specific type
taskQueue.len('coffee', true /* running = true */)

// get the total number of tasks for every type in this queue
taskQueue.len()

// get the total number of Running tasks for every type in this queue
taskQueue.len(true)

```
