const express = require('express')
const connectDB = require('./config/db')
const app = express()

// Connect database
connectDB()

// Init Middleware
app.use(express.json({ extended: false }))

// Define Routes
app.use('/api/users', require('./routes/api/usersApi'))
app.use('/api/auth', require('./routes/api/authApi'))
app.use('/api/page', require('./routes/api/pageApi'))
app.use('/api/group', require('./routes/api/groupApi'))
app.use('/api/progress', require('./routes/api/progressApi'))
app.use('/api/task', require('./routes/api/taskApi'))
app.use('/api/google-account', require('./routes/api/googleAccountApi'))

app.get('/', (req, res) => res.send('API Running'))

const PORT = process.env.PORT || 2000

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
