
"use client";

import { useEffect, useState } from 'react';
import { JourneyWithRelations, useJourneyUpdates } from '@/hooks/useJourneyUpdates';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, Train, MapPin, Users } from 'lucide-react';

type RealTimeJourneyTrackerProps = {
  initialJourney: JourneyWithRelations;
};

export function RealTimeJourneyTracker({ initialJourney }: RealTimeJourneyTrackerProps) {
  const [journey, setJourney] = useState<JourneyWithRelations>(initialJourney);
  const [isRealTime, setIsRealTime] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeToNextStop, setTimeToNextStop] = useState<string | null>(null);

  const { isConnected } = useJourneyUpdates({
    onJourneyUpdate: (updatedJourney) => {
      if (updatedJourney.id === journey.id) {
        console.log('Mise à jour en temps réel reçue:', updatedJourney);
        setJourney(updatedJourney);
        setIsRealTime(true);
        setTimeout(() => setIsRealTime(false), 2000);
      }
    },
    onFollowerAdd: (data) => {
      if (data.journeyId === journey.id) {
        console.log('Nouveau follower:', data.user);
        setJourney(prev => ({
          ...prev,
          followers: [...(prev.followers || []), data.user]
        }));
      }
    },
    onFollowerRemove: (data) => {
      if (data.journeyId === journey.id) {
        console.log('Follower retiré:', data.user);
        setJourney(prev => ({
          ...prev,
          followers: (prev.followers || []).filter(f => f.id !== data.userId)
        }));
      }
    },
    onError: (error) => {
      console.error('Erreur Socket.IO:', error);
    }
  });

  useEffect(() => {
    if (!journey.stops || journey.stops.length < 2) return;
    
    const stops = journey.stops.sort((a, b) => a.order - b.order);
    const currentStop = journey.currentStop || 0;
    
    if (currentStop >= stops.length) {
      setProgress(100);
      return;
    }
    
    const totalDuration = new Date(stops[stops.length - 1].time).getTime() - new Date(stops[0].time).getTime();
    const elapsedDuration = Date.now() - new Date(stops[0].time).getTime();
    
    const timeBasedProgress = Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100));
    
    const stopsBasedProgress = (currentStop / (stops.length - 1)) * 100;
    
    setProgress(journey.status === 'COMPLETED' ? 100 : Math.max(timeBasedProgress, stopsBasedProgress));
    
    if (currentStop < stops.length - 1 && journey.status === 'ONGOING') {
      const nextStop = stops[currentStop + 1];
      const timeToNext = new Date(nextStop.time).getTime() - Date.now();
      
      if (timeToNext > 0) {
        setTimeToNextStop(formatDistanceToNow(new Date(nextStop.time), { 
          addSuffix: true,
          locale: fr
        }));
      } else {
        setTimeToNextStop('Arrivée imminente');
      }
    } else if (journey.status === 'COMPLETED') {
      setTimeToNextStop('Trajet terminé');
    } else {
      setTimeToNextStop(null);
    }
  }, [journey]);

  // Récupérer l'arrêt actuel et le prochain arrêt
  const sortedStops = journey.stops?.sort((a, b) => a.order - b.order) || [];
  const currentStopIndex = journey.currentStop || 0;
  const currentStopObj = sortedStops[currentStopIndex];
  const nextStopObj = sortedStops[currentStopIndex + 1];

  return (
    <Card className={`w-full transition-all duration-300 ${isRealTime ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Train className="h-5 w-5" />
              {journey.title}
              {journey.trainNumber && (
                <Badge variant="outline" className="ml-2">
                  {journey.trainNumber}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {new Date(journey.startDate).toLocaleDateString()} • {sortedStops.length} arrêts
            </CardDescription>
          </div>
          <Badge variant={
            journey.status === 'SCHEDULED' ? 'secondary' : 
            journey.status === 'ONGOING' ? 'default' : 
            journey.status === 'COMPLETED' ? 'success' : 'outline'
          }>
            {journey.status === 'SCHEDULED' ? 'Programmé' : 
             journey.status === 'ONGOING' ? 'En cours' : 
             journey.status === 'COMPLETED' ? 'Terminé' : 'Inconnu'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mt-2">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>{sortedStops[0]?.name || 'Départ'}</span>
            <span>{sortedStops[sortedStops.length - 1]?.name || 'Arrivée'}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="mt-6 space-y-4">
          {currentStopObj && (
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Position actuelle</p>
                <p className="text-sm text-muted-foreground">{currentStopObj.name}</p>
                {currentStopObj.actualTime && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Passage à {new Date(currentStopObj.actualTime).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {nextStopObj && journey.status !== 'COMPLETED' && (
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-full">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Prochain arrêt</p>
                <p className="text-sm text-muted-foreground">{nextStopObj.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Prévu à {new Date(nextStopObj.time).toLocaleTimeString()}
                  {timeToNextStop && ` (${timeToNextStop})`}
                </p>
              </div>
            </div>
          )}
          
          {journey.notes && (
            <div className="mt-4 p-3 bg-secondary/20 rounded-md text-sm">
              {journey.notes}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <div className="w-full flex justify-between items-center text-sm">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{(journey.followers?.length || 0) + 1} suivent ce trajet</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{isConnected ? 'Connecté' : 'Déconnecté'}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
