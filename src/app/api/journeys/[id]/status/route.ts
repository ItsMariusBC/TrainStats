// src/app/api/journeys/[id]/status/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { io } from '@/lib/socket';
import { Journey, User, Stop, Prisma } from '@prisma/client';

interface UpdateStatusRequest {
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
}

// Type qui représente un trajet avec ses relations et correspond au schéma actuel
type JourneyWithDetails = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  title: string;
  startDate: Date;
  endDate: Date | null;
  userId: string; // Champ qui stocke l'ID du créateur
  createdById: string; // Required to match JourneyWithRelations
  currentStop: number;
  notes?: string | null;
  trainNumber?: string | null;
  isPublic?: boolean;
  stops?: {
    id: string;
    name: string;
    time: Date;
    order: number;
    passed: boolean;
    journeyId: string;
    createdAt: Date;
    updatedAt: Date;
    notes: string | null;
    actualTime: Date | null;
  }[];
  createdBy?: {
    id: string;
    name: string | null;
    email: string;
  };
  followers?: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    invitationId: string | null;
  }[];
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Vous devez être connecté' },
        { status: 401 }
      );
    }

    const { id } = params;
    const data: UpdateStatusRequest = await request.json();
    
    // Valider le statut
    if (!['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED'].includes(data.status)) {
      return NextResponse.json(
        { error: 'Statut invalide' },
        { status: 400 }
      );
    }

    // Récupérer le trajet avec son créateur
    const journey = await prisma.journey.findUnique({
      where: { id },
      include: {
        createdBy: true,
      },
    }) as unknown as JourneyWithDetails | null;

    if (!journey) {
      return NextResponse.json(
        { error: 'Trajet non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est le créateur du trajet
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Le champ utilisateur dans le schéma est userId et non createdById
    if (journey.userId !== currentUser.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas modifier ce trajet' },
        { status: 403 }
      );
    }

    // Mettre à jour le trajet avec le nouveau statut
    const updatedJourney = await prisma.journey.update({
      where: { id },
      data: {
        status: data.status,
        // Si le statut est COMPLETED ou CANCELLED, définir une date de fin
        endDate: ['COMPLETED', 'CANCELLED'].includes(data.status) ? new Date() : null,
      },
      include: {
        stops: true,
        createdBy: true,
        // @ts-ignore - Le type followers existe dans le schéma mais pas dans les types TS
        followers: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
      },
    }) as unknown as JourneyWithDetails;
    
    // Mettre à jour les arrêts si le statut est COMPLETED
    if (data.status === 'COMPLETED') {
      // Marquer tous les arrêts comme passés
      await prisma.stop.updateMany({
        where: { journeyId: id },
        data: { passed: true },
      });
      
      // Récupérer à nouveau le trajet avec les arrêts mis à jour
      const completedJourney = await prisma.journey.findUnique({
        where: { id },
        include: {
          stops: true,
          createdBy: true,
          // @ts-ignore - Le type followers existe dans le schéma mais pas dans les types TS
          followers: true,
        },
      });
      
      // Émettre un événement Socket.IO pour notifier les clients
      io.emit('journey:updated', completedJourney);
      
      return NextResponse.json(completedJourney);
    }
    
    // Émettre un événement Socket.IO pour notifier les clients
    io.emit('journey:updated', updatedJourney);
    
    return NextResponse.json(updatedJourney);
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
