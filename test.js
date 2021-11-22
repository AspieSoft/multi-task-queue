const taskQueue = require('./index.min')(100)

taskQueue('coffee', function(){
  console.log('coffee')
})

taskQueue('coffee', function() {
  console.log('java')
})

taskQueue('donut', function() {
  console.log('donut')
})


taskQueue(['coffee', 'donut', 'cupcake'], function() {
  console.log('coffee, donuts, and cupcakes')
})

taskQueue('cupcake', function() {
  console.log('cupcake')
})


taskQueue(['burgers', 'fries'], function() {
  console.log('burgers and fries')
})


taskQueue(['coffee', 'donut'], function() {
  console.log('coffee and donuts')
})


setTimeout(function(){
  taskQueue.clear()
}, 1000)
