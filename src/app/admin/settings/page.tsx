'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Bell, 
  Shield, 
  Mail, 
  Database, 
  Save,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlarmClock,
  Network
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface SettingOption {
  id: string;
  label: string;
  description: string;
  type: 'toggle' | 'select' | 'input' | 'button';
  defaultValue?: boolean | string | number;
  options?: { value: string; label: string }[];
  action?: () => Promise<void>;
  actionLabel?: string;
}

const AdminSettingsPage = () => {
  const [activeSection, setActiveSection] = useState('notifications');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    emailFrequency: 'immediate',
    delayThreshold: '15',
    autoUpdateStatus: true,
    privacyLevel: 'normal',
    dataDays: '30',
    requireAuth: true,
    refreshInterval: '60',
    debugMode: false
  });

  const handleSettingChange = (id: string, value: boolean | string | number) => {
    setSettings(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Paramètres enregistrés avec succès');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement des paramètres');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Données système rafraîchies avec succès');
    } catch (error) {
      toast.error('Erreur lors du rafraîchissement des données');
    } finally {
      setIsRefreshing(false);
    }
  };

  const sections: SettingSection[] = [
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Gérer les paramètres de notification pour les utilisateurs',
      icon: <Bell className="h-5 w-5" />
    },
    {
      id: 'security',
      title: 'Sécurité',
      description: 'Configuration des paramètres de sécurité du système',
      icon: <Shield className="h-5 w-5" />
    },
    {
      id: 'data',
      title: 'Données',
      description: 'Gestion de la rétention et du traitement des données',
      icon: <Database className="h-5 w-5" />
    },
    {
      id: 'system',
      title: 'Système',
      description: 'Configuration avancée du système TrainStats',
      icon: <Settings className="h-5 w-5" />
    }
  ];

  const settingOptions: Record<string, SettingOption[]> = {
    'notifications': [
      {
        id: 'emailNotifications',
        label: 'Notifications par e-mail',
        description: 'Activer l\'envoi de notifications par e-mail aux utilisateurs',
        type: 'toggle',
        defaultValue: true
      },
      {
        id: 'smsNotifications',
        label: 'Notifications par SMS',
        description: 'Activer l\'envoi de notifications par SMS (des frais peuvent s\'appliquer)',
        type: 'toggle',
        defaultValue: false
      },
      {
        id: 'emailFrequency',
        label: 'Fréquence des e-mails',
        description: 'Définir la fréquence d\'envoi des e-mails de notification',
        type: 'select',
        defaultValue: 'immediate',
        options: [
          { value: 'immediate', label: 'Immédiat' },
          { value: 'hourly', label: 'Toutes les heures' },
          { value: 'daily', label: 'Quotidien' }
        ]
      },
      {
        id: 'delayThreshold',
        label: 'Seuil de retard',
        description: 'Délai minimal (en minutes) avant d\'envoyer une notification de retard',
        type: 'input',
        defaultValue: '15'
      }
    ],
    'security': [
      {
        id: 'requireAuth',
        label: 'Authentification obligatoire',
        description: 'Exiger une authentification pour accéder aux trajets partagés',
        type: 'toggle',
        defaultValue: true
      },
      {
        id: 'privacyLevel',
        label: 'Niveau de confidentialité',
        description: 'Définir le niveau de détail des informations partagées',
        type: 'select',
        defaultValue: 'normal',
        options: [
          { value: 'high', label: 'Élevé (minimal)' },
          { value: 'normal', label: 'Normal' },
          { value: 'low', label: 'Bas (détaillé)' }
        ]
      }
    ],
    'data': [
      {
        id: 'dataDays',
        label: 'Conservation des données',
        description: 'Nombre de jours avant la suppression automatique des trajets terminés',
        type: 'input',
        defaultValue: '30'
      },
      {
        id: 'refreshData',
        label: 'Rafraîchir les données',
        description: 'Forcer un rafraîchissement et une optimisation des données',
        type: 'button',
        actionLabel: 'Rafraîchir',
        action: handleRefreshData
      }
    ],
    'system': [
      {
        id: 'autoUpdateStatus',
        label: 'Mise à jour automatique',
        description: 'Mettre à jour automatiquement le statut des trajets selon l\'horaire',
        type: 'toggle',
        defaultValue: true
      },
      {
        id: 'refreshInterval',
        label: 'Intervalle de rafraîchissement',
        description: 'Fréquence (en secondes) de vérification des mises à jour de trajet',
        type: 'input',
        defaultValue: '60'
      },
      {
        id: 'debugMode',
        label: 'Mode débogage',
        description: 'Activer les journaux détaillés pour le débogage (affecte les performances)',
        type: 'toggle',
        defaultValue: false
      }
    ]
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres du système</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar des sections */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="font-medium text-gray-700">Catégories</h2>
              </div>
              <div className="p-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      activeSection === section.id 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`${
                      activeSection === section.id 
                        ? 'text-primary' 
                        : 'text-gray-500'
                    }`}>
                      {section.icon}
                    </div>
                    <div>
                      <div className="font-medium">{section.title}</div>
                      <div className="text-xs text-gray-500">{section.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contenu principal */}
          <motion.div 
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {sections.find(s => s.id === activeSection)?.title}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      {sections.find(s => s.id === activeSection)?.description}
                    </p>
                  </div>
                  
                  {/* Icône spécifique à la section */}
                  <div className="bg-gray-100 p-3 rounded-lg">
                    {
                      activeSection === 'notifications' ? <Bell className="h-5 w-5 text-gray-700" /> :
                      activeSection === 'security' ? <Shield className="h-5 w-5 text-gray-700" /> :
                      activeSection === 'data' ? <Database className="h-5 w-5 text-gray-700" /> :
                      <Settings className="h-5 w-5 text-gray-700" />
                    }
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {settingOptions[activeSection]?.map((option) => (
                    <div 
                      key={option.id}
                      className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900">{option.label}</div>
                        
                        {option.type === 'toggle' && (
                          <div 
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings[option.id as keyof typeof settings] === true
                                ? 'bg-primary'
                                : 'bg-gray-200'
                            }`}
                            onClick={() => handleSettingChange(
                              option.id, 
                              !(settings[option.id as keyof typeof settings] as boolean)
                            )}
                          >
                            <span 
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                settings[option.id as keyof typeof settings] === true
                                  ? 'translate-x-6'
                                  : 'translate-x-1'
                              }`} 
                            />
                          </div>
                        )}
                        
                        {option.type === 'select' && (
                          <select
                            value={settings[option.id as keyof typeof settings] as string}
                            onChange={(e) => handleSettingChange(option.id, e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          >
                            {option.options?.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        )}
                        
                        {option.type === 'input' && (
                          <input
                            type="text"
                            value={settings[option.id as keyof typeof settings] as string}
                            onChange={(e) => handleSettingChange(option.id, e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-24 text-center"
                          />
                        )}
                        
                        {option.type === 'button' && (
                          <Button
                            onClick={option.action}
                            disabled={isRefreshing}
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            {isRefreshing ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Rafraîchissement...</span>
                              </>
                            ) : (
                              <>
                                <RefreshCw className="h-4 w-4" />
                                <span>{option.actionLabel}</span>
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-500">{option.description}</p>
                      
                      {/* Icônes spécifiques aux options */}
                      {option.id === 'emailFrequency' && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                          <Mail className="h-3 w-3" />
                          <span>Effectif pour tous les utilisateurs</span>
                        </div>
                      )}
                      
                      {option.id === 'refreshInterval' && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                          <AlarmClock className="h-3 w-3" />
                          <span>Valeur minimum recommandée: 30 secondes</span>
                        </div>
                      )}
                      
                      {option.id === 'dataDays' && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                          <Network className="h-3 w-3" />
                          <span>Espace actuellement utilisé: 256 Mo</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions du bas */}
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                <Button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  {showSuccess ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Enregistré</span>
                    </>
                  ) : isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Enregistrer les modifications</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSettingsPage;