// src/app/api/journeys/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { io } from "@/lib/socket";
import { revalidatePath } from "next/cache";
import { Prisma, Journey, Stop, User, Status } from "@prisma/client";

// Types pour les objets avec relations incluses
type JourneyWithRelations = Journey & {
  stops: (Stop & {
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
  })[];
  createdBy: Pick<User, 'id' | 'name' | 'email'>;
  followers: Pick<User, 'id' | 'name'>[];
  // Additional fields from the JourneyWithDetails type
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  title: string;
  startDate: Date;
  endDate: Date | null;
  currentStop: number;
  createdById: string;
  userId: string; // Field that stores the creator's ID
};

/**
 * GET /api/journeys/[id]
 * Récupère les détails d'un trajet spécifique
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  
  try {
    const { id } = params;
    
    const journey = await prisma.journey.findUnique({
      where: { id },
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
            name: true
          }
        }
      }
    }) as unknown as JourneyWithRelations;
    
    if (!journey) {
      return NextResponse.json({ error: "Trajet non trouvé" }, { status: 404 });
    }
    
    // Vérifier les droits d'accès
    const isAdmin = session.user.role === 'ADMIN';
    const isOwner = journey.userId === session.user.id;
    const isPublic = journey.isPublic;
    
    if (!isAdmin && !isOwner && !(journey as any).isPublic) {
      return NextResponse.json({ error: "Accès non autorisé à ce trajet" }, { status: 403 });
    }
    
    // Ajouter aux abonnés si l'utilisateur n'est pas déjà abonné
    if (!isOwner) {
      const followers = journey.followers || [];
      const isFollowing = followers.some((f: { id: string }) => f.id === session.user.id);
      
      if (!isFollowing) {
        await prisma.journey.update({
          where: { id },
          data: {
            followers: {
              connect: { id: session.user.id }
            }
          }
        });
      }
    }
    
    // Ajouter des métriques pour le trajet
    const stops = (journey as JourneyWithRelations).stops || [];
    const totalStops = stops.length;
    let totalDistance = 0;
    
    // Calculer la distance totale (fictive ici, mais pourrait être basée sur des coordonnées réelles)
    if (totalStops > 1) {
      for (let i = 0; i < totalStops - 1; i++) {
        totalDistance += Math.floor(Math.random() * 50) + 20; // Distance fictive
      }
    }
    
    // Calculer la durée totale
    const firstStop = stops[0];
    const lastStop = stops[totalStops - 1];
    const durationMs = new Date(lastStop.time).getTime() - new Date(firstStop.time).getTime();
    const durationMinutes = Math.floor(durationMs / 60000);
    
    // Calcul de la progression actuelle (en pourcentage)
    let progressPercent = 0;
    
    if (journey.status === 'ONGOING') {
      const now = new Date();
      const journeyStartTime = new Date(firstStop.time).getTime();
      const journeyEndTime = new Date(lastStop.time).getTime();
      const currentTime = now.getTime();
      
      if (currentTime >= journeyEndTime) {
        progressPercent = 100;
      } else if (currentTime <= journeyStartTime) {
        progressPercent = 0;
      } else {
        // Progression basée sur le temps
        const totalDuration = journeyEndTime - journeyStartTime;
        const elapsedDuration = currentTime - journeyStartTime;
        progressPercent = Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100));
        
        // Ajuster la progression en fonction des arrêts passés
        const passedStops = stops.filter((s: Stop) => s.passed).length;
        const progressByStops = totalStops > 1 ? (passedStops / (totalStops - 1)) * 100 : 0;
        
        // Combiner les deux progressions (temps et arrêts)
        progressPercent = (progressPercent + progressByStops) / 2;
      }
    } else if (journey.status === 'COMPLETED') {
      progressPercent = 100;
    }
    
    // Ajouter des statistiques en temps réel
    const response = {
      ...journey,
      distanceKm: totalDistance,
      durationMinutes,
      progress: progressPercent,
      currentStopData: null,
      previousStop: null,
      nextStop: null,
      stops: stops,
      followers: journey.followers || [],
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("Erreur lors de la récupération du trajet:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du trajet" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/journeys/[id]
 * Met à jour un trajet existant
 * Admin only
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: "Seuls les administrateurs peuvent modifier les trajets" }, { status: 403 });
  }
  
  try {
    const { id } = params;
    const data = await req.json();
    
    const { 
      title, 
      status, 
      isPublic, 
      notes, 
      trainNumber, 
      currentStop,
      stopUpdates,
      updateStatus,
      addStop,
      removeStopId
    } = data;
    
    const journey = await prisma.journey.findUnique({
      where: { id },
      include: { stops: true }
    }) as unknown as JourneyWithRelations;
    
    if (!journey) {
      return NextResponse.json({ error: "Trajet non trouvé" }, { status: 404 });
    }
    
    // Mettre à jour le trajet
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (status !== undefined) updateData.status = status;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (notes !== undefined) updateData.notes = notes;
    if (trainNumber !== undefined) updateData.trainNumber = trainNumber;
    if (currentStop !== undefined) updateData.currentStop = currentStop;
    
    // Si le statut passe à COMPLETED, définir la date de fin
    if (status === 'COMPLETED' && journey.status !== 'COMPLETED') {
      updateData.endDate = new Date();
    }
    
    // Si le statut passe à ONGOING et qu'il ne l'était pas déjà, définir le currentStop à 0
    if (status === 'ONGOING' && journey.status !== 'ONGOING') {
      updateData.currentStop = 0;
    }
    
    // Mettre à jour les arrêts si nécessaire
    if (stopUpdates && Array.isArray(stopUpdates)) {
      // Traiter chaque mise à jour d'arrêt
      for (const update of stopUpdates) {
        if (update.id && update.passed !== undefined) {
          await prisma.stop.update({
            where: { id: update.id },
            data: { 
              passed: update.passed,
              actualTime: update.passed ? new Date() : null,
              notes: update.notes !== undefined ? update.notes : undefined
            }
          });
        }
      }
    }
    
    // Mise à jour auto du statut des arrêts en fonction du currentStop
    if (updateStatus && currentStop !== undefined) {
      // Marquer tous les arrêts jusqu'à currentStop comme passés
      await prisma.stop.updateMany({
        where: { 
          journeyId: id,
          order: { lte: currentStop }
        },
        data: { 
          passed: true,
          actualTime: new Date()
        }
      });
      
      // Marquer tous les arrêts après currentStop comme non passés
      await prisma.stop.updateMany({
        where: { 
          journeyId: id,
          order: { gt: currentStop }
        },
        data: { 
          passed: false,
          actualTime: null
        }
      });
    }
    
    // Ajouter un nouvel arrêt
    if (addStop) {
      const stops = (journey as JourneyWithRelations).stops || [];
      const maxOrder = stops.length > 0 ? Math.max(...stops.map((s: Stop) => s.order)) : 0;
      
      await prisma.stop.create({
        data: {
          name: addStop.name,
          time: new Date(addStop.time),
          order: addStop.order !== undefined ? addStop.order : maxOrder + 1,
          passed: false,
          notes: (addStop.notes || null) as string | null,
          journeyId: id
        }
      });
      
      // Réorganiser les ordres des arrêts si nécessaire
      if (addStop.order !== undefined) {
        const stopsToUpdate = (journey.stops || []).filter(s => s.order >= addStop.order);
        
        for (const stop of stopsToUpdate) {
          await prisma.stop.update({
            where: { id: stop.id },
            data: { order: stop.order + 1 }
          });
        }
      }
    }
    
    // Supprimer un arrêt
    if (removeStopId) {
      const stops = (journey as JourneyWithRelations).stops || [];
      const stopToRemove = stops.find((s: Stop) => s.id === removeStopId);
      
      if (stopToRemove) {
        await prisma.stop.delete({
          where: { id: removeStopId }
        });
        
        // Réorganiser les ordres des arrêts
        const stopsToUpdate = stops.filter((s: Stop) => s.order > stopToRemove.order);
        
        for (const stop of stopsToUpdate) {
          await prisma.stop.update({
            where: { id: stop.id },
            data: { order: stop.order - 1 }
          });
        }
      }
    }
    
    // Mettre à jour le trajet principal
    const updatedJourney = await prisma.journey.update({
      where: { id },
      data: updateData,
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
    }) as unknown as JourneyWithRelations;
    
    // Notifier les clients de la mise à jour
    io.emit('journey:updated', updatedJourney);
    
    // Revalider les chemins
    revalidatePath(`/journeys/${id}`);
    revalidatePath('/dashboard');
    revalidatePath('/journeys');
    revalidatePath('/admin/trajets');
    
    return NextResponse.json(updatedJourney);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du trajet:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du trajet" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/journeys/[id]
 * Supprime un trajet
 * Admin only
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: "Seuls les administrateurs peuvent supprimer des trajets" }, { status: 403 });
  }
  
  try {
    const { id } = params;
    
    const journey = await prisma.journey.findUnique({
      where: { id }
    });
    
    if (!journey) {
      return NextResponse.json({ error: "Trajet non trouvé" }, { status: 404 });
    }
    
    // Supprimer le trajet (Prisma supprimera automatiquement les arrêts grâce aux relations)
    await prisma.journey.delete({
      where: { id }
    });
    
    // Notifier les clients de la suppression
    io.emit('journey:deleted', id);
    
    // Revalider les chemins
    revalidatePath('/dashboard');
    revalidatePath('/journeys');
    revalidatePath('/admin/trajets');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression du trajet:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du trajet" },
      { status: 500 }
    );
  }
}