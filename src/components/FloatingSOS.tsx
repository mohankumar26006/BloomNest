import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { PhoneCall, AlertTriangle, X, Shield, Hospital, User, Ambulance } from "lucide-react";

export const FloatingSOS: React.FC = () => {
  const { emergencyContacts, user, setActivePage } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const primaryDoctor = emergencyContacts.find((c) => c.relation.includes("Doctor")) || emergencyContacts[0];
  const primaryPartner = emergencyContacts.find((c) => c.relation.includes("Partner")) || emergencyContacts[1];

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* SOS Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md transition-all font-bold text-xs uppercase tracking-wider"
        >
          <PhoneCall className="w-5 h-5 animate-bounce" />
          <span>1-Tap SOS</span>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping" />
        </button>
      )}

      {/* Emergency Drawer Popup */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-white dark:bg-[#1a1523] rounded-3xl shadow-md border-2 border-red-500/30 p-5 animate-in fade-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-rose-100 dark:border-rose-900/40">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Labor Emergency SOS</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-gray-400 hover:bg-rose-50 dark:hover:bg-rose-900/40"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-gray-600 dark:text-rose-200 mt-2">
            Experiencing severe pain, bleeding, or sudden fluid leakage? Call your doctor or ambulance immediately.
          </p>

          <div className="mt-4 space-y-2.5">
            {/* National Ambulance */}
            <a
              href="tel:108"
              className="flex items-center justify-between p-3 rounded-2xl bg-red-500 text-white font-bold text-xs hover:bg-red-600 transition-colors shadow-md"
            >
              <div className="flex items-center gap-2.5">
                <Ambulance className="w-5 h-5" />
                <div>
                  <div>National Emergency Hotline</div>
                  <div className="text-[10px] font-normal opacity-90">108 / 102 Maternal Ambulance</div>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-white text-red-600 rounded-xl text-xs font-black">
                108
              </span>
            </a>

            {/* Doctor */}
            {primaryDoctor && (
              <a
                href={`tel:${primaryDoctor.phone}`}
                className="flex items-center justify-between p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-900 dark:text-rose-100 hover:bg-rose-100/80 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Hospital className="w-4 h-4 text-rose-600" />
                  <div>
                    <div className="font-semibold">{primaryDoctor.name}</div>
                    <div className="text-[10px] text-rose-500">{primaryDoctor.phone}</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-1 bg-rose-200 dark:bg-rose-800 text-rose-800 dark:text-rose-100 rounded-lg font-bold">
                  Call Doctor
                </span>
              </a>
            )}

            {/* Partner */}
            {primaryPartner && (
              <a
                href={`tel:${primaryPartner.phone}`}
                className="flex items-center justify-between p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-900 dark:text-rose-100 hover:bg-rose-100/80 transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-rose-600" />
                  <div>
                    <div className="font-semibold">{primaryPartner.name}</div>
                    <div className="text-[10px] text-rose-500">{primaryPartner.phone}</div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-1 bg-rose-200 dark:bg-rose-800 text-rose-800 dark:text-rose-100 rounded-lg font-bold">
                  Call Partner
                </span>
              </a>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-rose-100 dark:border-rose-900/40 flex justify-between items-center text-[11px]">
            <button
              onClick={() => {
                setIsOpen(false);
                setActivePage("emergency-contacts");
              }}
              className="text-rose-600 dark:text-rose-300 font-semibold underline"
            >
              Manage Emergency Contacts
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                setActivePage("contraction-timer");
              }}
              className="text-gray-500 dark:text-rose-400 hover:text-rose-600"
            >
              Open Labor Timer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  return (
    <div className="fixed top-20 right-6 z-50 bg-rose-900 dark:bg-rose-100 text-white dark:text-rose-950 px-4 py-3 rounded-2xl shadow-md text-xs font-medium flex items-center gap-2 border border-rose-700/50 animate-in fade-in slide-in-from-top-2 duration-300">
      <Shield className="w-4 h-4 text-rose-300 dark:text-rose-700 shrink-0" />
      <span>{toast}</span>
    </div>
  );
};
