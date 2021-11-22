;(function() {

  const crypto = (function() {
    try {
      return require('crypto')
    } catch(e) {
      if(typeof document !== 'undefined'){
        let script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/gh/AspieSoft/random-number-js@1.3.2/script.min.js'
        const body = (document.body || document.getElementsByTagName('body')[0])
        body.append(script.src)
      }
      return undefined
    }
  })()


  let randIndex = 0
  function randomID() {
    if(crypto) {
      return (randIndex++).toString() + crypto.randomBytes(16).toString('hex')
    }
    return (randIndex++).toString() + random().toString()
  }

  setInterval(function(){
    randIndex = 0
  }, 1000)


  function main(intervalMS = 10) {

    const tasks = {}
    const types = []

    const taskQueue = {}
    const readyQueue = {}


    function readyNewType(type) {
      if(!types.includes(type)) {
        types.push(type)
        taskQueue[type] = []
        readyQueue[type] = []
      }
    }

    function runTaskCB(cb, after) {
      setImmediate(function() {
        cb()
        after()
      })
    }


    function addTask(type, cb, blocking = true) {
      const id = randomID()

      tasks[id] = {type, cb, blocking, state: 0}

      if(Array.isArray(type)) {
        tasks[id].multiType = type.length
        tasks[id].ready = 0
        for(let i = 0; i < type.length; i++) {
          readyNewType(type[i])
          taskQueue[type[i]].push(id)
        }
      } else {
        readyNewType(type)
        taskQueue[type].push(id)
      }
    }

    function readyNextTask(type) {
      if(!taskQueue[type].length) {
        return
      }

      if(!readyQueue[type].length || !tasks[taskQueue[type][0]].blocking) {
        let id = taskQueue[type].shift()
        if(!tasks[id].multiType) {
          readyQueue[type].push(id)
          if(!tasks[id].blocking) {
            readyNextTask(type)
          }
        } else {
          tasks[id].ready++
          if(tasks[id].ready >= tasks[id].multiType) {
            readyQueue[type].push(id)
            if(!tasks[id].blocking) {
              readyNextTask(type)
            }
          } else {
            readyNextTask(type)
          }
        }
      }
    }


    function runNextTask(type) {
      for(let i = 0; i < readyQueue[type].length; i++) {
        let id = readyQueue[type][i]

        if(i > 0 && tasks[id].blocking) {
          break
        }

        if(tasks[id].state === 0) {
          tasks[id].state = 1
          runTaskCB(tasks[id].cb, function() {
            tasks[id].state = 2
          })
        } else if(tasks[id].state === 2) {
          tasks[id].state = 3
          readyQueue[type].splice(i, 1)
          delete tasks[id]
          continue
        }

        if(tasks[id] && tasks[id].blocking) {
          break
        }
      }
    }


    setInterval(function() {
      for(let i = 0; i < types.length; i++) {
        if(!readyQueue[types[i]].length) {
          readyNextTask(types[i])
        }
        runNextTask(types[i])
      }
    }, intervalMS);


    const func = addTask
    func.clear = function() {
      for(let i = 0; i < types.length; i++) {
        delete taskQueue[types[i]]
        delete readyQueue[types[i]]
      }
      for(let i in tasks) {
        delete tasks[i]
      }
      types.splice(0, types.length)
    }
    return func
  }

  if(typeof module !== 'undefined') {
    module.exports = main
  } else if(typeof window !== 'undefined') {
    window.multiTaskQueue = main
  } else if(typeof global !== 'undefined') {
    global.multiTaskQueue = main
  }

})();
