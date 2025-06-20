import { Journey } from '@/types/journey';

/**
 * Formate une date au format français
 */
export function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', { 
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

/**
 * Formate une heure au format HH:MM
 */
export function formatTime(dateString: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', { 
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
}

/**
 * Calcule et formate la durée totale d'un trajet
 */
export function calculateDuration(journey: Journey): string {
  if (!journey || !journey.stops || journey.stops.length <= 1) {
    return 'N/A';
  }
  
  const firstStop = journey.stops[0]?.time;
  const lastStop = journey.stops[journey.stops.length - 1]?.time;
  
  if (!firstStop || !lastStop) return 'N/A';
  
  const startTime = new Date(firstStop).getTime();
  const endTime = new Date(lastStop).getTime();
  
  // Calculer la durée en minutes
  const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));
  
  if (durationMinutes < 60) {
    return `${durationMinutes} min`;
  }
  
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  
  return minutes > 0 ? 
    `${hours}h${minutes < 10 ? '0' + minutes : minutes}` : 
    `${hours}h`;
}

/**
 * Calcule le temps estimé avant le prochain arrêt
 */
export function getTimeUntilNextStop(journey: Journey): string {
  if (!journey || !journey.stops || journey.stops.length === 0) {
    return 'Inconnu';
  }

  const currentStopIndex = journey.currentStop;
  if (currentStopIndex >= journey.stops.length - 1) {
    return 'Arrivé';
  }

  const nextStop = journey.stops.find(s => s.order === currentStopIndex + 1);
  if (!nextStop) return 'Inconnu';

  const nextStopTime = new Date(nextStop.time).getTime();
  const now = Date.now();
  const diffMinutes = Math.max(0, Math.floor((nextStopTime - now) / (1000 * 60)));

  if (diffMinutes < 1) return 'Imminent';
  if (diffMinutes < 60) return `${diffMinutes} min`;
  return `${Math.floor(diffMinutes / 60)}h${diffMinutes % 60 > 0 ? diffMinutes % 60 : ''}`;
}

/**
 * Calcule le pourcentage de progression d'un trajet
 */
export function calculateProgress(journey: Journey): number {
  if (!journey || !journey.stops || journey.stops.length <= 1) return 0;
  
  const totalStops = journey.stops.length - 1; // Nombre d'intervalles
  const currentPosition = journey.currentStop;
  
  // Calcul basique basé sur la position de l'arrêt actuel
  let baseProgress = (currentPosition / totalStops) * 100;
  
  // Si nous sommes entre deux arrêts, calculer la progression temporelle
  if (currentPosition < totalStops) {
    try {
      const currentStop = journey.stops.find(s => s.order === currentPosition);
      const nextStop = journey.stops.find(s => s.order === currentPosition + 1);
      
      if (currentStop && nextStop) {
        const currentTime = new Date().getTime();
        const departureTime = new Date(currentStop.time).getTime();
        const arrivalTime = new Date(nextStop.time).getTime();
        
        // Calculer la progression entre les deux arrêts
        if (currentTime > departureTime && arrivalTime > departureTime) {
          const segmentProgress = (currentTime - departureTime) / (arrivalTime - departureTime);
          const segmentSize = 1 / totalStops;
          
          // Ajuster la progression de base avec la progression du segment
          baseProgress = ((currentPosition / totalStops) + (segmentProgress * segmentSize)) * 100;
        }
      }
    } catch (e) {
      console.error("Erreur lors du calcul de la progression détaillée:", e);
      // En cas d'erreur, on garde la progression de base
    }
  }
  
  return Math.min(100, Math.max(0, baseProgress)); // S'assurer que la progression est entre 0 et 100
}
