import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'

import recipeRoutes from './routes/recipes.js'
import userRoutes from './routes/users.js'
import loginRoutes from './routes/login.js'

dotenv.config()
console.log("MONGO_URI =", process.env.MONGO_URI);


const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/recipes', recipeRoutes)
app.use('/api/users', userRoutes)
app.use('/api/login', loginRoutes)

// mongodb connection
const mongoURI = process.env.MONGO_URI

mongoose.connect(mongoURI)
  .then(() => console.log('connected to mongodb'))
  .catch(err => console.error('mongodb connection failed: ', err.message))

// test route
app.get('/', (req, res) => {
  res.json({ message: 'Recipe API is running!' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
