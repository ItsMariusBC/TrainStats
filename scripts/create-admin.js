// scripts/create-admin.js
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const readline = require('readline')

const prisma = new PrismaClient()
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer)
    })
  })
}

async function createAdmin() {
  try {
    console.log('┌────────────────────────────────────────┐')
    console.log('│       Création d\'un compte admin       │')
    console.log('└────────────────────────────────────────┘')
    
    // Demander l'email de l'admin
    let email = await askQuestion('Email de l\'admin: ')
    
    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      console.log(`\n⚠️  Un utilisateur avec l'email ${email} existe déjà.`)
      const updateRole = await askQuestion('Voulez-vous le promouvoir en admin? (y/n): ')
      
      if (updateRole.toLowerCase() === 'y') {
        const updatedUser = await prisma.user.update({
          where: { email },
          data: { role: 'ADMIN' }
        })
        console.log(`\n✅ Utilisateur ${updatedUser.email} mis à jour avec le rôle ADMIN.`)
      } else {
        console.log('\nOpération annulée.')
      }
      
      rl.close()
      return
    }
    
    // Demander le nom
    const name = await askQuestion('Nom (optionnel): ')
    
    // Demander et confirmer le mot de passe
    const password = await askQuestion('Mot de passe: ')
    const confirmPassword = await askQuestion('Confirmer le mot de passe: ')
    
    if (password !== confirmPassword) {
      console.log('\n❌ Les mots de passe ne correspondent pas. Opération annulée.')
      rl.close()
      return
    }
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Créer l'utilisateur admin
    const admin = await prisma.user.create({
      data: {
        email,
        name: name || null,
        password: hashedPassword,
        role: 'ADMIN'
      }
    })
    
    console.log(`\n✅ Compte administrateur créé avec succès:`)
    console.log(`   Email: ${admin.email}`)
    console.log(`   Nom: ${admin.name || 'Non spécifié'}`)
    console.log(`   Rôle: ${admin.role}`)
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la création du compte admin:', error)
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

createAdmin().catch(console.error)
