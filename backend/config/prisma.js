const { PrismaClient } = require('@prisma/client')

let prisma

try {
   prisma = new PrismaClient({
      log: ['error'],
   })
   
   console.log('Prisma Client initialized successfully')
   
} catch (error) {
   console.error('Failed to initialize Prisma Client:', error)
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
