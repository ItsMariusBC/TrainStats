// src/app/api/admin/journeys/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { io } from "@/lib/socket";

// Mettre à jour un trajet
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  try {
    const { id } = params;
    const data = await req.json();

    const journey = await prisma.journey.findUnique({
      where: { id },
      include: { stops: true }
    });

    if (!journey) {
      return NextResponse.json({ error: "Trajet non trouvé" }, { status: 404 });
    }

    if (data.nextStop !== undefined) {
      const currentStop = journey.stops[journey.currentStop];
      await prisma.stop.update({
        where: { id: currentStop.id },
        data: { passed: true }
      });

      const updatedJourney = await prisma.journey.update({
        where: { id },
        data: {
          currentStop: journey.currentStop + 1,
          status: journey.currentStop + 1 >= journey.stops.length ? "COMPLETED" : "ONGOING",
          endDate: journey.currentStop + 1 >= journey.stops.length ? new Date() : null
        },
        include: { stops: true }
      });

      io.emit('journey:updated', updatedJourney);
      return NextResponse.json(updatedJourney);
    }

    const updatedJourney = await prisma.journey.update({
      where: { id },
      data,
      include: { stops: true }
    });

    io.emit('journey:updated', updatedJourney);
    return NextResponse.json(updatedJourney);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

// Supprimer un trajet
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  try {
    const { id } = params;

    await prisma.journey.delete({
      where: { id }
    });

    io.emit('journey:deleted', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}