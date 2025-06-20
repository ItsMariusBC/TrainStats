'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Train,
  Clock,
  Calendar,
  MapPin,
  ChevronRight,
  Timer,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Journey } from '@/types/journey';
import { Card } from '@/components/ui/card';
// Importation locale des fonctions de formatage en attendant la création du fichier d'utilitaires

// Format pour afficher la date
function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', { 
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

// Format pour afficher l'heure
function formatTime(dateString: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', { 
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
}

// Calculer la durée estimée d'un trajet
function calculateDuration(journey: Journey): string {
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

type FamilyViewProps = {
  currentJourney: Journey | null;
  upcomingJourneys: Journey[];
  completedJourneys: Journey[];
  isLoading: boolean;
};

export function FamilyView({
  currentJourney,
  upcomingJourneys,
  completedJourneys,
  isLoading,
}: FamilyViewProps) {
  // Calculer le temps estimé avant le prochain arrêt
  const getTimeUntilNextStop = (journey: Journey): string => {
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
  };

  return (
    <div className="space-y-6">
      {/* En-tête simple */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord</h1>
        {/* Aucun bouton d'action admin ici */}
      </div>

      {/* Section trajet en cours - plus grande et plus visible */}
      {currentJourney && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md border border-primary/20 overflow-hidden"
        >
          <div className="bg-primary/10 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Train className="h-5 w-5 text-primary" />
              <h2 className="font-medium text-gray-900">Trajet en cours</h2>
            </div>
            <Button asChild size="sm" variant="default">
              <Link href={`/dashboard?journeyId=${currentJourney.id}`}>
                Détails du trajet
              </Link>
            </Button>
          </div>

          <div className="p-5">
            <h3 className="text-xl font-medium mb-1">{currentJourney.title}</h3>
            
            {currentJourney.trainNumber && (
              <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                <Train className="h-3.5 w-3.5" />
                <span>Train {currentJourney.trainNumber}</span>
              </div>
            )}
            
            {/* Cartes info - position et prochaine étape */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {/* Carte position actuelle */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full mt-1">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Position actuelle</p>
                    <p className="font-medium">
                      {currentJourney.stops && currentJourney.stops.length > 0 && currentJourney.currentStop < currentJourney.stops.length
                        ? currentJourney.stops[currentJourney.currentStop]?.name || "Position inconnue"
                        : "Position inconnue"}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Carte prochain arrêt */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full mt-1">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Prochain arrêt</p>
                    <p className="font-medium">
                      {currentJourney.stops && currentJourney.stops.length > 0 && currentJourney.currentStop < currentJourney.stops.length - 1
                        ? currentJourney.stops[currentJourney.currentStop + 1]?.name || "Dernier arrêt"
                        : "Arrivée finale"}
                    </p>
                    {currentJourney.stops && currentJourney.stops.length > 0 && currentJourney.currentStop < currentJourney.stops.length - 1 && (
                      <p className="text-xs text-primary mt-1">
                        {getTimeUntilNextStop(currentJourney)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Statut et informations adicationelles */}
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center mt-2">
              <div className="flex items-center gap-2 sm:w-1/3">
                <AlertCircle className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm text-gray-500">Statut</div>
                  <div className="font-medium">
                    {currentJourney.status === 'ONGOING' ? 'En cours' :
                     currentJourney.status === 'SCHEDULED' ? 'Programmé' :
                     currentJourney.status === 'COMPLETED' ? 'Terminé' : 'Non défini'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:w-1/3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm text-gray-500">Progression</div>
                  <div className="font-medium">
                    {currentJourney.stops && currentJourney.stops.length > 0 
                      ? `${currentJourney.currentStop + 1} / ${currentJourney.stops.length} arrêts`
                      : 'Non définie'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:w-1/3">
                <Timer className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-sm text-gray-500">Durée totale</div>
                  <div className="font-medium">{calculateDuration(currentJourney)}</div>
                </div>
              </div>
            </div>

            {/* Notes du trajet si présentes */}
            {currentJourney.notes && (
              <div className="mt-5 p-3 bg-gray-50 rounded-md">
                <p className="text-sm">{currentJourney.notes}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Message si aucun trajet en cours */}
      {!currentJourney && !isLoading && (
        <Card className="p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun trajet en cours</h3>
          <p className="text-gray-500">
            Il n'y a pas de trajet actif en ce moment.
            {upcomingJourneys.length > 0 ? 
              ' Consultez les trajets à venir ci-dessous.' : 
              ' Aucun trajet n\'est prévu pour le moment.'}
          </p>
        </Card>
      )}

      {/* Section trajets à venir - simplifiée */}
      {upcomingJourneys.length > 0 && (
        <section>
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span>Trajets à venir</span>
          </h2>

          <Card>
            <div className="divide-y divide-gray-100">
              {upcomingJourneys.slice(0, 5).map(journey => (
                <div key={journey.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{journey.title}</h3>
                        {journey.trainNumber && (
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                            Train {journey.trainNumber}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatDate(journey.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{formatTime(journey.startDate)}</span>
                        </div>
                      </div>
                    </div>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/dashboard?journeyId=${journey.id}`}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {upcomingJourneys.length > 5 && (
              <div className="p-3 text-center border-t border-gray-100">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/dashboard?view=upcoming">
                    Voir tous ({upcomingJourneys.length})
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </Card>
        </section>
      )}

      {/* Section trajets récents - simplifiée */}
      {completedJourneys.length > 0 && (
        <section className="mt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <span>Trajets récents</span>
          </h2>

          <Card>
            <div className="divide-y divide-gray-100">
              {completedJourneys.slice(0, 3).map(journey => (
                <div key={journey.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{journey.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(journey.startDate)} • {calculateDuration(journey)}
                      </p>
                    </div>
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/dashboard?journeyId=${journey.id}`}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}
