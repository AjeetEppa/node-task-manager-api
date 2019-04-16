require('./db/mongoose.js')
const express = require('express')

const userRouter = require('./routers/users')
const taskRouter = require('./routers/tasks')

const port = process.env.PORT

const app = express()

// app.use((req, res, next) => {
//     if (req.method !== 'GET') {
//         return res.status(400).send("You can only perform read operations")
//     }
//     next()
// })

const multer = require('multer')

const upload = multer({
    dest: 'images',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(doc|docx)$/)) {
            cb(new Error('Uploaded file must be a Word document.'))
        }

        cb(undefined, true)
    }
})

app.post('/upload', upload.single('upload'), (req, res) => {    
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message})
})

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log("listenig on port " + port)
})

const jwt = require('jsonwebtoken')

const myFunction = (() => {
    const token = jwt.sign({ id: 'ajeeteppa' }, 'spikebebop', { expiresIn: '10 seconds' })
    console.log(token)

    setTimeout(() => {
        try {
            const data = jwt.verify(token, 'spikebebop')
            console.log(data)
        } catch (e) { console.log(e.message) }
    }, 1000)
})()
