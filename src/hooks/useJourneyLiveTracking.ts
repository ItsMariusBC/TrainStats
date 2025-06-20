// src/hooks/useJourneyLiveTracking.ts
import { useEffect, useState } from 'react';
import { useJourneyUpdates, JourneyWithRelations } from './useJourneyUpdates';
import { Journey, Stop } from '@prisma/client';

// Réutiliser la définition du type ExtendedStop de journey-map.tsx
export interface ExtendedStop extends Omit<Stop, 'passed'> {
  latitude: number;
  longitude: number;
  notes?: string | null;
  actualTime?: Date | null;
  passed?: boolean;
  name: string;
  id: string;
}

// Utiliser un type similaire à celui de journey-map.tsx mais sans l'héritage Journey
// pour éviter les problèmes de compatibilité
export interface ExtendedJourney {
  id: string;
  currentStop: number;
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  stops?: ExtendedStop[];
  trainNumber?: string | null;
  notes?: string | null;
  createdById?: string;
  createdBy?: { id: string; name: string | null };
  followers?: { id: string; name: string | null }[];
}

interface UseJourneyLiveTrackingResult {
  journey: ExtendedJourney;
  isConnected: boolean;
  error: Error | null;
}

/**
 * Hook pour suivre un trajet en temps réel
 * @param journeyId ID du trajet à suivre
 * @param initialJourney État initial du trajet
 */
export function useJourneyLiveTracking(
  journeyId: string,
  initialJourney: ExtendedJourney
): UseJourneyLiveTrackingResult {
  const [journey, setJourney] = useState<ExtendedJourney>(initialJourney);
  const [error, setError] = useState<Error | null>(null);

  // Utiliser le hook de base pour les mises à jour Socket.IO
  const { isConnected } = useJourneyUpdates({
    onJourneyUpdate: (updatedJourney: any) => {
      // Ne mettre à jour que si c'est le même trajet
      if (updatedJourney.id === journeyId) {
        console.log('Mise à jour du trajet reçue via WebSocket:', updatedJourney);
        
        // Fusionner les données existantes avec les nouvelles données
        setJourney(prev => {
          const updatedStops = updatedJourney.stops?.map((stop: any) => {
            // Trouver l'arrêt correspondant dans les données précédentes pour conserver les coordonnées géographiques
            const prevStop = prev.stops?.find(s => s.id === stop.id);
            
            return {
              id: stop.id,
              name: stop.name,
              latitude: stop.latitude || prevStop?.latitude || 0,
              longitude: stop.longitude || prevStop?.longitude || 0,
              notes: stop.notes,
              actualTime: stop.actualTime,
              passed: stop.passed
            } as ExtendedStop;
          });

          return {
            ...prev,
            status: updatedJourney.status,
            currentStop: updatedJourney.currentStop !== undefined ? updatedJourney.currentStop : prev.currentStop,
            trainNumber: updatedJourney.trainNumber,
            notes: updatedJourney.notes,
            stops: updatedStops || prev.stops,
            followers: updatedJourney.followers,
            createdBy: updatedJourney.createdBy
          };
        });
      }
    },
    onError: (err) => {
      console.error('Erreur de connexion WebSocket:', err);
      setError(err);
    }
  });

  return { journey, isConnected, error };
}
