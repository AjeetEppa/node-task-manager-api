const Task = require('../models/tasks')
const express = require('express')
const auth = require('../middleware/auth')

const router = express.Router()

router.post('/tasks', auth, async (req, res) => {
    const newtask = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        const user = await newtask.save()
        res.status(201).send(user)
    } catch (e) {
        res.status(400).send(e)
        console.log(e)
    }
})

router.get('/tasks', auth, async (req, res) => {
    try {
        const tasks = await Task.find({})
        res.send(tasks)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/tasks/me', auth, async (req, res) => {
    let match = {}
    let sort = {}

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: +req.query.limit,
                skip: +req.query.skip,
                sort
            }
        }).execPopulate()

        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send(e.message)
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({ _id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }
        res.status(200).send(task)
    } catch (e) {
        res.status(500).send(e.message)
    }
})

router.patch('/tasks/me/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(401).send({ 'error': 'Invalid Updates' })
    }
    try {
        const task = await Task.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, req.body)

        if (!task) {
            return res.status(401).send()
        }

        res.status(200).send(task)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid Update!" })
    }

    try {
        const task = await Task.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })

        if (!task) {
            return res.status(404).send({ error: "No task found" })
        }

        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/tasks/me/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(404).send({ error: 'No task found!' })
        }

        res.send(task)
    } catch (e) {
        res.status(500).send(e.message)
    }
})

router.delete('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id)

        if (!task) {
            return res.status(404).send({ error: "No task found" })
        }

        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router;