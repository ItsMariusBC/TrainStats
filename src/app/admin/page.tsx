// src/app/admin/page.tsx
"use client";

import { motion } from "framer-motion";
import {
  Users,
  Train,
  Mail,
  PlusCircle,
  ChevronRight,
  TrendingUp,
  UserPlus,
  Bell,
  Calendar
} from "lucide-react";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function AdminDashboard() {
  // Ces données viendront de votre API plus tard
  const stats = {
    activeJourneys: 3,
    totalUsers: 42,
    pendingInvites: 5,
    weeklyJourneys: 12
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard Admin</h1>
        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
          <PlusCircle className="h-5 w-5" />
          <span>Nouveau trajet</span>
        </button>
      </div>

      {/* Cartes de statistiques */}
      <motion.div 
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <Train className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Trajets actifs</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeJourneys}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Utilisateurs</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-amber-50 p-3 rounded-lg">
              <Mail className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Invitations en attente</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingInvites}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Trajets cette semaine</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.weeklyJourneys}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sections principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trajets récents */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl shadow-sm border border-gray-100"
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Trajets en cours
              </h2>
              <Link href="/admin/journeys" className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1">
                Voir tout
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {[
              { from: "Paris", to: "Lyon", time: "En cours", status: "active" },
              { from: "Marseille", to: "Nice", time: "Départ dans 1h", status: "upcoming" },
            ].map((journey, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${journey.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                  <div>
                    <p className="font-medium text-gray-900">{journey.from} → {journey.to}</p>
                    <p className="text-sm text-gray-500">{journey.time}</p>
                  </div>
                </div>
                <button className="text-sm text-primary hover:text-primary-dark">
                  Gérer
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Actions rapides */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl shadow-sm border border-gray-100"
        >
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Actions rapides
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <Link 
              href="/admin/journeys/new"
              className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Train className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Créer un trajet</p>
                  <p className="text-sm text-gray-500">Ajouter un nouveau trajet</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>

            <Link 
              href="/admin/invites/new"
              className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <UserPlus className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Inviter un utilisateur</p>
                  <p className="text-sm text-gray-500">Envoyer une nouvelle invitation</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}