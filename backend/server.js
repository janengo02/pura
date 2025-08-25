const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const logger = require('./utils/logger')
const requestLogger = require('./middleware/requestLogger')
const app = express()

// Connect database
connectDB()

// CORS Configuration
const corsOptions = {
   origin: function (origin, callback) {
      const allowedOrigins = [process.env.FRONTEND_URL].filter(Boolean)

      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
         callback(null, true)
      } else {
         logger.warn('CORS blocked origin', { origin, blockedBy: 'CORS policy' })
         callback(new Error('Not allowed by CORS'))
      }
   },
   credentials: true,
   optionsSuccessStatus: 200,
   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
   allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}

app.use(cors(corsOptions))

// Request logging middleware
app.use(requestLogger)

// Init Middleware
app.use(express.json({ extended: false }))

// Define Routes
app.use('/api/v1/users', require('./routes/v1/usersApi'))
app.use('/api/v1/auth', require('./routes/v1/authApi'))
app.use('/api/v1/page', require('./routes/v1/pageApi'))
app.use('/api/v1/group', require('./routes/v1/groupApi'))
app.use('/api/v1/progress', require('./routes/v1/progressApi'))
app.use('/api/v1/task', require('./routes/v1/taskApi'))
app.use('/api/v1/calendar', require('./routes/v1/calendarApi'))
app.use('/api/v1/google-meet', require('./routes/v1/googleMeetApi'))

app.get('/', (req, res) => res.send('API Running'))

// Global error handling middleware (must be after all routes)
const { globalErrorHandler, notFoundHandler } = require('./middleware/errorHandler')

// Handle 404 for undefined routes
app.use(notFoundHandler)

// Global error handler
app.use(globalErrorHandler)

const PORT = process.env.PORT || 2000

app.listen(PORT, () => {
  logger.info('Server started', { 
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  })
})
