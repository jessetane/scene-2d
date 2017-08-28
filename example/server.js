var port = process.env.PORT || 8080
var address = process.env.HOST || '::'
var publicDirectory = __dirname

var fs = require('fs')
var http = require('http')
var ecstatic = require('ecstatic')
var Browserify = require('browserify')
var Watchify = require('watchify')

var browserify = Browserify(publicDirectory + '/index.js', {
  cache: {},
  packageCache: {},
  plugin: [ Watchify ]
})

browserify.on('update', () => {
  var file = fs.createWriteStream(publicDirectory + '/build.js')
  file.on('finish', done)
  file.on('error', done)
  browserify.bundle()
    .on('error', done)
    .pipe(file)
  function done (err) {
    if (err) {
      console.log('error building javascript: ' + (err.annotated ? err.annotated.slice(1) : err.message))
    } else {
      console.log('javascript built successfully')
    }
  }
})

browserify.emit('update')

var fileServer = ecstatic(publicDirectory + '/', {
  cache: 'no-cache'
})

var httpServer = new http.Server()

httpServer.on('request', (req, res) => {
  fileServer(req, res, () => {
    req.url = '/'
    res.statusCode = 200
    fileServer(req, res)
  })
})

httpServer.listen(port, address, err => {
  if (err) throw err
  console.log(`http server listening at ${httpServer.address().port}`)
})
