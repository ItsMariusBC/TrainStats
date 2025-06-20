// Script pour tester les API de trajets
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Fonction utilitaire pour afficher les résultats
function printResult(title, data) {
  console.log('\n==============================================');
  console.log(`${title}:`);
  console.log('==============================================');
  console.log(JSON.stringify(data, null, 2));
}

// Fonction principale pour tester les API
async function testJourneyAPI() {
  try {
    console.log('Démarrage des tests API pour les trajets...');

    // 1. Vérifier qu'il y a un utilisateur admin dans la base de données
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!adminUser) {
      console.error('Aucun utilisateur admin trouvé dans la base de données.');
      console.error('Veuillez d\'abord créer un utilisateur admin avec le script create-admin.js');
      return;
    }

    printResult('Utilisateur admin trouvé', adminUser);

    // 2. Créer un nouveau trajet de test
    const newJourney = await prisma.journey.create({
      data: {
        title: 'Trajet test ' + new Date().toISOString(),
        startDate: new Date(),
        status: 'SCHEDULED',
        isPublic: true,
        trainNumber: 'TGV1234',
        notes: 'Trajet créé par le script de test',
        userId: adminUser.id,
        stops: {
          create: [
            {
              name: 'Paris',
              time: new Date(Date.now()),
              order: 0,
              passed: false
            },
            {
              name: 'Lyon',
              time: new Date(Date.now() + 3600000), // +1h
              order: 1,
              passed: false
            },
            {
              name: 'Marseille',
              time: new Date(Date.now() + 7200000), // +2h
              order: 2,
              passed: false
            }
          ]
        }
      },
      include: {
        stops: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    printResult('Nouveau trajet créé', newJourney);

    // 3. Récupérer le trajet créé
    const journeyDetails = await prisma.journey.findUnique({
      where: { id: newJourney.id },
      include: {
        stops: {
          orderBy: { order: 'asc' }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        followers: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    printResult('Détails du trajet', journeyDetails);

    // 4. Mettre à jour le trajet
    const updatedJourney = await prisma.journey.update({
      where: { id: newJourney.id },
      data: {
        status: 'ONGOING',
        currentStop: 1,
        isPublic: false,
        notes: 'Trajet mis à jour par le script de test'
      },
      include: {
        stops: {
          orderBy: { order: 'asc' }
        }
      }
    });

    printResult('Trajet mis à jour', updatedJourney);

    // 5. Mettre à jour un arrêt pour tester le champ actualTime
    const updatedStop = await prisma.stop.update({
      where: { id: journeyDetails.stops[0].id },
      data: {
        passed: true,
        actualTime: new Date(),
        notes: 'Arrêt passé, avec heure réelle et notes'
      }
    });

    printResult('Arrêt mis à jour', updatedStop);

    // 6. Test des relations followers
    const testUser = await prisma.user.findFirst({
      where: { 
        email: 'famille@exemple.com'
      }
    });

    if (testUser) {
      // Ajouter un follower au trajet
      const journeyWithFollower = await prisma.journey.update({
        where: { id: newJourney.id },
        data: {
          followers: {
            connect: { id: testUser.id }
          }
        },
        include: {
          followers: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      printResult('Trajet avec follower ajouté', journeyWithFollower);
    } else {
      console.log('Aucun utilisateur non-admin trouvé pour tester la fonctionnalité de followers');
    }

    // 7. Récupérer tous les trajets
    const allJourneys = await prisma.journey.findMany({
      include: {
        stops: {
          orderBy: { order: 'asc' }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        followers: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    printResult('Liste des 5 derniers trajets', allJourneys);

    // 8. Supprimer le trajet de test (décommenter pour activer)
    /*
    const deletedJourney = await prisma.journey.delete({
      where: { id: newJourney.id }
    });
    
    printResult('Trajet supprimé', deletedJourney);
    */

    console.log('\n✅ Tests terminés avec succès!');

  } catch (error) {
    console.error('\n❌ Erreur lors des tests:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter les tests
testJourneyAPI();
