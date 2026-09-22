import React, { useState } from "react";
import { Flower2, Send, User, Stethoscope, Utensils, Heart, Activity, ShieldCheck } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

interface Agent {
  id: string;
  name: string;
  role: string;
  icon: any;
  color: string;
  avatarBg: string;
  greeting: string;
}

interface Message {
  id: string;
  sender: "user" | "agent";
  agentName?: string;
  text: string;
  time: string;
}

export const PreconceptionCopilot: React.FC = () => {
  const agents: Agent[] = [
    {
      id: "priya",
      name: "Dr. Priya",
      role: "Reproductive Specialist & Ovulation Guide",
      icon: Stethoscope,
      color: "text-emerald-600",
      avatarBg: "bg-emerald-100 dark:bg-emerald-900/50",
      greeting: "Vanakkam! I'm Dr. Priya. Let's track your ovulation, BBT biphasic shifts, and fertile windows with clinical precision. What's on your mind today?",
    },
    {
      id: "ananya",
      name: "Chef Ananya",
      role: "Preconception Clinical Nutritionist",
      icon: Utensils,
      color: "text-teal-600",
      avatarBg: "bg-teal-100 dark:bg-teal-900/50",
      greeting: "Hello! Chef Ananya here. I specialize in dietary folate, egg-quality superfoods, and Indian dietary staples to thicken your endometrial lining. Hungry for advice?",
    },
    {
      id: "rahul",
      name: "Coach Rahul",
      role: "Partner Vitality & Sperm Health Consultant",
      icon: Activity,
      color: "text-cyan-600",
      avatarBg: "bg-cyan-100 dark:bg-cyan-900/50",
      greeting: "Hey! Coach Rahul here. Remember, conception is 50% sperm health. Let's discuss heat avoidance, zinc, antioxidants, and lifestyle shifts for your partner!",
    },
    {
      id: "maya",
      name: "Counselor Maya",
      role: "Emotional Wellness & Mindful Conception",
      icon: Heart,
      color: "text-rose-600",
      avatarBg: "bg-rose-100 dark:bg-rose-900/50",
      greeting: "Warm hugs. The trying-to-conceive (TTC) journey can feel overwhelming. I'm here to support your mental peace, reduce cortisol, and keep the romance stress-free.",
    },
    {
      id: "kavita",
      name: "Nurse Kavita",
      role: "Lab Diagnostic & Medication Safety Reviewer",
      icon: ShieldCheck,
      color: "text-indigo-600",
      avatarBg: "bg-indigo-100 dark:bg-indigo-900/50",
      greeting: "Hi there! Nurse Kavita here. I help you decode TSH levels, Rubella immunity titers, and prepare your doctor's SBAR brief. What report are you reviewing?",
    },
  ];

  const [activeAgentId, setActiveAgentId] = useState<string>("priya");
  const selectedAgent = agents.find((a) => a.id === activeAgentId) || agents[0];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "agent",
      agentName: selectedAgent.name,
      text: selectedAgent.greeting,
      time: "Just now",
    },
  ]);

  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSelectAgent = (agent: Agent) => {
    setActiveAgentId(agent.id);
    setMessages([
      {
        id: Date.now().toString(),
        sender: "agent",
        agentName: agent.name,
        text: agent.greeting,
        time: "Just now",
      },
    ]);
  };

  const quickPrompts = [
    "When is my peak fertile window this cycle?",
    "How much folic acid should I take daily?",
    "Does my partner need to take any supplements?",
    "What blood tests should I ask my OB-GYN for?",
  ];

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal("");
    setIsTyping(true);

    setTimeout(() => {
      let replyText = "";
      const lower = text.toLowerCase();

      if (lower.includes("folic") || lower.includes("folate")) {
        replyText = "Kandippa bro! Minimum 400 mcg to 800 mcg of daily Folic Acid (or active L-Methylfolate) edukanum. Ideally conception-ku 3 months munnadi start panradhu baby-oda neural tube defect risk-a 70% decrease pannum! Green leafy veggies like Palak and lentils kooda add pannunga.";
      } else if (lower.includes("fertile") || lower.includes("ovulation") || lower.includes("window")) {
        replyText = "Super question! In a typical 28-day cycle, ovulation Day 14 pola nadakkum. But the fertile window is 5 days munnadi irundhu 1 day after (Day 10 to Day 15). Daily cervical mucus clear egg-white maadhiri stretchy-a irundhaa and LH test positive aana, adhu dhaan peak time to try!";
      } else if (lower.includes("partner") || lower.includes("sperm") || lower.includes("husband")) {
        replyText = "Partner health romba important! Spermatogenesis 74 days aagum. So avoid laptops directly on lap, hot baths, and smoking. Take daily Zinc (15mg), Vitamin C, and CoQ10 to boost sperm motility and DNA protection.";
      } else if (lower.includes("blood test") || lower.includes("doctor") || lower.includes("lab")) {
        replyText = "Doctor kitta pogum podhu: 1) TSH (Preconception target strictly < 2.5 mIU/L), 2) Complete Blood Count for anemia, 3) Rubella IgG immunity, 4) Blood Group with Rh factor, and 5) Vitamin D3 & B12 kekkanum. Namma Doctor SBAR brief tab-la idhu print pannikalam!";
      } else {
        replyText = `Romba nalla question! ${selectedAgent.name} here: Preconception stage-la continuous tracking and stress-free mindset dhaan most important. Check your cycle logs in Biomarker Lab, take your daily folate, and have regular intercourse every 1-2 days during the fertile window. Let me know if you need specific advice!`;
      }

      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "agent",
        agentName: selectedAgent.name,
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, agentMsg]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-emerald-950 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/30 text-emerald-200">
              <Flower2 className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">Multi-Specialist AI Team</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">5-Agent Preconception Copilot</h2>
          <p className="text-emerald-100 text-sm mt-1">
            Consult with 5 specialized clinical AI guides dedicated to your reproductive journey.
          </p>
        </div>
      </div>

      {/* Specialist Selector Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {agents.map((agent) => {
          const isActive = agent.id === activeAgentId;
          const Icon = agent.icon;
          return (
            <button
              key={agent.id}
              onClick={() => handleSelectAgent(agent)}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-start gap-2 ${
                isActive
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-white dark:bg-[#15201c] border-emerald-100 dark:border-emerald-900/40 hover:border-emerald-300 text-emerald-950 dark:text-emerald-50"
              }`}
            >
              <div className={`p-2 rounded-xl ${isActive ? "bg-white/20 text-white" : `${agent.avatarBg} ${agent.color}`}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs leading-tight">{agent.name}</h4>
                <p className={`text-[10px] mt-0.5 line-clamp-1 ${isActive ? "text-emerald-100" : "text-emerald-700/70 dark:text-emerald-300/70"}`}>
                  {agent.role}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Chat Box */}
      <Card variant="glass" className="border-emerald-100 dark:border-emerald-900/40 p-4 sm:p-6 flex flex-col h-[520px]">
        {/* Active Specialist Header */}
        <div className="pb-4 border-b border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${selectedAgent.avatarBg} ${selectedAgent.color}`}>
              <selectedAgent.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-emerald-950 dark:text-emerald-50">{selectedAgent.name}</h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">{selectedAgent.role}</p>
            </div>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 font-bold">
            Online & Ready
          </span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
              {m.sender === "agent" && (
                <div className={`w-8 h-8 rounded-full ${selectedAgent.avatarBg} ${selectedAgent.color} flex items-center justify-center flex-shrink-0 mt-1`}>
                  <selectedAgent.icon className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.sender === "user"
                    ? "bg-emerald-600 text-white font-medium rounded-tr-none shadow-sm"
                    : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-950 dark:text-emerald-100 border border-emerald-100 dark:border-emerald-900/40 rounded-tl-none"
                }`}
              >
                {m.sender === "agent" && (
                  <div className="font-bold text-[10px] text-emerald-700 dark:text-emerald-300 mb-1">
                    {m.agentName}
                  </div>
                )}
                {m.text}
                <div className="text-[9px] opacity-60 text-right mt-1">{m.time}</div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 p-2">
              <Activity className="w-4 h-4 animate-spin text-emerald-500" />
              <span>{selectedAgent.name} is formulating response...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="pt-2 pb-3 overflow-x-auto flex gap-2 no-scrollbar">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp)}
              className="text-[11px] px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 whitespace-nowrap font-medium"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 pt-2 border-t border-emerald-100 dark:border-emerald-900/30"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={`Ask ${selectedAgent.name} anything about preconception...`}
            className="flex-1 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-[#15201c] text-xs text-emerald-950 dark:text-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Button
            type="submit"
            variant="primary"
            className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
};
