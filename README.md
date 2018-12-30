# multer-tree-storage

[npm](https://www.npmjs.com/package/multer-tree-storage)

## Usage
```js
let express = require('express')
let app = express()
let multer = require('multer')
let storage = require('multer-tree-storage')({destination: '/tmp/uploads/'})

let upload = multer({storage})

app.post('/profile', upload.single('avatar'), function (req, res, next) {
	// req.file is the `avatar` file
	// req.body will hold the text fields, if there were any
})
```