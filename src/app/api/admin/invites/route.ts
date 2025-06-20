// src/app/api/admin/invites/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
 const session = await getServerSession(authOptions);

 if (!session || session.user.role !== "ADMIN") {
   return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
 }

 try {
   const { email, maxUses, expiresInDays } = await req.json();

   // Calculer la date d'expiration
   const expiresAt = new Date();
   expiresAt.setDate(expiresAt.getDate() + expiresInDays);

   // Créer l'invitation
   const invitation = await prisma.invitation.create({
     data: {
       token: crypto.randomBytes(6).toString('hex'),
       email: email || null,
       maxUses: maxUses,
       usesLeft: maxUses,
       expiresAt,
       createdBy: {
         connect: { id: session.user.id }
       }
     },
     include: {
       createdBy: {
         select: {
           id: true,
           email: true,
           name: true
         }
       },
       usedBy: {
         select: {
           id: true,
           email: true,
           createdAt: true
         }
       }
     }
   });

   return NextResponse.json(invitation);
 } catch (error) {
   console.error("Erreur création invitation:", error);
   return NextResponse.json(
     { error: "Erreur lors de la création de l'invitation" },
     { status: 500 }
   );
 }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  try {
    const invitations = await prisma.invitation.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        usedBy: {
          select: {
            id: true,
            email: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Pour débugger
    console.log("Invitations récupérées:", invitations);

    return NextResponse.json(invitations);
  } catch (error) {
    console.error("Erreur récupération invitations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des invitations" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
 const session = await getServerSession(authOptions);

 if (!session || session.user.role !== "ADMIN") {
   return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
 }

 try {
   const { id, email, maxUses, usesLeft, expiresInDays } = await req.json();

   // Vérifier que l'invitation existe
   const invitation = await prisma.invitation.findUnique({
     where: { id }
   });

   if (!invitation) {
     return NextResponse.json({ error: "Invitation non trouvée" }, { status: 404 });
   }

   // Préparer les données à mettre à jour
   const updateData: any = {};
   if (email !== undefined) updateData.email = email;
   if (maxUses !== undefined) updateData.maxUses = maxUses;
   if (usesLeft !== undefined) updateData.usesLeft = usesLeft;
   if (expiresInDays !== undefined) {
     const expiresAt = new Date();
     expiresAt.setDate(expiresAt.getDate() + expiresInDays);
     updateData.expiresAt = expiresAt;
   }

   // Mettre à jour l'invitation
   const updatedInvitation = await prisma.invitation.update({
     where: { id },
     data: updateData,
     include: {
       createdBy: {
         select: {
           id: true,
           email: true,
           name: true
         }
       },
       usedBy: {
         select: {
           id: true,
           email: true,
           createdAt: true
         }
       }
     }
   });

   return NextResponse.json(updatedInvitation);
 } catch (error) {
   console.error("Erreur modification invitation:", error);
   return NextResponse.json(
     { error: "Erreur lors de la modification de l'invitation" },
     { status: 500 }
   );
 }
}

export async function DELETE(req: Request) {
 const session = await getServerSession(authOptions);

 if (!session || session.user.role !== "ADMIN") {
   return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
 }

 try {
   const { searchParams } = new URL(req.url);
   const id = searchParams.get('id');

   if (!id) {
     return NextResponse.json({ error: "ID requis" }, { status: 400 });
   }

   // Vérifier que l'invitation existe
   const invitation = await prisma.invitation.findUnique({
     where: { id }
   });

   if (!invitation) {
     return NextResponse.json({ error: "Invitation non trouvée" }, { status: 404 });
   }

   // Vérifier si l'invitation a déjà été utilisée
   const usedInvitation = await prisma.invitation.findFirst({
     where: { 
       id,
       usedBy: {
         some: {}
       }
     }
   });

   if (usedInvitation) {
     return NextResponse.json(
       { error: "Impossible de supprimer une invitation déjà utilisée" },
       { status: 400 }
     );
   }

   // Supprimer l'invitation
   await prisma.invitation.delete({
     where: { id }
   });

   return NextResponse.json({ success: true });
 } catch (error) {
   console.error("Erreur suppression invitation:", error);
   return NextResponse.json(
     { error: "Erreur lors de la suppression de l'invitation" },
     { status: 500 }
   );
 }
}