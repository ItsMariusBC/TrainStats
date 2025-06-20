// Script pour créer un utilisateur standard
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createUser() {
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: {
        email: 'famille@exemple.com',
      },
    });

    if (existingUser) {
      console.log('Un utilisateur avec cet email existe déjà.');
      return existingUser;
    }

    // Créer un nouvel utilisateur
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        name: 'Membre Famille',
        email: 'famille@exemple.com',
        password: hashedPassword,
        role: 'USER',
      },
    });

    console.log('Utilisateur standard créé avec succès:');
    console.log(`- ID: ${user.id}`);
    console.log(`- Nom: ${user.name}`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Rôle: ${user.role}`);
    console.log('\nVous pouvez vous connecter avec les identifiants suivants:');
    console.log('- Email: famille@exemple.com');
    console.log('- Mot de passe: password123');

    return user;
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
