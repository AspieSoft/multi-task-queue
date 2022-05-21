const taskQueue = (function(){
  if(process.argv.includes('min')){
    console.log('Testing index.min.js\n-----')
    return require('./index.min')(100)
  }else{
    console.log('Testing index.js\n-----')
    return require('./index')(100)
  }
})()

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let finished = 0;


taskQueue('donut', function() {
  console.log('donut')
  finished++
})

taskQueue('coffee', async function(){
  await sleep(200);
  console.log('coffee')
  finished++
})

taskQueue('coffee', async function() {
  await sleep(100);
  console.log('java')
  finished++
})

taskQueue('coffee', async function() {
  await sleep(300);
  console.log('important coffee')
  finished++
}, true, true)

taskQueue(['coffee', 'donut', 'cupcake'], function() {
  console.log('coffee, donuts, and cupcakes')
  finished++
})

taskQueue('cupcake', function() {
  console.log('cupcake')
  finished++
})

taskQueue(['burgers', 'fries'], function() {
  console.log('burgers and fries')
  finished++
})

taskQueue(['coffee', 'donut'], function() {
  console.log('coffee and donuts')
  finished++
})


taskQueue('icecream', function(next) {
  console.log('ice cream')
  finished++
  next()
}, {manual: true})

taskQueue('icecream', function(next) {
  console.log('extra ice cream')
  finished++
  // next() // not running "next" should prevent the next task
}, {manual: true})

taskQueue('icecream', function(next) {
  // this function should never be called
  console.log('no more ice cream :(')
  finished++
  next()
})


console.log(taskQueue.len('coffee'))


setTimeout(function(){
  taskQueue.clear()
}, 2000)

setTimeout(function() {
  console.log('-----');
  if(finished < 10){
    let err = new Error('Failed To Finish Queue During Test!')
    throw err
  }else if(finished > 10){
    let err = new Error('Too Many Items Finish In Queue During Test!')
    throw err
  }else{
    console.log('Finished Queue Test Successfully!')
    process.exit(0)
  }
}, 3000)
