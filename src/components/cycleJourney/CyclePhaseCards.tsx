import React from "react";

export interface CyclePhaseCardsProps {
  selectedDay: number;
  cycleLength: number;
  periodDuration: number;
  estimatedOvulationDay: number;
}

export const CyclePhaseCards: React.FC<CyclePhaseCardsProps> = ({
  selectedDay,
  cycleLength,
  periodDuration,
  estimatedOvulationDay,
}) => {
  // Calculate dynamic phase day boundaries
  const fertileStart = Math.max(1, estimatedOvulationDay - 4);
  const fertileEnd = Math.min(cycleLength, estimatedOvulationDay + 1);
  const follicularEnd = Math.max(periodDuration + 1, fertileStart - 1);

  const phases = [
    {
      id: "menstruation",
      number: "1",
      title: "Menstruation",
      rangeText: `D1 – D${periodDuration}`,
      isActive: selectedDay >= 1 && selectedDay <= periodDuration,
      bgColor: "bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50",
      activeRing: "ring-2 ring-rose-500 shadow-md scale-[1.02]",
      badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200",
      bullets: [
        "Uterine lining sheds & resets",
        "Hormone levels are low",
        "Rest & self-care recommended",
      ],
    },
    {
      id: "follicular",
      number: "2",
      title: "Egg Preparation",
      rangeText: `D${periodDuration + 1} – D${follicularEnd}`,
      isActive: selectedDay > periodDuration && selectedDay < fertileStart,
      bgColor: "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50",
      activeRing: "ring-2 ring-emerald-500 shadow-md scale-[1.02]",
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200",
      bullets: [
        "New egg cell prepares",
        "Uterine lining rebuilds",
        "Energy levels improve",
      ],
    },
    {
      id: "fertile",
      number: "3",
      title: "Fertile Window",
      rangeText: `D${fertileStart} – D${fertileEnd}`,
      isActive: selectedDay >= fertileStart && selectedDay <= fertileEnd && selectedDay !== estimatedOvulationDay,
      bgColor: "bg-cyan-50/80 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-900/50",
      activeRing: "ring-2 ring-cyan-500 shadow-md scale-[1.02]",
      badgeColor: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-200",
      bullets: [
        "Egg cell reaches maturity",
        "Cervical mucus becomes fertile",
        "Highest chance of conception",
      ],
    },
    {
      id: "ovulation",
      number: "4",
      title: "Egg Release",
      rangeText: `D${estimatedOvulationDay} (Peak)`,
      isActive: selectedDay === estimatedOvulationDay,
      bgColor: "bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50",
      activeRing: "ring-2 ring-amber-500 shadow-md scale-[1.02]",
      badgeColor: "bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 font-bold",
      bullets: [
        "Egg is released from ovary",
        "Fertility is at its peak",
        "Egg stays viable for 12–24 hrs",
      ],
    },
    {
      id: "luteal",
      number: "5",
      title: "Post-Ovulation",
      rangeText: `D${fertileEnd + 1} – D${cycleLength}`,
      isActive: selectedDay > fertileEnd,
      bgColor: "bg-purple-50/80 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/50",
      activeRing: "ring-2 ring-purple-500 shadow-md scale-[1.02]",
      badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200",
      bullets: [
        "Body produces nourishing hormones",
        "Lining stays thick & supportive",
        "Cycle prepares to refresh if no conception",
      ],
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="font-extrabold text-base text-rose-950 dark:text-rose-100">
        The 5 Phases of Your Cycle
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {phases.map((p) => (
          <div
            key={p.id}
            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${p.bgColor} ${
              p.isActive ? p.activeRing : "opacity-85 hover:opacity-100"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="font-extrabold text-xs text-rose-950 dark:text-rose-100">
                  {p.number}. {p.title}
                </span>
              </div>

              <div className="mb-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.badgeColor}`}>
                  {p.rangeText}
                </span>
              </div>

              <ul className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
                {p.bullets.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
