const User = require('../models/users')
const express = require('express')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/accounts')

const router = express.Router()

router.post('/users', async (req, res) => {
    const newUser = new User(req.body)
    try {
        await newUser.save()
        sendWelcomeEmail(newUser.email, newUser.name)
        const token = await newUser.generateAuthToken()
        res.status(201).send({ newUser, token })
    } catch (e) {
        res.status(400).send(e.message)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()

        res.send({ user, token })
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})

router.post('/users/logoutall', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/users', async (req, res) => {
    try {
        const users = await User.find({})
        res.send(users)
    } catch (e) {
        console.log('e', e)
    }
})


router.get('/users/me', auth, async (req, res) => {
    try {
        res.send(req.user)
    } catch (e) {
        console.log('e', e)
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('File must be jpg, jpeg or png'))
        }
        cb(undefined, true)
    }
})

router.get('/users/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const user = await User.findById(_id)

        if (!user) {
            res.status(404).send("No user found")
            return console.log("No user found")
        }
        res.send(user)
    } catch (e) {
        console.log('e', e)
    }
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid Updates!" })
    }
    try {
        updates.forEach(update => req.user[update] = req.body[update])
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})

router.patch('/users/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'age', 'email', 'password']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid Updates!" })
    }
    const _id = req.params.id

    try {
        const user = await User.findById(req.params.id)

        updates.forEach(update => user[update] = req.body[update])

        await user.save()

        if (!user) {
            return res.status(404).send('User not found')
        }

        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, (req, res) => {
    try {
        req.user.remove()
        sendCancelationEmail(req.user.email, req.user.name)
        res.status(200).send()
    }
    catch (e) {
        res.status(500).send(e)
    }
})

router.delete('/users/:id', auth, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)

        if (!user) {
            res.status(404).send({ error: "No user found" })
        }
        res.send(user)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error('e')
        }
        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send(e.message)
    }
})

module.exports = router;