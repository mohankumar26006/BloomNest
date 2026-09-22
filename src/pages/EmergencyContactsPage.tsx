import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { PhoneCall, Plus, Hospital, User, Shield, AlertCircle } from "lucide-react";

export const EmergencyContactsPage: React.FC = () => {
  const { emergencyContacts, addEmergencyContact, t } = useApp();

  const [name, setName] = useState("");
  const [relation, setRelation] = useState("OB-GYN Doctor");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    addEmergencyContact({
      name,
      relation,
      phone,
      address,
      isPrimary: false,
    });

    setName("");
    setPhone("");
    setAddress("");
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider">
            <PhoneCall className="w-4 h-4" />
            <span>{t("emergencyPreparedness")}</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-rose-100 mt-1">
            {t("emergencyContactsTitle")}
          </h1>
          <p className="text-xs text-gray-500 dark:text-rose-300 mt-1">
            {t("emergencyContactsSubtitle")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact List */}
        <div className="lg:col-span-2 space-y-4">
          {emergencyContacts.map((contact) => (
            <div
              key={contact.id}
              className="p-5 rounded-3xl bg-white dark:bg-[#1a1523] border border-rose-100 dark:border-rose-900/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-base text-gray-900 dark:text-rose-100">
                    {contact.name}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-200">
                    {contact.relation}
                  </span>
                </div>
                <div className="text-xs font-semibold text-rose-600 dark:text-rose-300">
                  {contact.phone}
                </div>
                {contact.address && (
                  <div className="text-[11px] text-gray-500 dark:text-rose-400">
                    📍 {contact.address}
                  </div>
                )}
              </div>

              <a
                href={`tel:${contact.phone}`}
                className="px-5 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shrink-0"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{t("callNow")}</span>
              </a>
            </div>
          ))}
        </div>

        {/* Add Contact Form */}
        <form
          onSubmit={handleAdd}
          className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4 h-fit"
        >
          <h3 className="font-bold text-sm text-gray-900 dark:text-rose-100 flex items-center gap-2">
            <Plus className="w-4 h-4 text-rose-500" />
            <span>{t("addEmergencyContact")}</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1">
                {t("name")}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("contactNamePlaceholder")}
                className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1">
                {t("relationRole")}
              </label>
              <input
                type="text"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                placeholder={t("relationRolePlaceholder")}
                className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1">
                {t("phoneNumber")}
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1">
                {t("hospitalAddress")}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t("addressPlaceholder")}
                className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-md"
          >
            {t("saveEmergencyContact")}
          </button>
        </form>
      </div>
    </div>
  );
};
