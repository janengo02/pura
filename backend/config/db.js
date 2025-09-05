const mongoose = require('mongoose')
const logger = require('../utils/logger')
const env = require('./env')

const connectDB = async () => {
   try {
      await mongoose.connect(env.DATABASE_URI)
      logger.info('MongoDB Connected successfully', {
         database: 'mongodb',
         connection: 'established'
      })
   } catch (error) {
      logger.error(
         'MongoDB Connection failed',
         {
            database: 'mongodb',
            operation: 'connect',
            connectionUri: '[REDACTED]'
         },
         error
      )
      process.exit(1)
   }
}

module.exports = connectDB
