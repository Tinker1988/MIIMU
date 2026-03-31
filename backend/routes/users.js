import express from 'express'
import bcrypt from 'bcrypt'

import User from '../models/user.js'
import { authenticateToken } from "../utils/middleware.js"

const router = express.Router()
const RESERVED_ADMIN_USERNAME = 'miimu'

router.post('/signup', async (req, res) => {
  const { username, name, password } = req.body

  if (!username || username.trim().toLowerCase() === RESERVED_ADMIN_USERNAME) {
    return res.status(400).json({ error: 'This username is reserved. Please choose another username.' })
  }

  if (!password || password.length < 3) {
    return res.status(400).json({ error: 'Password must be at least 3 characters' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  try {
    const user = new User({ username: username.trim(), name, role: 'user', passwordHash })
    const savedUser = await user.save()
    res.status(201).json(savedUser)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.post('/save/:recipeId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    const recipeId = req.params.recipeId

    if (user.savedRecipes.includes(recipeId)) {
      return res.status(400).json({ error: 'Recipe already saved' })
    }

    user.savedRecipes.push(recipeId)
    await user.save()

    res.status(200).json({ message: 'Recipe saved', savedRecipes: user.savedRecipes })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.delete('/save/:recipeId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    const recipeId = req.params.recipeId

    user.savedRecipes = user.savedRecipes.filter((id) => id.toString() !== recipeId)
    await user.save()

    res.status(200).json({ message: 'Recipe removed from saved list', savedRecipes: user.savedRecipes })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.get('/saved', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('savedRecipes')
    res.json(user.savedRecipes)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

export default router
