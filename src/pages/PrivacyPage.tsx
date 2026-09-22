import React from "react";
import { useApp } from "../context/AppContext";
import { ArrowLeft } from "lucide-react";

export const PrivacyPage: React.FC = () => {
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
          <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-rose-100">Privacy Policy</h1>
          <p className="text-xs text-gray-500 dark:text-rose-300 mt-1">Last updated: September 2026</p>
        </div>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-gray-900 dark:text-rose-100">1. What we collect</h2>
          <p className="text-sm text-gray-600 dark:text-rose-300 leading-relaxed">
            We store the health, wellness, and account information you enter directly, such as your name, email,
            due date, vitals, symptoms, and journal entries. We do not collect this data from any other source.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-gray-900 dark:text-rose-100">2. How we use it</h2>
          <p className="text-sm text-gray-600 dark:text-rose-300 leading-relaxed">
            Your data is used only to power the features you use inside BloomNest, such as your dashboard, timeline,
            and AI assistant. We do not sell your data or share it with advertisers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-gray-900 dark:text-rose-100">3. Where it's stored</h2>
          <p className="text-sm text-gray-600 dark:text-rose-300 leading-relaxed">
            Account data is stored in our database, secured behind authentication. Passwords are hashed and never
            stored in plain text.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-gray-900 dark:text-rose-100">4. Your controls</h2>
          <p className="text-sm text-gray-600 dark:text-rose-300 leading-relaxed">
            You can review, edit, or delete your data at any time from Settings. Deleting your account removes your
            stored health data from our systems.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-gray-900 dark:text-rose-100">5. Contact</h2>
          <p className="text-sm text-gray-600 dark:text-rose-300 leading-relaxed">
            Questions about this policy can be directed through the in-app support options in Settings.
          </p>
        </section>
      </div>
    </div>
  );
};
