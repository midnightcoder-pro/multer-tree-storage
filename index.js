let fs     = require('fs')
let os     = require('os')
let crypto = require('crypto')
let mv     = require('mv')
let tmpDir = os.tmpdir()

function getDestination(req, file, cb) {
  cb(null, tmpDir)
}

function getFinalPath(req, file, cb) {
  let hash = file.hash
  cb(null, file.path + '/' + hash.substr(0, 2) + '/' + hash.substr(2, 2) + '/' + hash.substr(4))
}

class TreeStorage {
  constructor(opts) {
    this.getFinalPath   = (opts.finalPath || getFinalPath)

    if (typeof opts.destination === 'string') {
      this.getDestination = ($0, $1, cb) => cb(null, opts.destination)
    } else {
      this.getDestination = (opts.destination || getDestination)
    }
  }

  _handleFile (req, file, cb) {
    this.getDestination(req, file, (err, destination) => {
      if(err) return cb(err)
      let tmpFile = tmpDir + '/' + file.originalname + Date.now()
      let outStream = fs.createWriteStream(tmpFile)
      let hash = crypto.createHash('md5').setEncoding('hex')
      file.stream.pipe(hash)
      file.stream.pipe(outStream)
      .on('error', cb)
      .on('finish', () => {
        file.hash = hash.read()
        file.path = destination
        this.getFinalPath(req, file, (err, finalPath) => {
          mv(tmpFile, finalPath, {mkdirp: true}, err => {
            if(err) return cb(err)
            cb(null, {
              destination: destination,
              path: finalPath,
              size: outStream.bytesWritten
            })
          })
        })
      })
    })
  }

  _removeFile (req, file, cb) {
    fs.unlink(file.path, cb)
  }
}

module.exports = function (opts) {
  return new TreeStorage(opts)
}