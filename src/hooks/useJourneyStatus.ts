// src/hooks/useJourneyStatus.ts
import { useEffect } from 'react';

const checkJourneyStatus = async () => {
  try {
    const response = await fetch('/api/journeys/check-status', {
      method: 'POST'
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  } catch (error) {
    console.error('Erreur lors de la vérification des statuts:', error);
  }
};

export const useJourneyStatus = () => {
  useEffect(() => {
    // Vérifier le statut toutes les minutes
    const interval = setInterval(checkJourneyStatus, 60000);
    // Vérifier immédiatement au chargement
    checkJourneyStatus();

    return () => clearInterval(interval);
  }, []);
};