import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { BookOpen, GraduationCap, HelpCircle, CheckCircle2, XCircle, Sparkles, ChevronRight, Award } from "lucide-react";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "When should you head to the hospital using the 5-1-1 labor rule?",
    options: [
      "Contractions are 10 mins apart lasting 30 secs for 30 mins",
      "Contractions are 5 mins apart, lasting 1 min each, for 1 full hour",
      "Contractions are 2 mins apart lasting 10 secs for 2 hours",
      "Only when the water breaks regardless of contractions",
    ],
    correctIndex: 1,
    explanation: "The 5-1-1 rule indicates active labor: contractions arriving every 5 minutes, lasting 1 minute each, sustained for 1 hour.",
  },
  {
    id: 2,
    question: "Which sleeping position is clinically recommended during the 3rd trimester?",
    options: [
      "Flat on your back (Supine)",
      "Flat on your stomach (Prone)",
      "Left side-lying (SOS position) with pillow between knees",
      "Sitting completely upright",
    ],
    correctIndex: 2,
    explanation: "Left side-lying keeps pressure off the Inferior Vena Cava (IVC) vein, maximizing uterine blood flow and kidney filtration.",
  },
];

export const EducationClassesPage: React.FC = () => {
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState<"classes" | "articles" | "quiz">("classes");
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleSelectOption = (qId: number, optIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const calculateScore = () => {
    let score = 0;
    QUIZ_QUESTIONS.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) score += 1;
    });
    return score;
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rose-100 dark:border-rose-900/30 pb-4">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-xs font-bold uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            <span>Maternal Education & Class Curriculum</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-rose-100 mt-1">
            Pregnancy Education Center & Childbirth Classes
          </h1>
          <p className="text-xs text-gray-500 dark:text-rose-300 mt-1">
            Master labor stages, pain management strategies, fetal growth science, and test your readiness with interactive quizzes.
          </p>
        </div>

        {/* Tab Switchers */}
        <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 p-1.5 rounded-2xl border border-rose-200 dark:border-rose-900/40 shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab("classes")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === "classes" ? "bg-rose-500 text-white shadow-sm" : "text-gray-600 dark:text-rose-300"
            }`}
          >
            Preparation Classes
          </button>

          <button
            onClick={() => setActiveTab("articles")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === "articles" ? "bg-rose-500 text-white shadow-sm" : "text-gray-600 dark:text-rose-300"
            }`}
          >
            Weekly Guides
          </button>

          <button
            onClick={() => setActiveTab("quiz")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === "quiz" ? "bg-rose-500 text-white shadow-sm" : "text-gray-600 dark:text-rose-300"
            }`}
          >
            Maternal Quiz
          </button>
        </div>
      </div>

      {/* TAB 1: PREPARATION CLASSES */}
      {activeTab === "classes" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              classNum: "Class 01",
              title: "Understanding Labor Stages & Cervical Dilation",
              desc: "Covers Latent Labor (0-6 cm), Active Labor (6-10 cm), Transition, Pushing, and Placental Delivery.",
              topics: ["Contraction timing & 5-1-1 rule", "Effacement vs Dilation", "Water breaking (Amniotic fluid check)"],
            },
            {
              classNum: "Class 02",
              title: "Pain Relief & Optimal Birth Positions",
              desc: "Explore Epidurals, Gas & Air, water labor, and gravity-assisted positioning like squats and side-lying.",
              topics: ["Epidural analgesia mechanics", "Breathing & counterpressure", "Birth ball rocking"],
            },
            {
              classNum: "Class 03",
              title: "Hospital Admission & Newborn Golden Hour",
              desc: "Step-by-step walk through hospital triaging, pre-registration documents, and immediate skin-to-skin bonding.",
              topics: ["Pre-registration checklist", "Apgar score explanation", "First breastfeeding latch"],
            },
          ].map((cls, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-500">
                  {cls.classNum}
                </span>
                <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-rose-100">
                  {cls.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-rose-300 leading-relaxed">{cls.desc}</p>

                <div className="space-y-1.5 pt-2 border-t border-black/5 dark:border-white/5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Key Modules:</span>
                  {cls.topics.map((top, i) => (
                    <div key={i} className="text-xs font-semibold text-rose-800 dark:text-rose-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{top}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => showToast(`Enrolled in ${cls.title}!`)}
                className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Enroll / Watch Class
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: ARTICLES */}
      {activeTab === "articles" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: "Third Trimester Red Flags & Warning Signs",
              category: "Clinical Alert",
              readTime: "4 min read",
              snippet: "Learn when to contact your OB-GYN immediately regarding reduced fetal movement, severe headaches, visual disturbances, or vaginal bleeding.",
            },
            {
              title: "Fetal Lung Development & Surfactant Growth",
              category: "Fetal Science",
              readTime: "5 min read",
              snippet: "How baby's lungs mature during Weeks 32 to 36 with pulmonary surfactant coating alveoli for breathing atmospheric air.",
            },
          ].map((art, idx) => (
            <div key={idx} className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-[10px] font-extrabold uppercase text-rose-500">
                <span>{art.category}</span>
                <span className="text-gray-400">{art.readTime}</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-rose-100">{art.title}</h3>
              <p className="text-xs text-gray-500 dark:text-rose-300 leading-relaxed">{art.snippet}</p>
              <button
                onClick={() => showToast(`Opening article: ${art.title}`)}
                className="text-xs font-bold text-rose-500 flex items-center gap-1 pt-2 hover:underline"
              >
                <span>Read Full Article</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: QUIZ */}
      {activeTab === "quiz" && (
        <div className="bg-white dark:bg-[#1a1523] p-6 rounded-3xl border border-rose-100 dark:border-rose-900/40 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
            <div>
              <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-rose-100">
                Maternal Readiness Self-Assessment Quiz
              </h3>
              <p className="text-xs text-gray-500 dark:text-rose-300">
                Test your knowledge on labor rules, safe positions, and hospital protocols.
              </p>
            </div>

            {showResults && (
              <div className="px-4 py-2 bg-rose-500 text-white rounded-2xl font-bold text-xs flex items-center gap-2 shadow-md">
                <Award className="w-4 h-4" />
                <span>Score: {calculateScore()} / {QUIZ_QUESTIONS.length} Correct</span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {QUIZ_QUESTIONS.map((q) => (
              <div key={q.id} className="space-y-3 p-4 rounded-2xl bg-rose-50/30 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                <div className="font-bold text-sm text-gray-900 dark:text-rose-100">
                  {q.id}. {q.question}
                </div>

                <div className="grid grid-cols-1 gap-2 text-xs">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[q.id] === optIdx;
                    const isCorrect = q.correctIndex === optIdx;

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`p-3 rounded-xl border text-left font-semibold transition-all ${
                          showResults
                            ? isCorrect
                              ? "bg-emerald-600 text-white border-emerald-700"
                              : isSelected
                              ? "bg-red-600 text-white border-red-700"
                              : "bg-white/50 dark:bg-black/20 text-gray-600 dark:text-rose-300"
                            : isSelected
                            ? "bg-rose-500 text-white border-rose-600 shadow-xs"
                            : "bg-white dark:bg-[#1a1523] border-rose-100 dark:border-rose-900/40 text-gray-800 dark:text-rose-200"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {showResults && (
                  <p className="text-xs text-rose-700 dark:text-rose-300 font-medium pt-1">
                    Clinical Rationale: {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setShowResults(true);
              showToast("Quiz evaluated!");
            }}
            className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-2xl shadow-md"
          >
            Submit & Evaluate Score
          </button>
        </div>
      )}
    </div>
  );
};
