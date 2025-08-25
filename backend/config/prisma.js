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
   process.exit(1)
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
   process.exit(0)
})

module.exports = prisma
