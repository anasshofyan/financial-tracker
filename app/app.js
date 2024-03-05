const path = require('path')
const express = require('express')
const mongoosee = require('mongoose')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const cors = require('cors')
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

app.use(
  cors({
    origin: '*', // Atur origin sesuai dengan alamat localhost Anda
    credentials: true, // Atur credentials jika diperlukan
  }),
)

// Use Middlewares
app.use(bodyParser.json())
app.use(logMiddleware)
app.use(responseLogMiddleware)

// Use Routes
const authRouter = require('./routes/authRoutes')
const oauthRouter = require('./routes/oauthRoutes')
const userRouter = require('./routes/userRoutes')
const categoryRouter = require('./routes/categoryRoutes')
const transactionRouter = require('./routes/transactionRoutes')
const chartRouter = require('./routes/chartRoutes')
const { sendResponse } = require('./utils/response')

app.use(express.json())
app.use('/oauth', oauthRouter)
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/chart', chartRouter)
app.use('/api/v1/category', categoryRouter)
app.use('/api/v1/transactions', transactionRouter)

// Middleware for handling root path
app.get('/', (req, res) => {
  const htmlContent = path.join(__dirname, 'template.html')
  res.sendFile(htmlContent)
})

// Middleware for handling errors
app.use((req, res) => {
  sendResponse(res, false, 'Route not found', 404, {})
})

// Start the server
app.listen(port, () => console.log(`Server running on port ${port}`))
