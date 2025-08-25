const mongoose = require('mongoose')
const dotenv = require('dotenv')
const logger = require('../utils/logger')

dotenv.config()
const connectDB = async () => {
   try {
      await mongoose.connect(process.env?.DATABASE_URI)
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
            connectionUri: process.env?.DATABASE_URI
               ? '[REDACTED]'
               : 'undefined'
         },
         error
      )
      process.exit(1)
   }
}

module.exports = connectDB
