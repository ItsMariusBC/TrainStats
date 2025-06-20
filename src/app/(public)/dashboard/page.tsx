// src/app/(public)/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useJourneyStatus } from '@/hooks/useJourneyStatus';
import { FamilyView } from '@/components/dashboard/family-view';
import { JourneyDetailView } from '@/components/journey/journey-detail-view'; // Create this component
import type { Journey } from '@/types/journey';

const DashboardPage: React.FC = () => {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const journeyId = searchParams.get('journeyId');
  const view = searchParams.get('view'); // For upcoming or completed views

  const isAdmin = session?.user?.role === "ADMIN";
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [currentJourney, setCurrentJourney] = useState<Journey | null>(null);
  const [upcomingJourneys, setUpcomingJourneys] = useState<Journey[]>([]);
  const [completedJourneys, setCompletedJourneys] = useState<Journey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalJourneys, setTotalJourneys] = useState(0);
  
  // Utiliser le hook de vérification des statuts
  useJourneyStatus();

  const fetchJourneys = async () => {
    try {
      const response = await fetch('/api/journeys');
      const data = await response.json();
      
      const ongoing = data.find((j: Journey) => j.status === 'ONGOING');
      const upcoming = data.filter((j: Journey) => j.status === 'SCHEDULED')
        .sort((a: Journey, b: Journey) => 
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
      const completed = data.filter((j: Journey) => j.status === 'COMPLETED')
        .sort((a: Journey, b: Journey) => 
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        ).slice(0, 5);

      setCurrentJourney(ongoing || null);
      setUpcomingJourneys(upcoming);
      setCompletedJourneys(completed);
      setTotalJourneys(data.length);
      
      // If journeyId is provided, find and set the selected journey
      if (journeyId) {
        const journey = data.find((j: Journey) => j.id === journeyId);
        setSelectedJourney(journey || null);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des trajets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJourneys();
    
    const refreshInterval = setInterval(() => {
      fetchJourneys();
    }, 60000);
    
    return () => clearInterval(refreshInterval);
  }, [journeyId]); // Re-fetch when journeyId changes

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement des données...</span>
      </div>
    );
  }

  // Show journey details if a specific journey is selected
  if (selectedJourney) {
    return (
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        <JourneyDetailView journey={selectedJourney} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
      <FamilyView
        currentJourney={currentJourney}
        upcomingJourneys={upcomingJourneys}
        completedJourneys={completedJourneys}
        isLoading={isLoading}
      />
    </div>
  );
};

export default DashboardPage;