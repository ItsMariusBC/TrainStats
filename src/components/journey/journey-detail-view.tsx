// src/components/journey/journey-detail-view.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Map } from 'lucide-react';
import { Journey } from '@/types/journey';
import { RealTimeJourneyTracker } from '@/components/journey/real-time-journey-tracker';
import { JourneyWithRelations } from '@/hooks/useJourneyUpdates';

type JourneyDetailViewProps = {
  journey: Journey;
};

export function JourneyDetailView({ journey }: JourneyDetailViewProps) {
  const router = useRouter();
  
  // Include the journey detail content from your current journey detail page
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Retour
        </Button>
        
        {/* Map button if you want to keep that functionality */}
        <Button asChild size="sm" variant="default">
          <a href={`/dashboard/map?journeyId=${journey.id}`} target="_blank" rel="noopener noreferrer">
            <Map className="h-4 w-4 mr-1" />
            Carte
          </a>
        </Button>
      </div>
      
      {/* Title and main info */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {journey.trainNumber ? `Trajet du train ${journey.trainNumber}` : "Détails du trajet"}
        </h1>
        
        {/* Journey details */}
        <div className="space-y-6">
          {/* Real-time journey tracker */}
          {journey.stops && journey.stops.length > 0 && (
            <RealTimeJourneyTracker initialJourney={journey as unknown as JourneyWithRelations} />
          )}
          
          {/* List of stops */}
          {/* Additional journey details can be added here */}
        </div>
      </div>
    </div>
  );
}