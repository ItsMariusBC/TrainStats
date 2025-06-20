// src/app/api/journeys/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { io } from "@/lib/socket";
import { revalidatePath } from "next/cache";

/**
 * GET /api/journeys
 * Récupère tous les trajets accessibles à l'utilisateur actuel
 * Includes: stops, user (creator)
 * Filters: status, startDate, search
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const startDateFrom = searchParams.get('startDateFrom');
    const includeCompleted = searchParams.get('includeCompleted') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // Construire la requête avec les filtres
    const where: any = {};
    
    // Filtre par statut
    if (status) {
      where.status = status;
    } else if (!includeCompleted) {
      where.status = {
        in: ['SCHEDULED', 'ONGOING']
      };
    }
    
    // Filtre par date de début
    if (startDateFrom) {
      where.startDate = {
        gte: new Date(startDateFrom)
      };
    }
    
    // Filtre par recherche de titre
    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive'
      };
    }
    
    // Requête différente selon le rôle de l'utilisateur
    const isAdmin = session.user.role === 'ADMIN';
    if (!isAdmin) {
      // Les utilisateurs non-admin ne peuvent voir que les trajets publics ou créés par eux
      where.OR = [
        { userId: session.user.id },
        { isPublic: true }
      ];
    }
    
    const journeys = await prisma.journey.findMany({
      where,
      include: {
        stops: {
          orderBy: {
            order: 'asc'
          }
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
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // ONGOING d'abord, puis SCHEDULED, etc.
        { startDate: 'asc' }
      ],
      take: limit
    });
    
    // Ajouter des métriques pour chaque trajet
    const journeysWithMetrics = journeys.map(journey => {
      const totalStops = journey.stops.length;
      let totalDistance = 0;
      
      // Calculer la distance totale (fictive ici, mais pourrait être basée sur des coordonnées réelles)
      for (let i = 0; i < totalStops - 1; i++) {
        totalDistance += Math.floor(Math.random() * 50) + 20; // Distance fictive entre 20 et 70 km entre les arrêts
      }
      
      // Calculer la durée totale
      const firstStop = journey.stops[0];
      const lastStop = journey.stops[totalStops - 1];
      const durationMs = new Date(lastStop.time).getTime() - new Date(firstStop.time).getTime();
      const durationMinutes = Math.floor(durationMs / 60000);
      
      return {
        ...journey,
        metrics: {
          totalDistance,
          durationMinutes,
          followersCount: journey.followers.length
        }
      };
    });
    
    return NextResponse.json(journeysWithMetrics);
  } catch (error) {
    console.error("Erreur lors de la récupération des trajets:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des trajets" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/journeys
 * Crée un nouveau trajet
 * Admin only
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: "Seuls les administrateurs peuvent créer des trajets" }, { status: 403 });
  }

  try {
    const data = await req.json();
    const { title, startDate, stops, isPublic = true, notes, trainNumber } = data;
    
    if (!title || !startDate || !stops || !Array.isArray(stops) || stops.length < 2) {
      return NextResponse.json(
        { error: "Données invalides. Le trajet doit avoir un titre, une date de début et au moins 2 arrêts." },
        { status: 400 }
      );
    }
    
    // Créer le trajet avec ses arrêts
    const journey = await prisma.journey.create({
      data: {
        title,
        startDate: new Date(startDate),
        status: "SCHEDULED",
        isPublic,
        notes,
        trainNumber,
        userId: session.user.id,
        stops: {
          create: stops.map((stop: any, index: number) => ({
            name: stop.name,
            time: new Date(stop.time),
            order: index,
            passed: false,
            notes: stop.notes || null
          }))
        }
      },
      include: {
        stops: {
          orderBy: {
            order: 'asc'
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    // Notify clients about the new journey
    io.emit('journey:created', journey);
    
    // Revalidate the journey pages
    revalidatePath('/dashboard');
    revalidatePath('/journeys');
    revalidatePath('/admin/trajets');
    
    return NextResponse.json(journey);
  } catch (error) {
    console.error("Erreur lors de la création du trajet:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du trajet" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/journeys
 * Met à jour les paramètres globaux des trajets
 * Admin only
 */
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: "Seuls les administrateurs peuvent modifier les paramètres globaux" }, { status: 403 });
  }

  try {
    const data = await req.json();
    const { autoUpdateEnabled, checkIntervalSeconds } = data;
    
    // Mise à jour des paramètres système (simulé pour l'instant)
    // Dans un système réel, vous stockeriez ces paramètres dans une table de configuration
    const settings = {
      autoUpdateEnabled: autoUpdateEnabled !== undefined ? autoUpdateEnabled : true,
      checkIntervalSeconds: checkIntervalSeconds || 60
    };
    
    return NextResponse.json({
      settings,
      updated: true,
      message: "Paramètres globaux mis à jour avec succès"
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des paramètres:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des paramètres" },
      { status: 500 }
    );
  }
}