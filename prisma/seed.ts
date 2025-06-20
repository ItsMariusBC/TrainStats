// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  try {
    // Tester la connexion
    await prisma.$connect()
    console.log('Connected to database successfully')

    const adminEmail = 'contact@sheldon-dev.fr'
    
    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (existingAdmin) {
      console.log('Un compte admin existe déjà')
      return
    }

    // Créer le compte admin
    const hashedPassword = await bcrypt.hash('rH3rPa7a6Z3WGWfEr', 10)
    
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin',
        password: hashedPassword,
        role: 'ADMIN',
      }
    })

    console.log('Compte admin créé:', admin)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })