// src/hooks/useJourneyUpdates.ts
import { useEffect, useState, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { Journey, Stop } from '@prisma/client';

// Define User type based on schema.prisma
type User = {
  id: string;
  name?: string | null;
  email: string;
  role: 'ADMIN' | 'USER';
  password: string;
  createdAt: Date;
  updatedAt: Date;
  invitationId?: string | null;
};

// Types pour les événements Socket.IO
export type JourneyWithRelations = Journey & {
  id: string; // Explicitly add id property to match how it's used
  stops?: (Stop & {
    actualTime?: Date | null;
    notes?: string | null;
  })[];
  createdBy?: User;
  followers?: User[];
  trainNumber?: string | null;
  notes?: string | null;
  isPublic?: boolean;
  currentStop: number; // Add missing currentStop property needed in components
  status: 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'; // Add status property
  startDate: Date; // Add startDate property
};

export type FollowerUpdate = {
  journeyId: string;
  userId: string;
  user: User;
};

export type JourneyUpdateCallbacks = {
  onJourneyUpdate?: (journey: JourneyWithRelations) => void;
  onJourneyCreate?: (journey: JourneyWithRelations) => void;
  onJourneyDelete?: (id: string) => void;
  onFollowerAdd?: (data: FollowerUpdate) => void;
  onFollowerRemove?: (data: FollowerUpdate) => void;
  onError?: (error: Error) => void;
};

export const useJourneyUpdates = (callbacks: JourneyUpdateCallbacks) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      path: '/api/socketio',
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true
    });

    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);
    });

    // Écoute des événements spécifiques aux trajets
    if (callbacks.onJourneyUpdate) {
      socketInstance.on('journey:updated', callbacks.onJourneyUpdate);
    }

    if (callbacks.onJourneyCreate) {
      socketInstance.on('journey:created', callbacks.onJourneyCreate);
    }

    if (callbacks.onJourneyDelete) {
      socketInstance.on('journey:deleted', callbacks.onJourneyDelete);
    }

    if (callbacks.onFollowerAdd) {
      socketInstance.on('journey:follower:added', callbacks.onFollowerAdd);
    }

    if (callbacks.onFollowerRemove) {
      socketInstance.on('journey:follower:removed', callbacks.onFollowerRemove);
    }

    socketInstance.on('connect_error', (error) => {
      console.log('WebSocket connection error:', error);
      if (callbacks.onError) {
        callbacks.onError(new Error(`Connection error: ${error.message}`));
      }
    });

    setSocket(socketInstance);

    return socketInstance;
  }, [callbacks]);

  useEffect(() => {
    const socketInstance = connect();

    return () => {
      if (socketInstance) {
        console.log('Cleaning up socket connection');
        socketInstance.removeAllListeners();
        socketInstance.disconnect();
      }
    };
  }, [connect]);

  return { socket, isConnected };
};