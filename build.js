const miniforge = require('@aspiesoft/miniforge-js')
miniforge.rootDir(__dirname)
miniforge.build('./index.js', {outputNameMin: true})
