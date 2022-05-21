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
    return (randIndex++).toString() + Math.random().toString()
  }

  setInterval(function(){
    randIndex = 0
  }, 1000)


  function main(intervalMS = 10) {

    const tasks = {}
    const types = []

    const taskQueue = {}
    const readyQueue = {}

    const taskLen = {}
    const taskRunLen = {}

    function changeTaskLength(type, change = 1, run = false){
      if(run){
        if(taskRunLen[type] === undefined){
          taskRunLen[type] = change
        }else{
          taskRunLen[type] += change
        }
        return
      }
      if(taskLen[type] === undefined){
        taskLen[type] = change
      }else{
        taskLen[type] += change
      }
    }


    function readyNewType(type, priority = false) {
      if(!types.includes(type)) {
        if(priority){
          types.unshift(type)
        }else{
          types.push(type)
        }
        taskQueue[type] = []
        readyQueue[type] = []
      }
    }

    function runTaskCB(cb, after, manual = undefined) {
      setImmediate(async function() {
        if(manual || (manual !== false && cb.length > 0)){ /* auto detect if argument was requested */
          await cb(after)
        }else{
          await cb(() => {})
          after()
        }
      })
    }


    function addTask(type, cb, {blocking, priority, manual} = {blocking: true, priority: false, manual: undefined}) {
      if(typeof arguments[2] === 'boolean'){
        blocking = arguments[2]
        priority = !!arguments[3]
      }else if(typeof arguments[2] === 'function'){
        if(cb === null){
          blocking = false
          priority = true
        }else if(typeof cb === 'object'){
          if(Array.isArray(cb)){
            blocking = !!cb[0]
            priority = !!cb[1]
            if(cb[2] === true){
              manual = true
            }else if(cb[2] === false){
              manual = false
            }
          }else{
            blocking = !!cb.blocking
            priority = !!cb.priority
            if(cb.manual === true){
              manual = true
            }else if(cb.manual === false){
              manual = false
            }
          }
        }else if(typeof cb === 'boolean'){
          blocking = cb
          priority = cb
        }else{
          blocking = true
          priority = false
        }
        cb = arguments[2]
      }

      if(blocking === undefined){blocking = true}
      if(priority === undefined){priority = false}

      const id = randomID()

      tasks[id] = {type, cb, state: 0, blocking, priority, manual}

      if(Array.isArray(type)) {
        tasks[id].multiType = type.length
        tasks[id].ready = 0
        for(let i = 0; i < type.length; i++) {
          changeTaskLength(type[i], 1)
          readyNewType(type[i], priority)
          if(priority){
            taskQueue[type[i]].unshift(id)
          }else{
            taskQueue[type[i]].push(id)
          }
        }
      } else {
        changeTaskLength(type, 1)
        readyNewType(type, priority)
        if(priority) {
          taskQueue[type].unshift(id)
        } else {
          taskQueue[type].push(id)
        }
      }
    }

    function readyNextTask(type) {
      if(!taskQueue[type] || !taskQueue[type].length) {
        return
      }

      if(!readyQueue[type].length || !tasks[taskQueue[type][0]].blocking) {
        let id = taskQueue[type].shift()
        if(!tasks[id].multiType) {
          if(tasks[id].priority){
            readyQueue[type].unshift(id)
          }else{
            readyQueue[type].push(id)
          }
          if(!tasks[id].blocking) {
            readyNextTask(type)
          }
        } else {
          tasks[id].ready++
          if(tasks[id].ready >= tasks[id].multiType) {
            if(tasks[id].priority) {
              readyQueue[type].unshift(id)
            } else {
              readyQueue[type].push(id)
            }
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
      if(!readyQueue[type]){
        return
      }

      for(let i = 0; i < readyQueue[type].length; i++) {
        let id = readyQueue[type][i]

        if(i > 0 && tasks[id].blocking) {
          break
        }

        if(tasks[id].state === 0) {
          tasks[id].state = 1
          changeTaskLength(type, 1, true)
          runTaskCB(tasks[id].cb, function() {
            changeTaskLength(type, -1, true)
            changeTaskLength(type, -1)
            if(tasks[id]){
              tasks[id].state = 2
            }
          }, tasks[id].manual)
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
        if(!readyQueue[types[i]] || !readyQueue[types[i]].length) {
          readyNextTask(types[i])
        }
        runNextTask(types[i])
      }
    }, intervalMS)


    const func = addTask
    func.clear = function(type) {
      if(Array.isArray(type)){
        for(let i = 0; i < type.length; i++){
          delete taskQueue[type[i]]
          delete readyQueue[type[i]]
          for(let j in tasks) {
            if(Array.isArray(tasks[j].type) && tasks[j].type.includes(type[i])){
              delete tasks[j]
            }else if(tasks[j].type === type[i]){
              delete tasks[j]
            }
          }
        }
        return
      }else if(type){
        delete taskQueue[type]
        delete readyQueue[type]
        for(let i in tasks) {
          if(Array.isArray(tasks[i].type) && tasks[i].type.includes(type)){
            delete tasks[i]
          }else if(tasks[i].type === type){
            delete tasks[i]
          }
        }
        return
      }

      for(let i = 0; i < types.length; i++) {
        delete taskQueue[types[i]]
        delete readyQueue[types[i]]
      }
      for(let i in tasks) {
        delete tasks[i]
      }
      types.splice(0, types.length)
    }
    func.len = function(type, running = false) {
      if(type === true){
        [type, running] = [running, type]
      }

      if(!type){
        let len = 0
        for(let i = 0; i < types.length; i++){
          if(running){
            len += (taskRunLen[types[i]] || 0)
          }else{
            len += (taskLen[types[i]] || 0)
          }
        }
        return len
      }else if(Array.isArray(type)){
        let len = 0
        for(let i = 0; i < type.length; i++){
          if(running){
            len += (taskRunLen[type[i]] || 0)
          }else{
            len += (taskLen[type[i]] || 0)
          }
        }
        return len
      }

      if(running){
        return taskRunLen[type] || 0
      }
      return taskLen[type] || 0
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
