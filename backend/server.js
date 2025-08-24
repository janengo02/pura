const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const app = express()

// Connect database
connectDB()

// CORS Configuration
const corsOptions = {
   origin: function (origin, callback) {
      const allowedOrigins = [
         'https://pura-production.up.railway.app',
         'http://localhost:8080',
         process.env.FRONTEND_URL
      ].filter(Boolean)

      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true)

      if (allowedOrigins.includes(origin)) {
         callback(null, true)
      } else {
         console.log('CORS blocked origin:', origin)
         callback(new Error('Not allowed by CORS'))
      }
   },
   credentials: true,
   optionsSuccessStatus: 200,
   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
   allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}

app.use(cors(corsOptions))

// Init Middleware
app.use(express.json({ extended: false }))

// Define Routes
app.use('/api/users', require('./routes/api/usersApi'))
app.use('/api/auth', require('./routes/api/authApi'))
app.use('/api/page', require('./routes/api/pageApi'))
app.use('/api/group', require('./routes/api/groupApi'))
app.use('/api/progress', require('./routes/api/progressApi'))
app.use('/api/task', require('./routes/api/taskApi'))
app.use('/api/calendar', require('./routes/api/calendarApi'))
app.use('/api/google-meet', require('./routes/api/googleMeetApi'))

app.get('/', (req, res) => res.send('API Running'))

const PORT = process.env.PORT || 2000

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
