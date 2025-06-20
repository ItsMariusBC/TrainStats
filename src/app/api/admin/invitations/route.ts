// src/app/api/admin/invitations/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";
import { Session } from "next-auth";

// Helper pour vérifier si l'utilisateur est admin
const isAdmin = (session: Session | null): boolean => {
  return session?.user?.role === "ADMIN";
};

// Créer une nouvelle invitation
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  // src/app/api/admin/invitations/route.ts
  try {
    const { email, role = "USER" } = await req.json();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Session non valide" }, { status: 401 });
    }

    // Vérifier que l'email n'a pas déjà une invitation active
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: "Une invitation existe déjà pour cet email" },
        { status: 400 }
      );
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = await prisma.invitation.create({
      data: {
        email,
        token,
        role: role as "ADMIN" | "USER",
        expiresAt,
        createdById: session.user.id,
      },
    });

    const inviteUrl = `${process.env.NEXTAUTH_URL}/register?token=${token}`;

    return NextResponse.json({
      invitation: {
        email: invitation.email,
        inviteUrl,
        expiresAt: invitation.expiresAt
      }
    });
  } catch (error) {
    console.error("Erreur création invitation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'invitation" },
      { status: 500 }
    );
  }
}

// Lister les invitations
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  try {
    const invitations = await prisma.invitation.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        used: true,
        expiresAt: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ invitations });
  } catch (error) {
    console.error("Erreur liste invitations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des invitations" },
      { status: 500 }
    );
  }
}