// src/app/api/register/[token]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(
  req: Request,
  { params }: { params: { token: string } }
) {
  const { token } = params;

  try {
    // Récupérer et vérifier l'invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token }
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation introuvable" },
        { status: 404 }
      );
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invitation expirée" },
        { status: 400 }
      );
    }

    if (invitation.usesLeft <= 0) {
      return NextResponse.json(
        { error: "Invitation déjà utilisée" },
        { status: 400 }
      );
    }

    // Récupérer les données du formulaire
    const { name, email, password } = await req.json();

    // Vérifier si l'invitation est restreinte à un email
    if (invitation.email && invitation.email !== email) {
      return NextResponse.json(
        { error: "Cette invitation est réservée à une autre adresse email" },
        { status: 400 }
      );
    }

    // Vérifier si l'email est déjà utilisé
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
        createdByInvitation: {
          connect: { id: invitation.id }
        }
      }
    });

    // Mettre à jour l'invitation
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        usesLeft: invitation.usesLeft - 1
      }
    });

    return NextResponse.json({
      message: "Compte créé avec succès",
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Erreur création compte:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du compte" },
      { status: 500 }
    );
  }
}