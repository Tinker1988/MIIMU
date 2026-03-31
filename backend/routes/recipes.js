import express from 'express'

import Application from '../models/recipe.js'
import User from '../models/user.js'
import { authenticateToken } from '../utils/middleware.js'

const router = express.Router()

router.get('/', async (req, res) => {
  const applications = await Application.find().sort({ createdAt: -1 })
    .populate('user', 'username name role')
    .populate('likedBy', 'username name')
  res.json(applications)
})

router.get('/mine', authenticateToken, async (req, res) => {
  const applications = await Application.find({ user: req.user.id }).sort({ createdAt: -1 })
    .populate('user', 'username name role')
    .populate('likedBy', 'username name')
  res.json(applications)
})

router.post('/', authenticateToken, async (req, res) =>  {
  const {
    title,
    description,
    applicantName,
    contactEmail,
    location,
    capacityKw,
    systemType,
    status,
    priority,
    ingredients,
   steps,
    documents,
    folders,
    adminRemarks,
    stageProgress,
    imageUrl,
  } = req.body

  try {
    const owner = await User.findById(req.user.id)
    if (!owner) {
      return res.status(401).json({ error: 'Authenticated user not found. Please log in again.' })
    }

    const application = new Application({
      title,
      description,
      applicantName,
      contactEmail,
      location,
      capacityKw,
      systemType,
      status,
      priority,
      ingredients,
      steps,
      documents,
      folders,
      adminRemarks,
      stageProgress,
      imageUrl,
      user: req.user.id,
    })
    const savedApplication = await application.save()

    owner.postedRecipes.push(savedApplication._id)
    await owner.save()

    res.status(201).json(savedApplication)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate('user', 'username name role')
    .populate('likedBy', 'username name')
  res.json(application)
})

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
    if (!application) return res.status(404).json({ error: 'Application not found' })

    if (application.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this project' })
    }

    const updatedApplication = await Application.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('user', 'username name role')
      .populate('likedBy', 'username name')
    res.json(updatedApplication)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.put('/:id/like', authenticateToken, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
    if (!application) return res.status(404).json({ error: 'Application not found' })

    const userId = req.user.id

    if (application.likedBy.some((id) => id.toString() === userId)) {
      application.likedBy = application.likedBy.filter((id) => id.toString() !== userId)
    } else {
      application.likedBy.push(userId)
    }

    application.likes = application.likedBy.length
    const updatedApplication = await application.save()

    res.json(updatedApplication)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
    if (!application) return res.status(404).json({ error: 'Application not found' })

    if (application.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this project' })
    }

    await Application.findByIdAndDelete(req.params.id)

    const user = await User.findById(application.user)
    user.postedRecipes = user.postedRecipes.filter(id => id.toString() !== req.params.id)
    await user.save()

    res.status(204).end()
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

export default router
