// src/app/api/journeys/[id]/position/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { io } from '@/lib/socket';
import { Journey, User, Stop, Prisma } from '@prisma/client';

interface UpdatePositionRequest {
  currentStop: number;
  actualTime?: string; // ISO date string
  notes?: string;
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
    const data: UpdatePositionRequest = await request.json();
    
    // Récupérer le trajet avec ses arrêts
    const journey = await prisma.journey.findUnique({
      where: { id },
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

    // Vérification en utilisant userId qui est le champ correct dans le schéma actuel
    if (journey.userId !== currentUser.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas modifier ce trajet' },
        { status: 403 }
      );
    }

    // Valider l'index de l'arrêt
    if (data.currentStop < 0 || (journey.stops && data.currentStop >= journey.stops.length)) {
      return NextResponse.json(
        { error: 'Index d\'arrêt invalide' },
        { status: 400 }
      );
    }

    // Mettre à jour le trajet avec la nouvelle position
    const updatedJourney = await prisma.journey.update({
      where: { id },
      data: {
        currentStop: data.currentStop,
        // Notes est géré comme un champ personnalisé, utilisons Prisma.DbNull pour gérer les valeurs null
        ...(data.notes !== undefined ? { notes: data.notes || Prisma.DbNull } : {}),
        status: data.currentStop === (journey.stops?.length || 0) - 1 ? 'COMPLETED' : 'ONGOING',
      },
      include: {
        stops: true,
        createdBy: true,
        followers: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
      },
    }) as unknown as JourneyWithDetails;
    
    // Mettre à jour l'arrêt actuel avec l'heure réelle de passage
    if (journey.stops && data.currentStop < (journey.stops?.length || 0)) {
      const currentStopId = journey.stops[data.currentStop].id;
      
      // Mise à jour du stop actuel avec actualTime et notes
      await prisma.stop.update({
        where: { id: currentStopId },
        data: {
          passed: true,
          // Ces champs doivent être gérés directement dans le schéma Prisma
          // et non comme des champs personnalisés
          // @ts-ignore - Ces champs sont définis dans le schéma Prisma même s'ils ne sont pas dans les types
          actualTime: data.actualTime ? new Date(data.actualTime) : new Date(),
          // @ts-ignore - Ces champs sont définis dans le schéma Prisma même s'ils ne sont pas dans les types
          notes: data.notes || null,
        },
      });
      
      // Mettre à jour tous les arrêts précédents comme passés
      if (data.currentStop > 0 && journey.stops) {
        const previousStopIds = journey.stops
          .filter((_, i) => i < data.currentStop)
          .map(stop => stop.id);
          
        await prisma.stop.updateMany({
          where: { id: { in: previousStopIds } },
          data: { passed: true },
        });
      }
    }

    // Récupérer la version mise à jour du trajet avec tous les arrêts
    const finalJourney = await prisma.journey.findUnique({
      where: { id },
      include: {
        stops: true,
        createdBy: true,
        followers: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
      },
    }) as unknown as JourneyWithDetails;
    
    // Émettre un événement Socket.IO pour notifier les clients
    io.emit('journey:updated', finalJourney);
    
    return NextResponse.json(finalJourney);
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de la position:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
