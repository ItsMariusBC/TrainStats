// src/app/page.tsx
"use client";

import Link from "next/link";
import AuthCheck from "@/components/auth-check";
import { Train, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <>
      <AuthCheck />
      <div className="min-h-screen bg-white flex flex-col">
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md text-center mb-12"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="bg-primary/10 p-3 rounded-xl">
                <Train className="h-8 w-8 text-primary" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Votre voyage en train, <span className="text-primary">partagé</span>
            </h1>
            
            <p className="text-gray-600">
              Une application simple et intuitive qui permet à vos proches 
              de suivre votre trajet en train en temps réel.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-md"
          >
            <Button 
              className="w-full bg-primary hover:bg-primary-dark text-white py-6 rounded-xl text-lg shadow-sm" 
              asChild
            >
              <Link href="/login" className="flex items-center justify-center">
                Connexion
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </main>

        <footer className="py-6 px-4 text-center">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} TrainStats. Tous droits réservés.
          </p>
        </footer>
      </div>
    </>
  );
}