// src/app/api/journeys/check-status/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { io } from "@/lib/socket";

export async function POST() {
  try {
    const now = new Date();

    // 1. Trouver les trajets SCHEDULED qui devraient être ONGOING
    const scheduledJourneys = await prisma.journey.findMany({
      where: {
        status: 'SCHEDULED',
        startDate: {
          lte: now // La date de début est passée
        },
        stops: {
          some: {
            time: {
              gte: now // Il reste des arrêts à venir
            }
          }
        }
      },
      include: {
        stops: true
      }
    });

    // Mettre à jour les trajets qui doivent passer en ONGOING
    for (const journey of scheduledJourneys) {
      const updatedJourney = await prisma.journey.update({
        where: { id: journey.id },
        data: {
          status: 'ONGOING'
        },
        include: {
          stops: true
        }
      });
      io.emit('journey:updated', updatedJourney);
    }

    // 2. Trouver les trajets ONGOING qui devraient être COMPLETED
    const ongoingJourneys = await prisma.journey.findMany({
      where: {
        status: 'ONGOING',
        stops: {
          every: {
            time: {
              lt: now // Tous les arrêts sont passés
            }
          }
        }
      },
      include: {
        stops: true
      }
    });

    // Mettre à jour les trajets qui doivent passer en COMPLETED
    for (const journey of ongoingJourneys) {
      const updatedJourney = await prisma.journey.update({
        where: { id: journey.id },
        data: {
          status: 'COMPLETED',
          endDate: now
        },
        include: {
          stops: true
        }
      });
      io.emit('journey:updated', updatedJourney);
    }

    return NextResponse.json({ 
      message: "Statuts mis à jour",
      updated: {
        started: scheduledJourneys.length,
        completed: ongoingJourneys.length
      }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des statuts:', error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des statuts" },
      { status: 500 }
    );
  }
}