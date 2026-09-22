import React from "react";
import { useApp } from "../context/AppContext";
import { ArrowLeft } from "lucide-react";

export const TermsPage: React.FC = () => {
  const { setActivePage } = useApp();

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <button
        onClick={() => setActivePage("settings")}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-rose-600 dark:text-rose-400"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Settings
      </button>

      <div className="bg-white dark:bg-[#1A1523] rounded-xl border border-gray-100 dark:border-rose-900/30 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-rose-100">Terms of Service</h1>
          <p className="text-xs text-gray-500 dark:text-rose-300 mt-1">Last updated: September 2026</p>
        </div>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-gray-900 dark:text-rose-100">1. What BloomNest is</h2>
          <p className="text-sm text-gray-600 dark:text-rose-300 leading-relaxed">
            BloomNest is a maternal wellness tracking and information tool covering preconception, pregnancy, and
            postpartum care. It is designed to help you log vitals, symptoms, and milestones, and to surface
            general educational guidance.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-gray-900 dark:text-rose-100">2. Not a substitute for medical care</h2>
          <p className="text-sm text-gray-600 dark:text-rose-300 leading-relaxed">
            Nothing in this app is a diagnosis or a treatment plan. Always consult your doctor, midwife, or other
            qualified clinician for medical decisions. In an emergency, contact local emergency services directly.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-gray-900 dark:text-rose-100">3. Your account</h2>
          <p className="text-sm text-gray-600 dark:text-rose-300 leading-relaxed">
            You are responsible for the accuracy of the information you enter and for keeping your login
            credentials confidential. You may delete your account and data at any time from Settings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-gray-900 dark:text-rose-100">4. Acceptable use</h2>
          <p className="text-sm text-gray-600 dark:text-rose-300 leading-relaxed">
            Use BloomNest only for its intended purpose of tracking your own (or your dependent's) maternal and
            infant health information. Do not attempt to access other users' data or disrupt the service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-gray-900 dark:text-rose-100">5. Changes to these terms</h2>
          <p className="text-sm text-gray-600 dark:text-rose-300 leading-relaxed">
            We may update these terms as the product evolves. Continued use of BloomNest after an update means you
            accept the revised terms.
          </p>
        </section>
      </div>
    </div>
  );
};
