import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import User from '../models/user.js'

const router = express.Router()
const ADMIN_USERNAME = 'miimu'
const ADMIN_PASSWORD = 'miimumiimu'
const COMPANY_NAME = 'Make In India Mahila Udyog'

router.post('/', async (req, res) => {
  const { username, password } = req.body

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    let adminUser = await User.findOne({ username: ADMIN_USERNAME, role: 'admin' })

    if (!adminUser) {
      const existingUser = await User.findOne({ username: ADMIN_USERNAME })

      if (existingUser) {
        existingUser.name = COMPANY_NAME
        existingUser.role = 'admin'
        existingUser.passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10)
        adminUser = await existingUser.save()
      }
    }

    if (!adminUser) {
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10)
      adminUser = await User.create({
        username: ADMIN_USERNAME,
        name: COMPANY_NAME,
        role: 'admin',
        passwordHash,
      })
    }

    const token = jwt.sign(
      { username: ADMIN_USERNAME, id: adminUser._id, role: 'admin' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    )

    return res.status(200).send({
      token,
      username: ADMIN_USERNAME,
      name: COMPANY_NAME,
      role: 'admin',
    })
  }

  const user = await User.findOne({ username })

  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return res.status(401).json({ error: 'Invalid username or password' })
  }

  const userFortoken = {
    username: user.username,
    id: user._id,
    role: user.role,
  }

  const token = jwt.sign(userFortoken, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' })

  res.status(200).send({ token, username: user.username, name: user.name, role: user.role })
})

export default router
