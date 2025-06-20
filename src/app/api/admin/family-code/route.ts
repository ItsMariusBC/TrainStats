// src/app/api/admin/family-code/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";
import { Role } from "@prisma/client";

// Helper pour vérifier si l'utilisateur est admin
const isAdmin = (session: any): boolean => {
  return session?.user?.role === "ADMIN";
};

// Générer un nouveau code famille (plus court et mémorisable)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  try {
    // Générer un code court et facile à mémoriser (6 caractères)
    const familyCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    
    // Date d'expiration par défaut: jamais (pour une famille)
    // On utilise une date très lointaine
    const expiresAt = new Date("2099-12-31");

    // Chercher s'il y a déjà un code famille actif
    const existingFamilyInvitation = await prisma.invitation.findFirst({
      where: {
        isFamilyCode: true as any, // Cast pour contourner les erreurs de type
        usesLeft: { gt: 0 },
        expiresAt: { gt: new Date() }
      }
    });

    // Si un code existe déjà, on le retourne simplement
    if (existingFamilyInvitation) {
      return NextResponse.json({
        familyCode: existingFamilyInvitation.token,
        expiresAt: existingFamilyInvitation.expiresAt,
        usesLeft: existingFamilyInvitation.usesLeft,
        message: "Un code famille existe déjà"
      });
    }

    // Vérifier que la session est valide
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Session non valide" }, { status: 401 });
    }

    // Sinon, on crée un nouveau code famille
    const invitation = await prisma.invitation.create({
      data: {
        token: familyCode,
        role: Role.USER as any, // Cast pour contourner les erreurs de type
        expiresAt,
        isFamilyCode: true as any, // Cast pour contourner les erreurs de type
        usesLeft: 100, // Nombre important d'utilisations possible
        maxUses: 100,
        createdById: session.user.id,
      },
    });

    return NextResponse.json({
      familyCode: invitation.token,
      expiresAt: invitation.expiresAt,
      usesLeft: invitation.usesLeft,
      message: "Nouveau code famille créé avec succès"
    });
  } catch (error) {
    console.error("Erreur création code famille:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du code famille" },
      { status: 500 }
    );
  }
}

// Obtenir le code famille actuel
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  try {
    const familyInvitation = await prisma.invitation.findFirst({
      where: {
        isFamilyCode: true as any, // Cast pour contourner les erreurs de type
        usesLeft: { gt: 0 },
        expiresAt: { gt: new Date() }
      }
    });

    if (!familyInvitation) {
      return NextResponse.json({ 
        message: "Aucun code famille actif" 
      });
    }

    return NextResponse.json({
      familyCode: familyInvitation.token,
      expiresAt: familyInvitation.expiresAt,
      usesLeft: familyInvitation.usesLeft,
      createdAt: familyInvitation.createdAt
    });
  } catch (error) {
    console.error("Erreur récupération code famille:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du code famille" },
      { status: 500 }
    );
  }
}

// Réinitialiser le code famille
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  try {
    // Désactiver tous les codes famille existants
    await prisma.invitation.updateMany({
      where: {
        isFamilyCode: true as any, // Cast pour contourner les erreurs de type
      },
      data: {
        usesLeft: 0
      }
    });

    return NextResponse.json({
      message: "Code famille réinitialisé avec succès"
    });
  } catch (error) {
    console.error("Erreur réinitialisation code famille:", error);
    return NextResponse.json(
      { error: "Erreur lors de la réinitialisation du code famille" },
      { status: 500 }
    );
  }
}
