import React from "react";
import { ShieldAlert, AlertTriangle, PhoneCall, CheckCircle2, Clock, HelpCircle, HeartPulse } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";

export const PreconceptionSafety: React.FC = () => {
  const redFlags = [
    {
      title: "Cycle Irregularity (>35 days or <21 days)",
      desc: "Suggests potential anovulatory cycles, PCOS, or hyperprolactinemia. An OB-GYN can run an ultrasound and hormone panel.",
      urgent: false,
    },
    {
      title: "Severe Dysmenorrhea (Debilitating Period Pain)",
      desc: "Severe cramping that interferes with daily life or deep pelvic pain during intercourse may indicate endometriosis or adenomyosis.",
      urgent: true,
    },
    {
      title: "Age-Specific Clinical Thresholds",
      desc: "If age is under 35: consult after 12 months of timed intercourse. If age is 35 or older: consult after 6 months. If over 40: consult immediately.",
      urgent: false,
    },
    {
      title: "History of Two or More Miscarriages",
      desc: "Warrants a recurrent pregnancy loss evaluation including karyotyping, antiphospholipid antibodies, and uterine cavity sonohysterography.",
      urgent: true,
    },
    {
      title: "Pre-existing Medical Conditions",
      desc: "Diabetes (ensure HbA1c < 6.5%), Thyroid disorders (TSH < 2.5), Epilepsy, or Hypertension require maternal-fetal medicine pre-clearance.",
      urgent: true,
    },
  ];

  const medicationAudit = [
    { name: "Accutane / Isotretinoin", risk: "CRITICAL CONTRAINDICATION", status: "Must discontinue at least 1-3 months before conception due to extreme teratogenicity." },
    { name: "NSAIDs (Ibuprofen / Naproxen)", risk: "AVOID AROUND OVULATION", status: "Can inhibit follicle rupture and luteal phase progesterone synthesis. Prefer Acetaminophen (Paracetamol)." },
    { name: "ACE Inhibitors / ARBs", risk: "SWITCH BEFORE TRYING", status: "Common blood pressure meds that can cause fetal renal dysgenesis in pregnancy. Switch to Labetalol or Methyldopa." },
    { name: "Folic Acid / Methylfolate", risk: "MANDATORY DAILY", status: "400 - 800 mcg daily recommended to build red blood cell folate defense." },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-rose-500/30 text-rose-200">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-200">Clinical Safety & Triaging</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">Preconception Safety & Guardrails</h2>
          <p className="text-slate-200 text-sm mt-1">
            Clinical guidance on when to see an OB-GYN specialist early and medications to audit.
          </p>
        </div>
      </div>

      {/* Red Flags & Evaluation */}
      <Card variant="glass" className="p-6 border-emerald-100 dark:border-emerald-900/40">
        <h3 className="font-bold text-emerald-950 dark:text-emerald-50 text-lg mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          When to Consult a Fertility Specialist or OB-GYN Early
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {redFlags.map((flag, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border ${
                flag.urgent
                  ? "bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40"
                  : "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-100">{flag.title}</h4>
                {flag.urgent && (
                  <Badge variant="warning" className="bg-rose-500 text-white text-[10px] font-bold">
                    Specialist Review
                  </Badge>
                )}
              </div>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-200/80 leading-relaxed">{flag.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Medication Safety Triage */}
      <Card variant="glass" className="p-6 border-emerald-100 dark:border-emerald-900/40">
        <h3 className="font-bold text-emerald-950 dark:text-emerald-50 text-lg mb-4 flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          Medication Reconciliation & Teratogen Audit
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                <th className="pb-3 font-bold">Medication / Class</th>
                <th className="pb-3 font-bold">Clinical Preconception Status</th>
                <th className="pb-3 font-bold">Action / Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-50 dark:divide-emerald-900/20 text-emerald-900 dark:text-emerald-100">
              {medicationAudit.map((med, i) => (
                <tr key={i}>
                  <td className="py-3 font-bold">{med.name}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        med.risk.includes("CRITICAL")
                          ? "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-200"
                          : med.risk.includes("MANDATORY")
                          ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-200"
                          : "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-200"
                      }`}
                    >
                      {med.risk}
                    </span>
                  </td>
                  <td className="py-3 text-xs text-emerald-800/80 dark:text-emerald-200/80">{med.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
