'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Train, Calendar, Clock, PlusCircle, Users, Settings, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Journey } from '@/types/journey';
import { Card } from '@/components/ui/card';

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

type AdminViewProps = {
  currentJourney: Journey | null;
  upcomingJourneys: Journey[];
  completedJourneys: Journey[];
  totalJourneys: number;
  isLoading: boolean;
};

export function AdminView({
  currentJourney,
  upcomingJourneys,
  completedJourneys,
  totalJourneys,
}: AdminViewProps) {
  return (
    <div className="space-y-6">
      {/* En-tête du dashboard */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold">Tableau de bord administrateur</h1>
        <div className="flex flex-wrap w-full sm:w-auto gap-2">
          <Button asChild className="flex-1 sm:flex-none">
            <Link href="/admin">
              <PlusCircle className="mr-2 h-4 w-4 sm:hidden" />
              Nouveau trajet
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 sm:flex-none">
            <Link href="/admin/invitations">
              <Users className="mr-2 h-4 w-4 sm:hidden" />
              Gérer les invitations
            </Link>
          </Button>
        </div>
      </div>

      {/* Section trajet en cours - avec options d'édition */}
      {currentJourney && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md border border-primary/20 overflow-hidden"
        >
          <div className="bg-primary/5 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Train className="h-5 w-5 text-primary" />
              <h2 className="font-medium text-gray-900">Trajet en cours</h2>
            </div>
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href={`/dashboard/map?journeyId=${currentJourney.id}`}>
                  Voir la carte
                </Link>
              </Button>
              <Button asChild size="sm" variant="default">
                <Link href={`/admin?journeyId=${currentJourney.id}`}>
                  Mettre à jour
                </Link>
              </Button>
            </div>
          </div>

          <div className="p-5">
            <h3 className="text-xl font-medium mb-1">{currentJourney.title}</h3>
            
            {currentJourney.trainNumber && (
              <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                <Train className="h-3.5 w-3.5" />
                <span>Train {currentJourney.trainNumber}</span>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Informations</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Statut:</span>
                    <span className="font-medium">
                      {currentJourney.status === 'ONGOING' ? 'En cours' : 
                       currentJourney.status === 'COMPLETED' ? 'Terminé' : 
                       currentJourney.status === 'SCHEDULED' ? 'Programmé' : 'Non défini'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span className="font-medium">{formatDate(currentJourney.startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Heure de départ:</span>
                    <span className="font-medium">{formatTime(currentJourney.startDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Durée:</span>
                    <span className="font-medium">{calculateDuration(currentJourney)}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-gray-50 col-span-1 md:col-span-2">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Progression</h4>
                <div className="mb-2 flex justify-between text-sm">
                  <span>
                    {currentJourney.stops && currentJourney.stops[currentJourney.currentStop]?.name}
                  </span>
                  <span className="text-primary font-medium">
                    {currentJourney.stops && 
                     `${currentJourney.currentStop + 1}/${currentJourney.stops.length} arrêts`}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full" 
                    style={{ 
                      width: `${currentJourney.stops && currentJourney.stops.length > 0 ? 
                        (currentJourney.currentStop / (currentJourney.stops.length - 1)) * 100 : 0}%` 
                    }}
                  />
                </div>
              </Card>
            </div>

            <div className="mt-4 flex justify-end">
              <Button asChild size="sm">
                <Link href={`/dashboard?journeyId=${currentJourney.id}`}>
                  Voir les détails complets
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Section trajets à venir */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span>Trajets à venir</span>
          </h2>
          <Button asChild size="sm" variant="outline">
            <Link href="/admin">
              <PlusCircle className="mr-1 h-4 w-4" />
              Nouveau
            </Link>
          </Button>
        </div>

        {upcomingJourneys.length === 0 ? (
          <Card className="p-5 text-center text-gray-500">
            <p>Aucun trajet à venir</p>
          </Card>
        ) : (
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
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/dashboard?journeyId=${journey.id}`}>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin?journeyId=${journey.id}`}>
                          <Settings className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
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
        )}
      </section>

      {/* Trajets récents */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <span>Trajets récents</span>
          </h2>
          <span className="text-sm text-gray-500">Total: {totalJourneys}</span>
        </div>

        {completedJourneys.length === 0 ? (
          <Card className="p-5 text-center text-gray-500">
            <p>Aucun trajet terminé</p>
          </Card>
        ) : (
          <Card>
            <div className="divide-y divide-gray-100">
              {completedJourneys.slice(0, 5).map(journey => (
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
        )}
      </section>
    </div>
  );
}
