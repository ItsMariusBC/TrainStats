// src/types/prisma.d.ts
import { Prisma, Journey, User, Stop, PrismaClient } from "@prisma/client";

// Extension des types Prisma pour inclure nos relations et champs personnalisés
declare global {
  namespace PrismaJson {
    // Créez des types pour les champs JSON si vous en avez
  }
}

// Type pour les includes du modèle Journey
export type JourneyIncludeType = {
  stops?: boolean | Prisma.StopArgs;
  createdBy?: boolean | Prisma.UserArgs;
  followers?: boolean | Prisma.UserArgs;
};

// Type pour Journey avec relations
export type JourneyWithRelations = Journey & {
  stops?: (Stop & {
    actualTime?: Date | null;
    notes?: string | null;
    id: string;
    name: string;
    time: Date;
    order: number;
    passed: boolean;
  })[];
  createdBy?: User;
  followers?: User[];
  createdById: string; // Champ important pour l'accès au créateur
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  title: string;
  currentStop: number;
  startDate: Date;
  endDate?: Date | null;
};

// Type pour Stop avec les champs supplémentaires
export type StopWithExtras = Stop & {
  actualTime?: Date | null;
  notes?: string | null;
  passed: boolean;
  name: string;
  time: Date;
  order: number;
  id: string;
};

// Extension du client Prisma pour faciliter l'utilisation des types personnalisés
export interface ExtendedPrismaClient extends PrismaClient {
  journey: Prisma.JourneyDelegate<
    Prisma.RejectOnNotFound | Prisma.RejectPerOperation,
    never,
    Prisma.DefaultArgs
  >;
}

// Ajout des types d'entrée pour les mises à jour
declare module "@prisma/client" {
  interface JourneyUpdateInput {
    notes?: string | null;
    isPublic?: boolean;
    trainNumber?: string | null;
  }
  
  interface StopUpdateInput {
    actualTime?: Date | null;
    notes?: string | null;
    passed?: boolean;
  }
  
  interface Journey {
    notes?: string | null;
    isPublic?: boolean;
    trainNumber?: string | null;
    followers?: User[];
    createdById: string;
    status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
    title: string;
    currentStop: number;
    startDate: Date;
    endDate?: Date | null;
  }
  
  interface Stop {
    actualTime?: Date | null;
    notes?: string | null;
    passed: boolean;
    name: string;
    time: Date;
    id: string;
    order: number;
    journeyId: string;
  }
}
