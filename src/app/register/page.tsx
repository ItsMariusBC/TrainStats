// src/app/register/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

type InvitationStatus = {
  isValid: boolean;
  email?: string | null;
  expiresAt?: string;
  usesLeft?: number;
  error?: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(true);
  const [invitation, setInvitation] = useState<InvitationStatus | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Vérifier l'invitation
  useEffect(() => {
    const checkInvitation = async () => {
      if (!token) {
        setInvitation({ isValid: false, error: "Token d'invitation manquant" });
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/register/check-invitation?token=${token}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.error);

        setInvitation({ isValid: true, ...data });
        if (data.email) {
          setFormData(prev => ({ ...prev, email: data.email }));
        }
      } catch (error) {
        setInvitation({ 
          isValid: false, 
          error: error instanceof Error ? error.message : "Erreur lors de la vérification"
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkInvitation();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/register/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      toast.success("Compte créé avec succès !");
      router.push('/login?registered=true');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-lighter via-white to-primary-lighter py-12 px-4">
      <div className="max-w-md mx-auto">
        <Link 
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Retour à l'accueil
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-gray-500">Vérification de l'invitation...</p>
            </div>
          ) : !invitation?.isValid ? (
            <div className="text-center py-8">
              <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Invitation invalide
              </h2>
              <p className="text-gray-600 mb-6">
                {invitation?.error || "Cette invitation n'est plus valide."}
              </p>
              <Link 
                href="/"
                className="text-primary hover:text-primary-dark font-medium"
              >
                Retourner à l'accueil
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Créer votre compte
                </h2>
                {invitation.email && (
                  <p className="text-sm text-gray-600 mt-2">
                    Invitation réservée pour {invitation.email}
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!!invitation.email}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors mt-6 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Créer mon compte
                </motion.button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}