// src/app/api/journeys/[id]/follow/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { io } from "@/lib/socket";

/**
 * POST /api/journeys/[id]/follow
 * Permet à un utilisateur de suivre un trajet spécifique
 * Ajoute l'utilisateur à la liste des followers
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  
  try {
    const { id } = params;
    
    const journey = await prisma.journey.findUnique({
      where: { id },
      include: {
        followers: {
          where: {
            id: session.user.id
          }
        }
      }
    });
    
    if (!journey) {
      return NextResponse.json({ error: "Trajet non trouvé" }, { status: 404 });
    }
    
    // Vérifier si l'utilisateur n'est pas déjà un follower
    if (journey.followers.length > 0) {
      return NextResponse.json({ 
        message: "Vous suivez déjà ce trajet",
        already: true
      });
    }
    
    // Vérifier si le trajet est public ou si l'utilisateur est admin
    if (!journey.isPublic && session.user.role !== 'ADMIN' && journey.userId !== session.user.id) {
      return NextResponse.json({ error: "Ce trajet n'est pas public" }, { status: 403 });
    }
    
    // Ajouter l'utilisateur aux followers
    await prisma.journey.update({
      where: { id },
      data: {
        followers: {
          connect: { id: session.user.id }
        }
      }
    });
    
    // Notifier les clients
    io.emit('journey:follower:added', { 
      journeyId: id, 
      userId: session.user.id,
      userName: session.user.name
    });
    
    return NextResponse.json({ 
      success: true,
      message: "Vous suivez maintenant ce trajet"
    });
  } catch (error) {
    console.error("Erreur lors du suivi du trajet:", error);
    return NextResponse.json(
      { error: "Erreur lors du suivi du trajet" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/journeys/[id]/follow
 * Permet à un utilisateur d'arrêter de suivre un trajet
 * Retire l'utilisateur de la liste des followers
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  
  try {
    const { id } = params;
    
    const journey = await prisma.journey.findUnique({
      where: { id },
      include: {
        followers: {
          where: {
            id: session.user.id
          }
        }
      }
    });
    
    if (!journey) {
      return NextResponse.json({ error: "Trajet non trouvé" }, { status: 404 });
    }
    
    // Vérifier si l'utilisateur est bien un follower
    if (journey.followers.length === 0) {
      return NextResponse.json({ 
        message: "Vous ne suivez pas ce trajet",
        already: true
      });
    }
    
    // Retirer l'utilisateur des followers
    await prisma.journey.update({
      where: { id },
      data: {
        followers: {
          disconnect: { id: session.user.id }
        }
      }
    });
    
    // Notifier les clients
    io.emit('journey:follower:removed', { 
      journeyId: id, 
      userId: session.user.id
    });
    
    return NextResponse.json({ 
      success: true,
      message: "Vous ne suivez plus ce trajet"
    });
  } catch (error) {
    console.error("Erreur lors de l'arrêt du suivi du trajet:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'arrêt du suivi du trajet" },
      { status: 500 }
    );
  }
}