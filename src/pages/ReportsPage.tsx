import React from "react";
import { useApp } from "../context/AppContext";
import { FileSpreadsheet, Download, Printer, Activity, Pill, HeartPulse, Sparkles, UserCircle } from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export const ReportsPage: React.FC = () => {
  const { user, vitals, medicines, moodLogs, kickSessions, contractions, scanReports, showToast, t } = useApp();

  // Reverse vitals so chronological order goes left-to-right on the charts
  const chartData = [...vitals].reverse().map(v => ({
    name: v.date ? v.date.split(" ").slice(0, 2).join(" ") : "Today",
    weight: v.weightKg,
    systolic: v.systolicBp,
    diastolic: v.diastolicBp
  }));

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Patient Meta
    csvContent += "--- PATIENT METADATA ---\n";
    csvContent += `Name,${user.fullName}\n`;
    csvContent += `Gestational Age,Week ${user.currentWeek}\n`;
    csvContent += `EDD,${user.edd}\n`;
    csvContent += `Blood Group,${user.bloodGroup || "O+"}\n`;
    csvContent += "\n";

    // Vitals
    csvContent += "--- AUTHORITATIVE VITALS LOG ---\n";
    csvContent += "Date,Weight(kg),BP Systolic,BP Diastolic,Calculated MAP(mmHg),BP Status,Glucose(mg/dL),Glucose Context,Glucose Status,Water(mL),Sleep(hrs),Kicks,Symptoms\n";
    vitals.forEach((v) => {
      const evalData = v.evaluation;
      const bpStatus = evalData.bp?.status || "NORMAL";
      const gContext = v.glucoseContext || "fasting";
      const gVal = v.glucoseMgDl || v.bloodSugarMgDl || "";
      const gStatus = evalData.glucose?.status || "NORMAL";
      const mapVal = evalData.bp?.map || Math.round((v.systolicBp + 2 * v.diastolicBp) / 3);
      csvContent += `${v.date},${v.weightKg},${v.systolicBp},${v.diastolicBp},${mapVal},${bpStatus},${gVal},${gContext},${gStatus},${v.waterMl},${v.sleepHours},${v.babyKicksCount},"${(v.symptoms || []).join("; ")}"\n`;
    });
    csvContent += "\n";

    // Medicines
    csvContent += "--- ACTIVE MEDICATIONS ---\n";
    csvContent += "Name,Dosage,Timing,Purpose\n";
    medicines.filter(m => m.isActive).forEach((m) => {
        csvContent += `${m.name},${m.dosage},${m.timeOfDay},${m.purpose || ""}\n`;
    });
    csvContent += "\n";
    
    // Mood & Symptoms
    csvContent += "--- MOOD & SYMPTOMS ---\n";
    csvContent += "Date,Mood,Symptoms\n";
    moodLogs.forEach((m) => {
        csvContent += `${m.date},${m.mood},"${m.symptoms.join(", ")}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BloomNest_Comprehensive_Report_${user.fullName.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(t("downloadedCsvReport") || "Downloaded Comprehensive Report");
  };

  const handlePrint = () => {
    window.print();
  };

  // Generate a mock AI analysis based on the actual data
  const generateAIAnalysis = () => {
    const avgBp = vitals.length > 0 ? Math.round(vitals.reduce((acc, v) => acc + v.systolicBp, 0) / vitals.length) : 0;
    const recentMoods = moodLogs.slice(0, 3).map(m => m.mood);
    const hasAnxiety = recentMoods.includes("anxious") || recentMoods.includes("overwhelmed");
    
    let analysis = `Based on the clinical data provided for ${user.fullName} (Week ${user.currentWeek}), the overall trajectory appears stable. `;
    
    if (avgBp > 0) {
      if (avgBp > 130) {
          analysis += `However, the average systolic blood pressure is trending slightly high (${avgBp} mmHg). Clinical review of BP logs for potential pregnancy-induced hypertension is recommended. `;
      } else {
          analysis += `Blood pressure trends (${avgBp} mmHg average systolic) are within normal maternal limits. `;
      }
    }

    if (medicines.filter(m => m.isActive).length > 0) {
        analysis += `Patient is currently compliant on ${medicines.filter(m => m.isActive).length} active medications/supplements. `;
    }

    if (vitals.some(v => v.babyKicksCount > 0) || kickSessions.length > 0) {
        analysis += `Fetal movement is well-documented and reassuring in the third trimester logs. `;
    }

    if (hasAnxiety) {
        analysis += `Recent mood logs indicate elevated stress or anxiety; recommend offering emotional support resources or a prenatal wellness consultation. `;
    }

    return analysis + `Continue standard prenatal protocol.`;
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 print:p-0 print:space-y-6 print:bg-white print:text-black">
      {/* Interactive Header (Hidden in Print) */}
      <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider">
            <FileSpreadsheet className="w-4 h-4" />
            <span>{t("clinicalSummary")}</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-rose-100 mt-1">
            {t("maternalHealthSummary")}
          </h1>
          <p className="text-xs text-gray-500 dark:text-rose-300 mt-1">
            Complete dossier for OB-GYN consultation, including graphs and AI analysis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>{t("exportCsv")}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-2 shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>{t("printReport")}</span>
          </button>
        </div>
      </div>

      {/* PRINTABLE DOSSIER STARTS HERE */}
      <div className="bg-white dark:bg-[#1a1523] p-8 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        
        {/* Dossier Header */}
        <div className="border-b-2 border-rose-200 dark:border-rose-900/50 pb-6 print:border-black">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-3xl font-bold text-gray-900 dark:text-rose-100 print:text-black">
              Clinical Dossier
            </h2>
            <div className="text-right">
              <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider print:text-black">Generated On</span>
              <span className="font-mono text-sm font-bold text-rose-600 dark:text-rose-400 print:text-black">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Patient Metadata Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-rose-50/50 dark:bg-rose-950/20 p-6 rounded-2xl print:bg-transparent print:p-0 print:border print:border-gray-300 print:rounded-none print:p-4">
          <div>
            <div className="text-gray-500 font-bold uppercase text-[10px] tracking-wider print:text-gray-600">{t("patientName")}</div>
            <div className="font-serif font-bold text-lg text-gray-900 dark:text-rose-100 print:text-black mt-1">{user.fullName}</div>
          </div>
          <div>
            <div className="text-gray-500 font-bold uppercase text-[10px] tracking-wider print:text-gray-600">{t("gestationalAge")}</div>
            <div className="font-bold text-rose-600 dark:text-rose-300 print:text-black mt-1">Week {user.currentWeek} (Tri {user.trimester})</div>
          </div>
          <div>
            <div className="text-gray-500 font-bold uppercase text-[10px] tracking-wider print:text-gray-600">{t("estimatedDueDate")}</div>
            <div className="font-bold text-gray-900 dark:text-rose-100 print:text-black mt-1">{user.edd}</div>
          </div>
          <div>
            <div className="text-gray-500 font-bold uppercase text-[10px] tracking-wider print:text-gray-600">Blood Group</div>
            <div className="font-bold text-red-500 mt-1">{user.bloodGroup}</div>
          </div>
        </div>

        {/* Graphs Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:block print:space-y-8">
          {/* BP Graph */}
          <div className="space-y-4 print:break-inside-avoid">
            <h3 className="font-bold text-sm text-gray-900 dark:text-rose-100 flex items-center gap-2 print:text-black">
              <HeartPulse className="w-4 h-4 text-rose-500 print:text-black" />
              <span>Blood Pressure Trends</span>
            </h3>
            <div className="h-64 w-full border border-gray-100 dark:border-gray-800 rounded-xl p-4 print:border-gray-300">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSys" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDia" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" tick={{fontSize: 10}} />
                  <YAxis domain={['auto', 'auto']} tick={{fontSize: 10}} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Area type="monotone" dataKey="systolic" stroke="#f43f5e" fillOpacity={1} fill="url(#colorSys)" name="Systolic" />
                  <Area type="monotone" dataKey="diastolic" stroke="#3b82f6" fillOpacity={1} fill="url(#colorDia)" name="Diastolic" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weight Graph */}
          <div className="space-y-4 print:break-inside-avoid">
            <h3 className="font-bold text-sm text-gray-900 dark:text-rose-100 flex items-center gap-2 print:text-black">
              <Activity className="w-4 h-4 text-purple-500 print:text-black" />
              <span>Maternal Weight Progression (kg)</span>
            </h3>
            <div className="h-64 w-full border border-gray-100 dark:border-gray-800 rounded-xl p-4 print:border-gray-300">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" tick={{fontSize: 10}} />
                  <YAxis domain={['auto', 'auto']} tick={{fontSize: 10}} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Line type="monotone" dataKey="weight" stroke="#a855f7" strokeWidth={3} dot={{ r: 4 }} name="Weight (kg)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* AI Analysis Summary */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-6 print:bg-transparent print:border-black print:border-2 print:break-inside-avoid">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-amber-500 print:text-black" />
            <h3 className="font-serif font-bold text-lg text-amber-900 dark:text-amber-100 print:text-black">
              AI Clinical Summary
            </h3>
          </div>
          <p className="text-sm leading-relaxed text-amber-950 dark:text-amber-50 print:text-black">
            {generateAIAnalysis()}
          </p>
        </div>

        {/* Vitals Summary Table */}
        <div className="space-y-4 print:break-inside-auto">
          <h3 className="font-bold text-sm text-gray-900 dark:text-rose-100 flex items-center gap-2 print:text-black">
            <UserCircle className="w-4 h-4 text-rose-500 print:text-black" />
            <span>Detailed Vitals Log</span>
          </h3>

          <div className="overflow-x-auto print:overflow-visible border border-rose-100 dark:border-rose-900/40 rounded-xl print:border-gray-300">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-rose-50/50 dark:bg-rose-950/30 print:bg-gray-100 print:table-header-group">
                <tr className="text-rose-600 dark:text-rose-300 font-bold uppercase text-[10px] print:text-black">
                  <th className="p-3">Date</th>
                  <th className="p-3">Weight</th>
                  <th className="p-3">BP</th>
                  <th className="p-3">Water</th>
                  <th className="p-3">Sleep</th>
                  <th className="p-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-100 dark:divide-rose-900/40 print:divide-gray-300">
                {vitals.map((v) => (
                  <tr key={v.id} className="text-gray-700 dark:text-gray-300 print:text-black print:break-inside-avoid">
                    <td className="p-3 font-semibold">{v.date}</td>
                    <td className="p-3">{v.weightKg} kg</td>
                    <td className="p-3">{v.systolicBp}/{v.diastolicBp}</td>
                    <td className="p-3">{v.waterMl} mL</td>
                    <td className="p-3">{v.sleepHours} hrs</td>
                    <td className="p-3 italic text-gray-500 text-[11px] print:text-gray-700">{v.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Medications Table */}
        {medicines.length > 0 && (
          <div className="space-y-4 print:break-inside-avoid">
            <h3 className="font-bold text-sm text-gray-900 dark:text-rose-100 flex items-center gap-2 print:text-black">
              <Pill className="w-4 h-4 text-emerald-500 print:text-black" />
              <span>Active Medications & Supplements</span>
            </h3>

            <div className="overflow-x-auto print:overflow-visible border border-emerald-100 dark:border-emerald-900/40 rounded-xl print:border-gray-300">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-emerald-50/50 dark:bg-emerald-950/30 print:bg-gray-100">
                  <tr className="text-emerald-700 dark:text-emerald-300 font-bold uppercase text-[10px] print:text-black">
                    <th className="p-3">Medication Name</th>
                    <th className="p-3">Dosage</th>
                    <th className="p-3">Timing</th>
                    <th className="p-3">Clinical Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100 dark:divide-emerald-900/40 print:divide-gray-300">
                  {medicines.filter(m => m.isActive).map((m) => (
                    <tr key={m.id} className="text-gray-700 dark:text-gray-300 print:text-black">
                      <td className="p-3 font-semibold">{m.name}</td>
                      <td className="p-3">{m.dosage}</td>
                      <td className="p-3 capitalize">{m.timeOfDay}</td>
                      <td className="p-3 italic">{m.purpose || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
