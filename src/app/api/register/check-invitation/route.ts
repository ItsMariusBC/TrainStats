// src/app/api/register/check-invitation/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  if (!token) {
    return NextResponse.json(
      { error: "Code d'invitation manquant" },
      { status: 400 }
    );
  }

  try {
    const invitation = await prisma.invitation.findUnique({
      where: { token }
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Code d'invitation introuvable" },
        { status: 404 }
      );
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Code d'invitation expiré" },
        { status: 400 }
      );
    }

    if (invitation.usesLeft <= 0) {
      return NextResponse.json(
        { error: "Ce code d'invitation a atteint sa limite d'utilisation" },
        { status: 400 }
      );
    }

    // Vérifier si c'est un code famille ou une invitation spécifique
    if (invitation.isFamilyCode) {
      // Pour le code famille, on ne vérifie pas l'email
      return NextResponse.json({
        isFamilyCode: true,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        usesLeft: invitation.usesLeft
      });
    } else {
      // Pour les invitations spécifiques, vérifier que l'email correspond
      if (invitation.email && email && invitation.email !== email) {
        return NextResponse.json(
          { error: "Cette invitation est réservée à un autre email" },
          { status: 400 }
        );
      }

      return NextResponse.json({
        isFamilyCode: false,
        email: invitation.email,
        role: invitation.role,
        expiresAt: invitation.expiresAt,
        usesLeft: invitation.usesLeft
      });
    }
  } catch (error) {
    console.error("Erreur vérification invitation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification" },
      { status: 500 }
    );
  }
}