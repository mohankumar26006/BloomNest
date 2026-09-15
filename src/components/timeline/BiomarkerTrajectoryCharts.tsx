import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import { Card, CardHeading, BodyText, Badge } from "../ui";
import { Activity, TrendingUp, Droplets, Heart, ShieldAlert, CheckCircle2 } from "lucide-react";
import { ScanLabMilestoneRecord } from "../../types";

interface BiomarkerTrajectoryChartsProps {
  records: ScanLabMilestoneRecord[];
}

export const BiomarkerTrajectoryCharts: React.FC<BiomarkerTrajectoryChartsProps> = ({ records }) => {
  const [activeChart, setActiveChart] = useState<"hemoglobin" | "fetalWeight" | "amnioticFluid" | "heartRate" | "ogtt">("hemoglobin");

  // Extract recorded hemoglobin values from records
  const hemogramRecords = records
    .filter((r) => r.keyBiomarkers.some((b) => b.name.toLowerCase().includes("hemoglobin")))
    .map((r) => {
      const hb = r.keyBiomarkers.find((b) => b.name.toLowerCase().includes("hemoglobin"));
      return {
        week: `W${r.gestationalWeek}`,
        weekNum: r.gestationalWeek,
        hb: hb?.numericValue || parseFloat(String(hb?.value || "0")),
        minThreshold: r.gestationalWeek >= 14 && r.gestationalWeek <= 27 ? 10.5 : 11.0,
        optimalTarget: 12.0,
      };
    })
    .sort((a, b) => a.weekNum - b.weekNum);

  // Default curve for gestational week projection if sparse
  const hemoglobinData = [
    { week: "W3 Baseline", hb: hemogramRecords.find((r) => r.weekNum <= 4)?.hb || 12.8, threshold: 11.0, target: 12.0 },
    { week: "W12 Scan", hb: 12.2, threshold: 11.0, target: 12.0 },
    { week: "W20 Anomaly", hb: 11.8, threshold: 10.5, target: 11.5 },
    { week: "W24 OGTT/Lab", hb: hemogramRecords.find((r) => r.weekNum >= 20)?.hb || 11.4, threshold: 10.5, target: 11.5 },
    { week: "W28 Due", hb: null, threshold: 10.5, target: 11.5 },
    { week: "W34 Due", hb: null, threshold: 11.0, target: 12.0 },
  ];

  // Fetal Growth percentile curve data (Hadlock standard)
  const growthCurveData = [
    { week: "W12", p10: 12, p50: 14, p90: 18, actual: 14 },
    { week: "W16", p10: 120, p50: 145, p90: 175, actual: null },
    { week: "W20", p10: 310, p50: 360, p90: 420, actual: records.find(r => r.milestoneId === "anomaly-scan")?.keyBiomarkers.find(b => b.name.includes("EFW"))?.numericValue || 360 },
    { week: "W24", p10: 570, p50: 670, p90: 780, actual: null },
    { week: "W28", p10: 1000, p50: 1210, p90: 1450, actual: records.find(r => r.milestoneId === "third-tri-growth" && r.status === "COMPLETED")?.keyBiomarkers.find(b => b.name.includes("EFW"))?.numericValue || null },
    { week: "W32", p10: 1600, p50: 1900, p90: 2250, actual: null },
    { week: "W36", p10: 2350, p50: 2750, p90: 3200, actual: null },
    { week: "W38", p10: 2700, p50: 3200, p90: 3750, actual: null },
  ];

  // Amniotic Fluid Index (AFI cm) data
  const afiData = [
    { week: "W16", afi: 12.5, minNormal: 8, maxNormal: 18, polyhydramnios: 24 },
    { week: "W20", afi: records.find(r => r.milestoneId === "anomaly-scan")?.keyBiomarkers.find(b => b.name.includes("AFI"))?.numericValue || 14.2, minNormal: 8, maxNormal: 18, polyhydramnios: 24 },
    { week: "W24", afi: 14.5, minNormal: 8, maxNormal: 18, polyhydramnios: 24 },
    { week: "W28", afi: records.find(r => r.milestoneId === "third-tri-growth" && r.status === "COMPLETED")?.keyBiomarkers.find(b => b.name.includes("AFI"))?.numericValue || 14.8, minNormal: 8, maxNormal: 18, polyhydramnios: 24 },
    { week: "W32", afi: 13.5, minNormal: 8, maxNormal: 18, polyhydramnios: 24 },
    { week: "W36", afi: 12.0, minNormal: 8, maxNormal: 18, polyhydramnios: 24 },
  ];

  // Fetal Heart Rate (bpm) progression
  const fhrData = [
    { week: "W7 Dating", fhr: records.find(r => r.milestoneId === "dating-scan")?.keyBiomarkers.find(b => b.name.includes("Heart Rate") || b.name.includes("FHR"))?.numericValue || 152, baselineLow: 110, baselineHigh: 160 },
    { week: "W12 NT Scan", fhr: records.find(r => r.milestoneId === "nt-scan")?.keyBiomarkers.find(b => b.name.includes("Heart Rate") || b.name.includes("FHR"))?.numericValue || 158, baselineLow: 110, baselineHigh: 160 },
    { week: "W20 Anomaly", fhr: 146, baselineLow: 110, baselineHigh: 160 },
    { week: "W24 Checkup", fhr: 144, baselineLow: 110, baselineHigh: 160 },
    { week: "W28 Target", fhr: 140, baselineLow: 110, baselineHigh: 160 },
    { week: "W36 Target", fhr: 138, baselineLow: 110, baselineHigh: 160 },
  ];

  // OGTT Glucose Challenge Curve data
  const ogttRecord = records.find(r => r.milestoneId === "ogtt-test");
  const fastingVal = ogttRecord?.keyBiomarkers.find(b => b.name.toLowerCase().includes("fasting"))?.numericValue || 82;
  const oneHrVal = ogttRecord?.keyBiomarkers.find(b => b.name.toLowerCase().includes("1-hour") || b.name.toLowerCase().includes("1-hr"))?.numericValue || 128;
  const twoHrVal = ogttRecord?.keyBiomarkers.find(b => b.name.toLowerCase().includes("2-hour") || b.name.toLowerCase().includes("2-hr"))?.numericValue || 110;

  const ogttData = [
    { stage: "Fasting", patientGlucose: fastingVal, cutoffThreshold: 92, optimalTarget: 80 },
    { stage: "1-Hour Post 75g", patientGlucose: oneHrVal, cutoffThreshold: 180, optimalTarget: 130 },
    { stage: "2-Hour Post 75g", patientGlucose: twoHrVal, cutoffThreshold: 153, optimalTarget: 115 },
  ];

  return (
    <Card variant="glass" radius="3xl" className="p-6 sm:p-7 space-y-5">
      {/* Header with Sub-tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 dark:border-rose-900/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="rose" size="sm" icon={<TrendingUp className="w-3.5 h-3.5" />}>
              Longitudinal Analytics
            </Badge>
            <span className="text-xs text-gray-500 dark:text-rose-300 font-semibold">40-Week Trajectories</span>
          </div>
          <CardHeading className="text-xl mt-1">Biomarker & Biometry Trajectory</CardHeading>
          <BodyText className="text-xs">
            Visualize physiological maternal laboratory parameters alongside fetal ultrasound measurements.
          </BodyText>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 text-xs">
          <button
            onClick={() => setActiveChart("hemoglobin")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeChart === "hemoglobin"
                ? "bg-rose-500 text-white shadow-xs"
                : "text-gray-700 dark:text-rose-200 hover:text-rose-600"
            }`}
          >
            Hemoglobin (Hb)
          </button>
          <button
            onClick={() => setActiveChart("fetalWeight")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeChart === "fetalWeight"
                ? "bg-rose-500 text-white shadow-xs"
                : "text-gray-700 dark:text-rose-200 hover:text-rose-600"
            }`}
          >
            Fetal Weight (EFW)
          </button>
          <button
            onClick={() => setActiveChart("amnioticFluid")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeChart === "amnioticFluid"
                ? "bg-rose-500 text-white shadow-xs"
                : "text-gray-700 dark:text-rose-200 hover:text-rose-600"
            }`}
          >
            Amniotic Fluid (AFI)
          </button>
          <button
            onClick={() => setActiveChart("heartRate")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeChart === "heartRate"
                ? "bg-rose-500 text-white shadow-xs"
                : "text-gray-700 dark:text-rose-200 hover:text-rose-600"
            }`}
          >
            Fetal Heart Rate
          </button>
          <button
            onClick={() => setActiveChart("ogtt")}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              activeChart === "ogtt"
                ? "bg-rose-500 text-white shadow-xs"
                : "text-gray-700 dark:text-rose-200 hover:text-rose-600"
            }`}
          >
            OGTT Glucose
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="w-full h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          {activeChart === "hemoglobin" ? (
            <LineChart data={hemoglobinData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f43f5e" strokeOpacity={0.15} />
              <XAxis dataKey="week" stroke="#9ca3af" fontSize={11} tickLine={false} />
              <YAxis domain={[9, 14]} stroke="#9ca3af" fontSize={11} tickLine={false} unit="g/dL" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "14px",
                  border: "1px solid #fecdd3",
                  fontSize: "12px",
                }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "12px" }} />
              <ReferenceLine y={10.5} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: "T2 Min: 10.5", fill: "#f43f5e", fontSize: 10 }} />
              <Line type="monotone" dataKey="hb" name="Maternal Hb (g/dL)" stroke="#e11d48" strokeWidth={3} dot={{ r: 5, fill: "#e11d48" }} connectNulls />
              <Line type="monotone" dataKey="target" name="Optimal Target" stroke="#10b981" strokeDasharray="4 4" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="threshold" name="Anemia Threshold" stroke="#ef4444" strokeDasharray="2 2" strokeWidth={1.5} dot={false} />
            </LineChart>
          ) : activeChart === "fetalWeight" ? (
            <AreaChart data={growthCurveData} margin={{ top: 10, right: 20, left: -5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f43f5e" strokeOpacity={0.15} />
              <XAxis dataKey="week" stroke="#9ca3af" fontSize={11} tickLine={false} />
              <YAxis domain={[0, 4000]} stroke="#9ca3af" fontSize={11} tickLine={false} unit="g" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "14px",
                  border: "1px solid #fecdd3",
                  fontSize: "12px",
                }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "12px" }} />
              <Area type="monotone" dataKey="p90" stackId="1" stroke="transparent" fill="#ffe4e6" name="90th Percentile Band" />
              <Area type="monotone" dataKey="p50" stackId="2" stroke="#fda4af" fill="#fecdd3" name="50th Median Curve" />
              <Area type="monotone" dataKey="p10" stackId="3" stroke="#fb7185" fill="#fff1f2" name="10th Percentile Band" />
              <Line type="monotone" dataKey="actual" name="Baby Measured Weight (g)" stroke="#e11d48" strokeWidth={3.5} dot={{ r: 6, fill: "#be123c" }} connectNulls />
            </AreaChart>
          ) : activeChart === "amnioticFluid" ? (
            <LineChart data={afiData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f43f5e" strokeOpacity={0.15} />
              <XAxis dataKey="week" stroke="#9ca3af" fontSize={11} tickLine={false} />
              <YAxis domain={[0, 30]} stroke="#9ca3af" fontSize={11} tickLine={false} unit="cm" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "14px",
                  border: "1px solid #fecdd3",
                  fontSize: "12px",
                }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "12px" }} />
              <ReferenceLine y={8} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: "Min Normal (8 cm)", fill: "#f59e0b", fontSize: 10 }} />
              <ReferenceLine y={18} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: "Max Normal (18 cm)", fill: "#f59e0b", fontSize: 10 }} />
              <ReferenceLine y={5} stroke="#ef4444" strokeDasharray="2 2" label={{ value: "Oligohydramnios (<5)", fill: "#ef4444", fontSize: 10 }} />
              <Line type="monotone" dataKey="afi" name="AFI Measurement (cm)" stroke="#0284c7" strokeWidth={3} dot={{ r: 5, fill: "#0284c7" }} connectNulls />
            </LineChart>
          ) : activeChart === "heartRate" ? (
            <LineChart data={fhrData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f43f5e" strokeOpacity={0.15} />
              <XAxis dataKey="week" stroke="#9ca3af" fontSize={11} tickLine={false} />
              <YAxis domain={[90, 180]} stroke="#9ca3af" fontSize={11} tickLine={false} unit="bpm" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "14px",
                  border: "1px solid #fecdd3",
                  fontSize: "12px",
                }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "12px" }} />
              <ReferenceLine y={110} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "Bradycardia (<110)", fill: "#ef4444", fontSize: 10 }} />
              <ReferenceLine y={160} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: "Tachycardia (>160)", fill: "#f59e0b", fontSize: 10 }} />
              <Line type="monotone" dataKey="fhr" name="Fetal Heart Rate (bpm)" stroke="#ec4899" strokeWidth={3} dot={{ r: 5, fill: "#ec4899" }} />
            </LineChart>
          ) : (
            <LineChart data={ogttData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f43f5e" strokeOpacity={0.15} />
              <XAxis dataKey="stage" stroke="#9ca3af" fontSize={11} tickLine={false} />
              <YAxis domain={[60, 220]} stroke="#9ca3af" fontSize={11} tickLine={false} unit="mg/dL" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "14px",
                  border: "1px solid #fecdd3",
                  fontSize: "12px",
                }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "12px" }} />
              <Line type="monotone" dataKey="patientGlucose" name="Patient Plasma Glucose" stroke="#e11d48" strokeWidth={3.5} dot={{ r: 6, fill: "#e11d48" }} />
              <Line type="monotone" dataKey="cutoffThreshold" name="GDM Diagnostic Cutoff" stroke="#ef4444" strokeDasharray="4 4" strokeWidth={2} dot={{ r: 4, fill: "#ef4444" }} />
              <Line type="monotone" dataKey="optimalTarget" name="Optimal Fasting/1-2hr Target" stroke="#10b981" strokeDasharray="2 2" strokeWidth={1.5} dot={false} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Clinical Interpretation Footnote */}
      <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 text-xs flex items-start gap-2.5">
        <Activity className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
        <div className="text-gray-700 dark:text-rose-200 leading-relaxed">
          {activeChart === "hemoglobin" && (
            <span>
              <strong>Clinical Note on Hemoglobin:</strong> Maternal blood volume expands by ~45% during pregnancy, naturally diluting red blood cells. A physiologic dip to 10.5 g/dL during Trimester 2 is normal; levels below 10.5 g/dL signify iron deficiency anemia requiring elemental iron therapy.
            </span>
          )}
          {activeChart === "fetalWeight" && (
            <span>
              <strong>Clinical Note on Fetal Biometry:</strong> Estimated Fetal Weight (EFW) is derived from Biparietal Diameter (BPD), Head Circumference (HC), Abdominal Circumference (AC), and Femur Length (FL). Stable growth between the 10th and 90th population percentiles indicates adequate placental perfusion.
            </span>
          )}
          {activeChart === "amnioticFluid" && (
            <span>
              <strong>Clinical Note on Amniotic Fluid:</strong> Normal Amniotic Fluid Index (AFI) is 8.0 to 18.0 cm (or Single Deepest Pocket 2.0 to 8.0 cm). AFI &lt; 5.0 cm denotes oligohydramnios, whereas AFI &gt; 24.0 cm indicates polyhydramnios often associated with maternal hyperglycemia.
            </span>
          )}
          {activeChart === "heartRate" && (
            <span>
              <strong>Clinical Note on Fetal Heart Rate:</strong> Normal baseline FHR ranges from 110 to 160 beats per minute. Baseline rate typically decreases mildly from ~160 bpm in early pregnancy to ~130-140 bpm near term as the fetal vagal parasympathetic system matures.
            </span>
          )}
          {activeChart === "ogtt" && (
            <span>
              <strong>Clinical Note on 75g OGTT:</strong> Evaluated according to IADPSG/DIPSI guidelines: Fasting &lt; 92 mg/dL, 1-Hour &lt; 180 mg/dL, 2-Hour &lt; 153 mg/dL. Any single value meeting or exceeding these cutoffs confirms gestational diabetes mellitus (GDM).
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
