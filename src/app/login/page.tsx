// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Train, ArrowRight, Loader2, Mail, Lock, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistered = searchParams.get('registered') === 'true';
  
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Identifiants invalides");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header avec retour */}
      <header className="pt-4 px-4 sm:px-6">
        <Link 
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="text-sm">Retour</span>
        </Link>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 flex flex-col justify-center p-4 sm:p-6">
        <motion.div 
          className="w-full max-w-md mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Logo et titre */}
          <motion.div 
            className="text-center mb-8"
            variants={itemVariants}
          >
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
              <Train className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bienvenue sur TrainStats</h1>
            <p className="text-gray-600 mt-2">Connectez-vous pour accéder à vos trajets</p>
          </motion.div>

          {/* Message de succès après inscription */}
          {isRegistered && (
            <motion.div 
              className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-lg flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm">Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.</p>
            </motion.div>
          )}

          {/* Message d'erreur */}
          {error && (
            <motion.div 
              className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-r-lg flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}

          {/* Formulaire de connexion */}
          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-6"
            variants={itemVariants}
          >
            <motion.div variants={itemVariants}>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <div className={`relative group ${focusedField === 'email' ? 'ring-2 ring-primary/20 rounded-xl' : ''}`}>
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${
                  focusedField === 'email' ? 'text-primary' : 'text-gray-400'
                }`} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-all group-hover:border-primary/50"
                  placeholder="vous@exemple.com"
                  required
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-2">
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-gray-700"
                >
                  Mot de passe
                </label>
                <button
                  type="button"
                  className="text-xs text-primary hover:text-primary-dark"
                >
                  Mot de passe oublié?
                </button>
              </div>
              <div className={`relative group ${focusedField === 'password' ? 'ring-2 ring-primary/20 rounded-xl' : ''}`}>
                <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${
                  focusedField === 'password' ? 'text-primary' : 'text-gray-400'
                }`} />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-all group-hover:border-primary/50"
                  placeholder="••••••••"
                  required
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl font-medium shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.form>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center">
        <p className="text-gray-500 text-xs">
          © {new Date().getFullYear()} TrainStats. Tous droits réservés.
        </p>
      </footer>
    </div>
  );
}