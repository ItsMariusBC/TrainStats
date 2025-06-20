// src/app/admin/users/page.tsx
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, Shield, ShieldOff, Trash2, 
  Calendar, Link as LinkIcon, Loader2, 
  AlertTriangle, User
} from "lucide-react";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "USER";
  createdAt: string;
  createdByInvitation?: {
    token: string;
    createdBy: {
      email: string;
      name: string | null;
    };
  } | null;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleToggle = async (user: User) => {
    try {
      const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, role: newRole }),
      });

      if (!response.ok) throw new Error();

      await fetchUsers();
      toast.success(`${user.name || user.email} est maintenant ${newRole === "ADMIN" ? "administrateur" : "utilisateur"}`);
    } catch (error) {
      toast.error("Erreur lors du changement de rôle");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      await fetchUsers();
      setDeleteConfirm(null);
      toast.success("Utilisateur supprimé");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de la suppression");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Utilisateurs
          </h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {users.map((user) => (
              <motion.div
                key={user.id}
                layout
                className="bg-white rounded-lg border p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold">
                        {user.name || "Sans nom"}
                      </h2>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.role === "ADMIN" 
                          ? "bg-primary/10 text-primary" 
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {user.role}
                      </span>
                    </div>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Inscrit le {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={() => handleRoleToggle(user)}
                      className={`p-2 rounded-lg transition-colors ${
                        user.role === "ADMIN"
                          ? "text-primary hover:bg-primary/10"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {user.role === "ADMIN" ? (
                        <ShieldOff className="h-5 w-5" />
                      ) : (
                        <Shield className="h-5 w-5" />
                      )}
                    </motion.button>
                    <motion.button
                      onClick={() => setDeleteConfirm(user.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Trash2 className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>

                {user.createdByInvitation && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      Invité par {user.createdByInvitation.createdBy.name || user.createdByInvitation.createdBy.email}
                    </p>
                  </div>
                )}

                {/* Modal de confirmation de suppression */}
                <AnimatePresence>
                  {deleteConfirm === user.id && (
                    <motion.div
                      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
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
                          Êtes-vous sûr de vouloir supprimer le compte de {user.name || user.email} ?
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
                            onClick={() => handleDelete(user.id)}
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
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}