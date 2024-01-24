const express = require('express')
const mongoosee = require('mongoose')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
dotenv.config()

const app = express()
const port = process.env.PORT || 5000

// MongoDB connection
mongoosee.set('strictQuery', false)
mongoosee.connect(process.env.DB_CONNECT, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
const db = mongoosee.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

// Middleware for logging
const logMiddleware = (req, res, next) => {
  console.debug(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
}

// Middleware for logging responses
const responseLogMiddleware = (req, res, next) => {
  res.on('finish', () => {
    console.debug(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode}`)
  })
  next()
}

// Use Middlewares
app.use(bodyParser.json())
app.use(logMiddleware)
app.use(responseLogMiddleware)

// Use Routes
const userRouter = require('./routes/userRoutes')
const categoryRouter = require('./routes/categoryRoutes')
const transactionRouter = require('./routes/transactionRoutes')

app.use('/api/v1/users', userRouter)
app.use('/api/v1/category', categoryRouter)
app.use('/api/v1/transactions', transactionRouter)

// Middleware for handling root path
app.get('/', (res) => {
  res.status(200).json({ success: true, message: 'Server active' })
})

// Middleware for handling errors
app.use((res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// Start the server
app.listen(port, () => console.log(`Server running on port ${port}`))
