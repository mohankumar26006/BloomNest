import React, { useState } from "react";
import { Stethoscope, FileText, CheckSquare, Printer, AlertCircle, Share2, Sparkles, ShieldAlert, Check } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { useApp } from "../../context/AppContext";

export const PreconceptionDoctorBrief: React.FC = () => {
  const { user } = useApp();
  const [copied, setCopied] = useState(false);

  // Preconception lab checklist
  const [tests, setTests] = useState([
    { id: "tsh", name: "TSH & Thyroid Profile", ideal: "0.5 - 2.5 mIU/L (Tighter preconception window)", done: true, result: "1.8 mIU/L (Optimal)" },
    { id: "cbc", name: "Complete Blood Count & Hemoglobin", ideal: "> 12.0 g/dL to rule out preconception anemia", done: true, result: "12.8 g/dL (Normal)" },
    { id: "rubella", name: "Rubella & Varicella IgG Immunity", ideal: "Positive / Immune (Avoid live vaccine during pregnancy)", done: true, result: "Immune" },
    { id: "blood_group", name: "Blood Group & Rh Factor", ideal: "Identify Rh-negative status for RhoGAM prophylaxis", done: false, result: "Pending" },
    { id: "hba1c", name: "Fasting Glucose & HbA1c", ideal: "HbA1c < 5.7% to reduce congenital defect risk", done: false, result: "Pending" },
    { id: "vit_d_b12", name: "Vitamin D3 & Serum B12", ideal: "Vit D > 30 ng/mL, B12 > 300 pg/mL for oocyte health", done: false, result: "Pending" },
    { id: "pap", name: "Cervical Pap Smear & HPV", ideal: "Up to date within 3 years", done: true, result: "Clear" },
    { id: "carrier", name: "Genetic Carrier Screening (Thalassemia / CF)", ideal: "Recommended for high-prevalence backgrounds", done: false, result: "Discuss with Doctor" },
  ]);

  const toggleTest = (id: string) => {
    setTests(tests.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const briefText = `
BLOOMNEST PRECONCEPTION SBAR CLINICAL SUMMARY
Patient: ${user?.fullName || "Patient"} | Age: ${user?.age || 27}
Date: ${new Date().toLocaleDateString()}

[SITUATION]
Patient is proactively planning conception within the next 3-6 months. Requesting baseline preconception review, medication reconciliation, and confirmation of immunizations.

[BACKGROUND]
• Menstrual Cycle: Regular ~28 days.
• Folate Compliance: Daily 400-800mcg Folic Acid initiated.
• Immunizations: Rubella IgG Immune.
• Known Medical Conditions: None reported or under evaluation.

[ASSESSMENT & LABS]
${tests.map((t) => `• ${t.name}: ${t.done ? `COMPLETED (${t.result})` : `PENDING (Target: ${t.ideal})`}`).join("\n")}

[RECOMMENDATIONS FOR OB-GYN]
1. Reconcile any OTC or prescription medications for pregnancy Category C/D risks.
2. Confirm TSH is maintained below 2.5 mIU/L during active conception attempts.
3. Order baseline HbA1c and Blood Group with Rh factor screen.
    `;
    navigator.clipboard.writeText(briefText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-emerald-950 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/30 text-emerald-200">
              <Stethoscope className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">Clinical Governance</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">Doctor SBAR Brief & Lab Portal</h2>
          <p className="text-emerald-100 text-sm mt-1">
            Standardized Situation-Background-Assessment-Recommendation summary formatted for your OB-GYN consultation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            className="bg-white/10 hover:bg-white/20 text-white font-bold border-0 rounded-2xl"
            onClick={handleCopy}
          >
            {copied ? <Check className="w-4 h-4 mr-1 text-emerald-300" /> : <Share2 className="w-4 h-4 mr-1" />}
            {copied ? "Copied!" : "Copy Text"}
          </Button>
          <Button
            variant="primary"
            className="bg-white text-emerald-950 hover:bg-emerald-50 font-bold border-0 rounded-2xl shadow-lg"
            onClick={handlePrint}
          >
            <Printer className="w-4 h-4 mr-1 text-emerald-700" />
            Print SBAR
          </Button>
        </div>
      </div>

      {/* SBAR Card */}
      <Card variant="glass" className="p-6 sm:p-8 border-emerald-100 dark:border-emerald-900/40 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-emerald-100 dark:border-emerald-900/30 gap-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Standardized Clinical Format
            </span>
            <h3 className="text-xl font-black text-emerald-950 dark:text-emerald-50">
              Preconception Health Summary
            </h3>
          </div>
          <div className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
            Patient: <span className="font-bold text-emerald-950 dark:text-emerald-100">{user?.fullName || "Prospective Mother"}</span> | Age: {user?.age || 28}
          </div>
        </div>

        {/* Situation & Background */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
            <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-black">S</span>
              Situation
            </h4>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80 leading-relaxed">
              Patient is scheduling an OB-GYN pre-pregnancy wellness appointment. Initiating active conception within the upcoming 3 to 6 months. Seeking clearance on thyroid targets, vaccinations, and prenatal supplementation.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/30">
            <h4 className="font-bold text-teal-900 dark:text-teal-200 text-sm mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center text-xs font-black">B</span>
              Background
            </h4>
            <p className="text-xs text-teal-800/80 dark:text-teal-200/80 leading-relaxed">
              • Cycle: Natural regular cycles (~28 days).<br />
              • Supplementation: Daily Folic acid 400mcg taken for &gt;14 consecutive days.<br />
              • Lifestyle: Non-smoker, minimal alcohol, healthy BMI range.
            </p>
          </div>
        </div>

        {/* Assessment */}
        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
          <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm mb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs font-black">A</span>
            Assessment & Readiness Findings
          </h4>
          <p className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
            Baseline clinical status is strong. Rubella IgG immunity confirmed. Need to confirm Rh antibody status and ensure serum TSH stays strictly under 2.5 mIU/L during the first trimester to safeguard neurocognitive fetal development.
          </p>
        </div>

        {/* Recommendations */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30">
          <h4 className="font-bold text-indigo-900 dark:text-indigo-200 text-sm mb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black">R</span>
            Recommendations for Clinician
          </h4>
          <ul className="text-xs text-indigo-900/80 dark:text-indigo-200/80 space-y-1 list-disc list-inside">
            <li>Review and authorize preconception blood work panel (Blood group, HbA1c, Vit D3).</li>
            <li>Screen partner for carrier genetics if family history warrants.</li>
            <li>Authorize prescription prenatal with active methylfolate and 200mg DHA.</li>
          </ul>
        </div>
      </Card>

      {/* Preconception Lab Checklist */}
      <Card variant="glass" className="p-6 border-emerald-100 dark:border-emerald-900/40">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-emerald-950 dark:text-emerald-50 text-lg flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Preconception Blood Work & Lab Panel
            </h3>
            <p className="text-xs text-emerald-700/70 dark:text-emerald-300/70 mt-0.5">
              Click any lab to mark it completed or pending.
            </p>
          </div>
          <Badge variant="primary" className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200">
            {tests.filter((t) => t.done).length} / {tests.length} Complete
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tests.map((test) => (
            <div
              key={test.id}
              onClick={() => toggleTest(test.id)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                test.done
                  ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800"
                  : "bg-white dark:bg-[#15201c] border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={test.done}
                  onChange={() => {}}
                  className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <div>
                  <h5 className="font-bold text-xs text-emerald-950 dark:text-emerald-100">{test.name}</h5>
                  <p className="text-[11px] text-emerald-700/70 dark:text-emerald-300/70 mt-0.5">{test.ideal}</p>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                  test.done
                    ? "bg-emerald-200 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                }`}
              >
                {test.result}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
