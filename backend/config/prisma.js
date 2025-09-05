const { PrismaClient } = require('@prisma/client')
const logger = require('../utils/logger')

let prisma

try {
   prisma = new PrismaClient({
      log: ['error']
   })
} catch (error) {
   logger.error(
      'Failed to initialize Prisma Client',
      {
         database: 'prisma',
         operation: 'initialize'
      },
      error
   )
   throw new Error('Failed to initialize Prisma Client')
}

// Handle graceful shutdown
process.on('beforeExit', async () => {
   if (prisma) {
      await prisma.$disconnect()
   }
})

process.on('SIGINT', async () => {
   if (prisma) {
      await prisma.$disconnect()
   }
   throw new Error('Process terminated during SIGINT')
})

module.exports = prisma
