const express = require('express')
const connectDB = require('./config/db')
const path = require('path')

const app = express()

// Connect database
connectDB()

// Init Middleware
app.use(express.json({ extended: false }))

// Define Routes
app.use('/api/users', require('./routes/api/users'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/page', require('./routes/api/page'))
app.use('/api/group', require('./routes/api/group'))
app.use('/api/progress', require('./routes/api/progress'))
app.use('/api/task', require('./routes/api/task'))
app.use('/api/google-account', require('./routes/api/googleAccount'))

app.get('/', (req, res) => res.send('API Running'))

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
