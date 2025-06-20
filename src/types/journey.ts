import { Status } from '@prisma/client';

export type Stop = {
  id: string;
  name: string;
  time: string;
  passed: boolean;
  order: number;
  lat?: number | null;
  lng?: number | null;
};

export type Journey = {
  id: string;
  title: string;
  trainNumber?: string | null;
  startDate: string;
  endDate?: string | null;
  status: Status | string;
  currentStop: number;
  stops: Stop[];
  isPublic?: boolean;
  notes?: string | null;
  userId?: string | null;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
};

export type ExtendedJourney = Journey & {
  createdAt?: string;
  updatedAt?: string;
  currentLat?: number | null;
  currentLng?: number | null;
};
