'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Journey } from '@/types/journey';

export default function JourneyMapPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const journeyId = searchParams?.get('journeyId');
  const [journey, setJourney] = useState<Journey | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Fetch journey data
  useEffect(() => {
    const fetchJourney = async () => {
      if (!journeyId) {
        router.push('/dashboard');
        return;
      }
      
      try {
        setIsLoading(true);
        const res = await fetch(`/api/journeys/${journeyId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch journey');
        }
        const data = await res.json();
        setJourney(data);
      } catch (error) {
        console.error('Error fetching journey:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchJourney();
  }, [journeyId, router]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Chargement de la carte...</p>
        </div>
      </div>
    );
  }
  
  if (!journey) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Trajet introuvable</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center space-x-2 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard?journeyId=${journeyId}`)}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Retour aux détails
        </Button>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">
        {journey.title} - Vue Carte
      </h1>
      
      {/* Map component would be integrated here */}
      <div className="w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Carte du trajet en cours de chargement...</p>
        {/* Include your map component here with stops and current location */}
        {/* Example: <JourneyMap journey={journey} /> */}
      </div>
    </div>
  );
}
