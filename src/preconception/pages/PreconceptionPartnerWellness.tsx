import React, { useState } from "react";
import { Users, Heart, Zap, Shield, Flame, CheckCircle, Sparkles, AlertTriangle, BatteryCharging } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";

export const PreconceptionPartnerWellness: React.FC = () => {
  const [partnerTasks, setPartnerTasks] = useState([
    { id: "heat", title: "Avoid Heat Exposure", desc: "No hot tubs, prolonged hot baths, or laptop directly on lap. Testes need to stay 2-4°F cooler than core body temp.", done: true, tag: "Sperm Count" },
    { id: "antioxidants", title: "Daily Zinc & CoQ10 & Vit C", desc: "Key antioxidants support sperm membrane fluidity and mitochondrial ATP motility.", done: true, tag: "Motility" },
    { id: "alcohol", title: "Limit Alcohol to <2 Drinks/Week", desc: "Heavy alcohol lowers testosterone, causes testicular atrophy, and increases sperm DNA fragmentation.", done: true, tag: "DNA Quality" },
    { id: "sleep", title: "7-8 Hours Consistent Sleep", desc: "Testosterone production peaks during deep REM sleep cycles. Sleep deprivation lowers count.", done: false, tag: "Hormones" },
    { id: "exercise", title: "Moderate Exercise & Hydration", desc: "Regular moderate cardio and strength training improves semen volume and morphology.", done: false, tag: "Vitality" },
    { id: "briefs", title: "Wear Breathable Cotton Boxers", desc: "Reduces scrotal trapping temperature and supports optimal 74-day spermatogenesis cycles.", done: true, tag: "Comfort" },
  ]);

  const toggleTask = (id: string) => {
    setPartnerTasks(partnerTasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const completedCount = partnerTasks.filter((t) => t.done).length;
  const partnerScore = Math.round((completedCount / partnerTasks.length) * 100);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-indigo-900 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-teal-400/30 text-teal-200">
              <Users className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-200">Dual-Partner Synergy</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">Partner Wellness & Vitality</h2>
          <p className="text-teal-100 text-sm mt-1">
            Conception is a 50/50 partnership. Optimize sperm count, motility, and DNA integrity.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
          <div className="text-3xl font-black text-emerald-200">{partnerScore}%</div>
          <div className="text-[10px] font-bold text-teal-200 uppercase tracking-wider">Partner Vitality Score</div>
        </div>
      </div>

      {/* 74-Day Biological Window */}
      <Card variant="glass" className="p-6 border-emerald-100 dark:border-emerald-900/40">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-300 flex items-center justify-center flex-shrink-0">
            <BatteryCharging className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-emerald-950 dark:text-emerald-50 text-base">
              The 74-Day Spermatogenesis Clock
            </h3>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80 mt-1 leading-relaxed">
              It takes approximately 74 days (about 2.5 months) for new sperm cells to develop and mature from stem cells, plus 10–14 days to traverse the epididymis. 
              <strong> The lifestyle, sleep, and nutrition choices your partner makes today are directly reflected in the sperm that fertilizes the egg 2.5 months from now.</strong>
            </p>
          </div>
        </div>
      </Card>

      {/* Partner Checklist */}
      <Card variant="glass" className="p-6 border-emerald-100 dark:border-emerald-900/40">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-emerald-950 dark:text-emerald-50 text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Male Fertility & Lifestyle Checklist
            </h3>
            <p className="text-xs text-emerald-700/70 dark:text-emerald-300/70">
              Click to toggle completed habits and optimize vitality.
            </p>
          </div>
          <Badge variant="primary" className="bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 font-bold">
            {completedCount} of {partnerTasks.length} Habits Active
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {partnerTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                task.done
                  ? "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
                  : "bg-white dark:bg-[#15201c] border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-300"
              }`}
            >
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => {}}
                className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-100">{task.title}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-200">
                    {task.tag}
                  </span>
                </div>
                <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80 leading-relaxed">{task.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
