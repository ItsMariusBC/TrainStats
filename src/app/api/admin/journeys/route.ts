// src/app/api/admin/journeys/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { io } from "@/lib/socket";

// Récupérer tous les trajets
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  try {
    const journeys = await prisma.journey.findMany({
      include: {
        stops: {
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    });

    return NextResponse.json(journeys);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération des trajets" },
      { status: 500 }
    );
  }
}

// Créer un nouveau trajet
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  try {
    const { title, startDate, stops } = await req.json();

    if (!session.user.id) {
      return NextResponse.json({ error: "Session invalide" }, { status: 401 });
    }

    const journey = await prisma.journey.create({
      data: {
        title,
        startDate: new Date(startDate),
        status: "SCHEDULED",
        userId: session.user.id,
        stops: {
          create: stops.map((stop: any, index: number) => ({
            name: stop.name,
            time: new Date(`${startDate.split('T')[0]}T${stop.time}`),
            order: index,
            passed: false
          }))
        }
      },
      include: {
        stops: true
      }
    });

    io.emit('journey:created', journey);

    return NextResponse.json(journey);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la création du trajet" },
      { status: 500 }
    );
  }
}