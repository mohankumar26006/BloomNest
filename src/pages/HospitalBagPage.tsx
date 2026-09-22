import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Briefcase, CheckCircle2, Plus, Heart, Baby, Users, FileText, Sparkles } from "lucide-react";

export const HospitalBagPage: React.FC = () => {
  const { hospitalBag, toggleHospitalItem, addHospitalItem, t } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>("mother");
  const [newItemName, setNewItemName] = useState<string>("");
  const [newCat, setNewCat] = useState<any>("mother");

  const packedCount = hospitalBag.filter((i) => i.isPacked).length;
  const progressPct = Math.round((packedCount / (hospitalBag.length || 1)) * 100);

  const filteredItems = hospitalBag.filter(
    (i) => activeCategory === "all" || i.category === activeCategory
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    addHospitalItem({
      category: newCat,
      item: newItemName,
      quantity: 1,
    });
    setNewItemName("");
  };

  const categoryTabs = [
    { key: "all", labelKey: "bagAll" },
    { key: "mother", labelKey: "bagMother" },
    { key: "baby", labelKey: "bagBaby" },
    { key: "documents", labelKey: "bagDocuments" },
    { key: "essentials", labelKey: "bagEssentials" },
    { key: "partner", labelKey: "bagPartner" },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider">
            <Briefcase className="w-4 h-4" />
            <span>{t("deliveryPreparation")}</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-rose-100 mt-1">
            {t("hospitalBagTitle", { pct: progressPct })}
          </h1>
          <p className="text-xs text-gray-500 dark:text-rose-300 mt-1">
            {t("hospitalBagSubtitle")}
          </p>
        </div>

        {/* Progress gauge */}
        <div className="w-full md:w-64 space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-gray-700 dark:text-rose-200">
            <span>{t("packingReadiness")}</span>
            <span>{t("itemsCount", { packed: packedCount, total: hospitalBag.length })}</span>
          </div>
          <div className="w-full bg-rose-100 dark:bg-rose-950 rounded-full h-3 overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 text-xs font-bold">
        {categoryTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveCategory(tab.key)}
            className={`px-4 py-2 rounded-2xl transition-all ${
              activeCategory === tab.key
                ? "bg-rose-500 text-white shadow-md"
                : "bg-white dark:bg-[#1a1523] border border-rose-100 dark:border-rose-900/40 text-gray-700 dark:text-rose-200 hover:bg-rose-50"
            }`}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleHospitalItem(item.id)}
              className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                item.isPacked
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-900 dark:text-emerald-200"
                  : "bg-white dark:bg-[#1a1523] border-rose-100 dark:border-rose-900/40 text-gray-900 dark:text-rose-100 hover:border-rose-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                    item.isPacked ? "bg-emerald-500 text-white" : "border-2 border-rose-300 text-transparent"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 fill-current" />
                </div>
                <span className={`text-xs font-semibold ${item.isPacked ? "line-through opacity-70" : ""}`}>
                  {item.item}
                </span>
              </div>

              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-200">
                {item.category}
              </span>
            </div>
          ))}
        </div>

        {/* Add Item Form */}
        <form
          onSubmit={handleAdd}
          className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4 h-fit"
        >
          <h3 className="font-bold text-sm text-gray-900 dark:text-rose-100 flex items-center gap-2">
            <Plus className="w-4 h-4 text-rose-500" />
            <span>{t("addCustomItem")}</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1">{t("category")}</label>
              <select
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 font-semibold"
              >
                <option value="mother">{t("bagForMother")}</option>
                <option value="baby">{t("bagForBaby")}</option>
                <option value="documents">{t("bagDocumentsOnly")}</option>
                <option value="essentials">{t("bagEssentialsOnly")}</option>
                <option value="partner">{t("bagForPartner")}</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-600 dark:text-rose-300 mb-1">{t("itemName")}</label>
              <input
                type="text"
                required
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={t("itemNamePlaceholder")}
                className="w-full px-3 py-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-md"
          >
            {t("addToHospitalBag")}
          </button>
        </form>
      </div>
    </div>
  );
};
