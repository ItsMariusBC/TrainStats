// src/app/admin/trajets/page.tsx
'use client';

import React from 'react';
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Train, Plus, Edit, Trash2, Clock, 
  MapPin, Loader2, AlertTriangle, CheckCircle, X 
} from "lucide-react";

type Stop = {
  id: string;
  name: string;
  order: number;
  time: string;
  passed: boolean;
};

type Journey = {
  id: string;
  title: string;
  startDate: string;
  endDate?: string | null;
  status: "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED";
  currentStop: number;
  stops: Stop[];
  createdAt: string;
};

const JourneysPage: React.FC = () => {
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingJourney, setEditingJourney] = useState<Journey | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'scheduled'>('all');

  const [newJourney, setNewJourney] = useState({
    title: '',
    startDate: '',
    stops: [{ name: '', time: '', order: 0 }]
  });

  const fetchJourneys = async () => {
    try {
      const response = await fetch('/api/admin/journeys');
      if (!response.ok) throw new Error('Erreur lors du chargement');
      const data = await response.json();
      setJourneys(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des trajets");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJourneys();
  }, []);

  const handleCreateJourney = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/journeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJourney),
      });

      if (!response.ok) throw new Error('Erreur lors de la création');

      await fetchJourneys();
      setIsCreating(false);
      toast.success("Trajet créé avec succès");
      setNewJourney({ title: '', startDate: '', stops: [{ name: '', time: '', order: 0 }] });
    } catch (error) {
      toast.error("Erreur lors de la création du trajet");
    } finally {
      setIsLoading(false);
    }
  };

  const addStop = () => {
    setNewJourney(prev => ({
      ...prev,
      stops: [...prev.stops, { name: '', time: '', order: prev.stops.length }]
    }));
  };

  const removeStop = (index: number) => {
    setNewJourney(prev => ({
      ...prev,
      stops: prev.stops.filter((_, i) => i !== index)
    }));
  };

  const updateStop = (index: number, key: 'name' | 'time', value: string) => {
    setNewJourney(prev => ({
      ...prev,
      stops: prev.stops.map((stop, i) => 
        i === index ? { ...stop, [key]: value } : stop
      )
    }));
  };

  const handleStatusChange = async (journeyId: string, newStatus: Journey['status']) => {
    try {
      const response = await fetch(`/api/admin/journeys/${journeyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour');

      await fetchJourneys();
      toast.success("Statut mis à jour");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/journeys/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');

      await fetchJourneys();
      setDeleteConfirm(null);
      toast.success("Trajet supprimé");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Train className="h-6 w-6 text-primary" />
            Trajets
          </h1>
          <motion.button
            onClick={() => setIsCreating(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-dark transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="h-5 w-5" />
            Nouveau trajet
          </motion.button>
        </div>

        {/* Filtres */}
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'Tous' },
            { key: 'scheduled', label: 'Planifiés' },
            { key: 'active', label: 'En cours' },
            { key: 'completed', label: 'Terminés' }
          ].map(({ key, label }) => (
            <motion.button
              key={key}
              onClick={() => setFilter(key as typeof filter)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === key
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {label}
            </motion.button>
          ))}
        </div>

        {/* Liste des trajets */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : journeys.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <Train className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Aucun trajet trouvé</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {journeys.map((journey) => (
              <motion.div
                key={journey.id}
                className="bg-white rounded-lg border p-6"
                layout
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="font-semibold text-lg">{journey.title}</h2>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        journey.status === 'ONGOING' ? 'bg-green-100 text-green-700' :
                        journey.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                        journey.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {journey.status}
                      </span>
                    </div>
                    <p className="text-gray-500 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Départ le {new Date(journey.startDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => setEditingJourney(journey)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Edit className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      onClick={() => setDeleteConfirm(journey.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Trash2 className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>

                {/* Liste des arrêts */}
                <div className="mt-4 space-y-2">
                  {journey.stops.map((stop, index) => (
                    <div
                      key={stop.id}
                      className={`flex items-center gap-4 p-2 rounded-lg ${
                        index === journey.currentStop ? 'bg-primary/10' :
                        index < journey.currentStop ? 'bg-gray-50' : ''
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${
                        stop.passed ? 'bg-green-500' :
                        index === journey.currentStop ? 'bg-primary animate-pulse' :
                        'bg-gray-300'
                      }`} />
                      <span className="font-medium">{stop.name}</span>
                      <span className="text-gray-500 text-sm">
                        {new Date(stop.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {index === journey.currentStop && journey.status === 'ONGOING' && (
                        <motion.button
                          onClick={() => handleStatusChange(journey.id, 'COMPLETED')}
                          className="ml-auto text-primary hover:bg-primary/10 p-1 rounded"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <CheckCircle className="h-5 w-5" />
                        </motion.button>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal de création */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-lg w-full max-w-lg p-6"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Nouveau trajet</h2>
                  <motion.button
                    onClick={() => setIsCreating(false)}
                    className="text-gray-500 hover:bg-gray-100 p-2 rounded-full"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>

                <form onSubmit={handleCreateJourney} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Titre du trajet
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Paris → Lyon"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={newJourney.title}
                      onChange={(e) => setNewJourney({ ...newJourney, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de départ
                    </label>
                    <input
                      type="datetime-local"
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={newJourney.startDate}
                      onChange={(e) => setNewJourney({ ...newJourney, startDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-700">Arrêts</label>
                      <motion.button
                        type="button"
                        onClick={addStop}
                        className="text-primary hover:bg-primary/10 p-2 rounded"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Plus className="h-5 w-5" />
                      </motion.button>
                    </div>
                    
                    {newJourney.stops.map((stop, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Nom de l'arrêt"
                            required
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            value={stop.name}
                            onChange={(e) => updateStop(index, 'name', e.target.value)}
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="time"
                            required
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            value={stop.time}
                            onChange={(e) => updateStop(index, 'time', e.target.value)}
                          />
                        </div>
                        {index > 0 && (
                          <motion.button
                            type="button"
                            onClick={() => removeStop(index)}
                            className="text-red-500 hover:bg-red-50 p-2 rounded"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <X className="h-5 w-5" />
                          </motion.button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <motion.button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Annuler
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 flex items-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <Plus className="h-5 w-5" />
                          Créer le trajet
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de confirmation de suppression */}
        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-lg p-6 max-w-md mx-4"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
              >
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-center mb-2">
                  Confirmer la suppression
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  Êtes-vous sûr de vouloir supprimer ce trajet ?
                  Cette action est irréversible.
                </p>
                <div className="flex justify-end gap-2">
                  <motion.button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Annuler
                  </motion.button>
                  <motion.button
                    onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Supprimer
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default JourneysPage;