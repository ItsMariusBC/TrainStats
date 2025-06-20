"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Users, Clock, Link as LinkIcon, Copy, 
  CheckCircle, Search, AlertTriangle, Loader2, 
  Trash2, Edit, X, RefreshCcw 
} from "lucide-react";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  }
};

// Types
type Invitation = {
  id: string;
  token: string;
  email: string | null;
  usesLeft: number;
  maxUses: number;
  expiresAt: string;
  createdAt: string;
  createdBy: {
    email: string;
    name: string | null;
  };
  usedBy: {
    id: string;
    email: string;
    createdAt: string;
  }[];
};

export default function InvitesPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "expired">("all");
  const [formData, setFormData] = useState({
    maxUses: 1,
    expiresInDays: 7,
    email: "",
  });

  const fetchInvitations = async () => {
    try {
      const response = await fetch('/api/admin/invites');
      if (!response.ok) throw new Error('Erreur de chargement');
      const data = await response.json();
      setInvitations(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des invitations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Erreur de création');
      await fetchInvitations();
      setIsCreating(false);
      toast.success("Invitation créée avec succès");
    } catch (error) {
      toast.error("Erreur lors de la création");
    }
  };

  const handleDeleteInvite = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/invites?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erreur de suppression');
      
      await fetchInvitations();
      toast.success("Invitation supprimée");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/register?token=${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Lien copié !");
  };

  const filteredInvitations = invitations.filter(invite => {
    const matchesSearch = !searchTerm || 
      invite.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invite.token.toLowerCase().includes(searchTerm.toLowerCase());

    const now = new Date();
    const expiresAt = new Date(invite.expiresAt);
    const isExpired = expiresAt < now;

    switch (filter) {
      case "active":
        return matchesSearch && !isExpired && invite.usesLeft > 0;
      case "expired":
        return matchesSearch && (isExpired || invite.usesLeft === 0);
      default:
        return matchesSearch;
    }
  });

  return (
    <motion.div 
      className="max-w-7xl mx-auto px-4 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* En-tête */}
      <div className="flex justify-between items-center mb-8">
        <motion.h1 
          className="text-2xl font-bold text-gray-900"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          Invitations
        </motion.h1>
        <motion.button
          onClick={() => setIsCreating(true)}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="h-5 w-5" />
          <span>Nouvelle invitation</span>
        </motion.button>
      </div>

      {/* Filtres */}
      <motion.div 
        className="mb-6 space-y-4"
        variants={itemVariants}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="flex gap-2">
          {[
            { key: "all", label: "Toutes" },
            { key: "active", label: "Actives" },
            { key: "expired", label: "Expirées" }
          ].map(({ key, label }) => (
            <motion.button
              key={key}
              onClick={() => setFilter(key as typeof filter)}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === key 
                  ? "bg-primary text-white" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Liste des invitations */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            className="flex justify-center items-center h-64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </motion.div>
        ) : filteredInvitations.length === 0 ? (
          <motion.div 
            className="text-center py-12 bg-white rounded-lg border"
            variants={itemVariants}
          >
            <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Aucune invitation trouvée</p>
          </motion.div>
        ) : (
          <motion.div 
            className="grid gap-4"
            variants={containerVariants}
          >
            {filteredInvitations.map((invite) => (
              <motion.div
                key={invite.id}
                variants={itemVariants}
                layout
                className="bg-white rounded-lg border p-6 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <LinkIcon className="h-5 w-5 text-primary" />
                      </div>
                      <code className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                        {invite.token}
                      </code>
                    </div>
                    {invite.email && (
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary/50" />
                        {invite.email}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 self-end sm:self-auto">
                    <motion.button
                      onClick={() => copyInviteLink(invite.token)}
                      className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Copy className="h-5 w-5" />
                      <span className="text-sm hidden sm:block">Copier</span>
                    </motion.button>
                    <motion.button
                      onClick={() => handleDeleteInvite(invite.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Trash2 className="h-5 w-5" />
                      <span className="text-sm hidden sm:block">Supprimer</span>
                    </motion.button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary/70" />
                    <div>
                      <p className="text-sm font-medium">Utilisations</p>
                      <p className="text-sm text-gray-500">{invite.usesLeft}/{invite.maxUses} restantes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary/70" />
                    <div>
                      <p className="text-sm font-medium">Expiration</p>
                      <p className="text-sm text-gray-500">{new Date(invite.expiresAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {invite.usedBy.length > 0 && (
                  <motion.div 
                    className="mt-4 pt-4 border-t"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <h3 className="font-medium mb-3 text-gray-700">Utilisateurs</h3>
                    <div className="space-y-2">
                      {invite.usedBy.map((user) => (
                        <motion.div 
                          key={user.id} 
                          className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded-lg"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="font-medium">{user.email}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de création */}
      <AnimatePresence>
        {isCreating && (
          <motion.div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-lg w-full max-w-md p-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Nouvelle invitation</h2>
                <motion.button
                  onClick={() => setIsCreating(false)}
                  className="text-gray-500 hover:bg-gray-100 p-2 rounded-full"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              <form onSubmit={handleCreateInvite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email (optionnel)
                  </label>
                  <input
                    type="email"
                    placeholder="email@exemple.com"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre d'utilisations
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expire dans (jours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={formData.expiresInDays}
                    onChange={(e) => setFormData({ ...formData, expiresInDays: parseInt(e.target.value) })}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <motion.button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Annuler
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="h-4 w-4" />
                    Créer
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}