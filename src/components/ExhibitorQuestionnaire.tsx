import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building, 
  HelpCircle, 
  ShieldCheck, 
  CheckCircle,
  Sparkles,
  ChevronDown,
  Info,
  Layers,
  Zap,
  Briefcase,
  Target
} from "lucide-react";

interface ExhibitorQuestionnaireProps {
  userEmail: string;
  userName: string;
  onComplete: () => void;
}

export default function ExhibitorQuestionnaire({ userEmail, userName, onComplete }: ExhibitorQuestionnaireProps) {
  // Controlled dropdown selections
  const [focusSegment, setFocusSegment] = useState("");
  const [presentationFormat, setPresentationFormat] = useState("");
  const [matchmakingIntent, setMatchmakingIntent] = useState("");
  const [connectivityNeeds, setConnectivityNeeds] = useState("");
  
  // Custom states
  const [openedDropdown, setOpenedDropdown] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const segmentsOptions = [
    { value: "Green Axis", label: "🌿 Green Axis (Precision Agritech & Sustainable CPG)", desc: "Focuses on net-zero soil additives, cellular food synthesis, and carbon sequestration." },
    { value: "Blue Axis", label: "🌊 Blue Axis (Ocean Aquaculture & Seafood Tech)", desc: "Focuses on maritime deep-tech, offshore logistics, algae feed, and ocean-safe packaging." },
    { value: "Tech & AI Integration", label: "🤖 Modern Tech & AI (Digital Twins & Sourcing)", desc: "Focuses on predictive crop models, supply chain ledger tech, and robotic crop picking." }
  ];

  const presentationOptions = [
    { value: "Live Prototypes", label: "🔬 Interactive Hardware & Live Tech Prototypes" },
    { value: "Product Tasting", label: "🌾 Sustainable CPG Product Tastings & Samples" },
    { value: "Digital Deck", label: "📽️ Executive Deck & Continuous Video Pitchcast" },
    { value: "Literature Only", label: "📄 Technical Case Studies & Physical Brochures" }
  ];

  const intentOptions = [
    { value: "Sourcing", label: "💼 Pitching to Venture Capitalists & Green VCs" },
    { value: "Distribution", label: "🤝 Expanding International B2B Wholesale Channels" },
    { value: "Partnership", label: "🔬 Seeking Joint-Venture Academic and R&D Partners" },
    { value: "Regulatory", label: "📋 Aligning with Global Regulatory Policy Advisors" }
  ];

  const connectivityOptions = [
    { value: "Standard Wire", label: "🔌 Standard 110V Outlet + Shared Event Wi-Fi" },
    { value: "High-Load Wired", label: "⚡ Industrial Phase-3 Power + Dedicated Wired Ethernet" },
    { value: "Eco Power", label: "🌱 Eco-friendly Solar Battery Generator (Zero Noise)" },
    { value: "No Power", label: "🚫 Self-powered booth, minimal infrastructure requirements" }
  ];

  const handleToggleSelectDropdown = (id: string) => {
    if (openedDropdown === id) {
      setOpenedDropdown(null);
    } else {
      setOpenedDropdown(id);
    }
  };

  const handleSelectOption = (dropdownId: string, val: string) => {
    if (dropdownId === "segment") setFocusSegment(val);
    if (dropdownId === "presentation") setPresentationFormat(val);
    if (dropdownId === "intent") setMatchmakingIntent(val);
    if (dropdownId === "connectivity") setConnectivityNeeds(val);
    setOpenedDropdown(null);
    setErrorMsg("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!focusSegment || !presentationFormat || !matchmakingIntent || !connectivityNeeds) {
      setErrorMsg("Please answer all questions before submitting your configuration profile.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    // Simulate database write
    setTimeout(() => {
      setIsSubmitting(false);
      setIsDone(true);
      
      // Save to localStorage so it behaves as a true "one time" event for this user
      localStorage.setItem(`ffs_questionnaire_${userEmail}`, JSON.stringify({
        completed: true,
        focusSegment,
        presentationFormat,
        matchmakingIntent,
        connectivityNeeds,
        submittedAt: new Date().toISOString()
      }));

      // Give visual confirmation before executing final onComplete callback
      setTimeout(() => {
        onComplete();
      }, 1500);
    }, 1200);
  };

  // Calculate questionnaire completion score percentage
  const answeredCount = [focusSegment, presentationFormat, matchmakingIntent, connectivityNeeds].filter(Boolean).length;
  const progressPercent = (answeredCount / 4) * 100;

  return (
    <div className="absolute inset-0 z-50 bg-[#06101d]/95 backdrop-blur-md flex flex-col justify-center items-center p-5 selection:bg-[#21c3ce] selection:text-[#06101d]">
      
      {/* Background soft gradients */}
      <div className="absolute top-1/4 left-10 w-44 h-44 bg-[#0a5f6a]/20 blur-3xl pointer-events-none rounded-full"></div>
      <div className="absolute bottom-1/4 right-10 w-44 h-44 bg-[#0e8bd0]/10 blur-3xl pointer-events-none rounded-full"></div>

      <motion.div 
        className="w-full max-w-[370px] bg-[#112338]/90 border border-slate-700/50 rounded-3xl p-5 shadow-2xl text-left relative overflow-hidden"
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
      >
        <AnimatePresence mode="wait">
          {!isDone ? (
            <motion.div
              key="questionnaire-form"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* BRAND HEADER CONTAINER */}
              <div className="flex items-start gap-2.5 pb-3 border-b border-[#1d3557]/80">
                <span className="w-9 h-9 bg-gradient-to-br from-[#0a5f6a] to-[#21c3ce] rounded-xl flex items-center justify-center shadow-lg text-white">
                  <Building size={16} />
                </span>
                <div className="min-w-0">
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#21c3ce]">Exhibitor Onboarding</span>
                  <h3 className="text-xs font-black text-white uppercase tracking-tight">On-site Profile Setup</h3>
                  <p className="text-[9px] text-slate-300 font-medium">Hello, {userName}. Set up booth specifications for accurate matchmaking.</p>
                </div>
              </div>

              {/* DYNAMIC PROGRESS INDICATOR LINE */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[8.5px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>Profile Completion</span>
                  <span className="text-[#21c3ce]">{progressPercent}% Completed</span>
                </div>
                <div className="h-1.5 w-full bg-[#030e14] rounded-full overflow-hidden p-[1px]">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-[#0a5f6a] to-[#21c3ce] rounded-full" 
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* THE FORM PANEL */}
              <form onSubmit={handleSubmit} className="space-y-3 pt-1">
                
                {/* QUESTION 1: FOCUS SEGMENT (Dropdown list selection style) */}
                <div className="relative">
                  <label className="text-[8.5px] font-bold text-slate-400 tracking-wider uppercase block mb-1 flex items-center gap-1.5 ms-0.5">
                    <Layers size={10} className="text-[#0a5f6a]" />
                    <span>Industrial Sector Focus</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleToggleSelectDropdown("segment")}
                    className="w-full bg-[#030e14] hover:bg-[#051722] border border-[#1d3557] rounded-xl p-3 text-left font-bold text-[10px] text-white flex justify-between items-center cursor-pointer transition focus:ring-1 focus:ring-[#21c3ce]"
                  >
                    <span className={focusSegment ? "text-[#21c3ce]" : "text-slate-400"}>
                      {focusSegment 
                        ? segmentsOptions.find(o => o.value === focusSegment)?.label 
                        : "Select Sector Focus Theme..."
                      }
                    </span>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${openedDropdown === "segment" ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {openedDropdown === "segment" && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute left-0 right-0 mt-1 bg-[#051421] border border-slate-700 rounded-xl shadow-2xl z-50 max-h-[170px] overflow-y-auto overflow-x-hidden p-1 space-y-1 scrollbar-thin"
                      >
                        {segmentsOptions.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleSelectOption("segment", opt.value)}
                            className="w-full p-2 text-left hover:bg-[#133054] rounded-lg transition duration-75 text-white active:bg-[#0c243f]"
                          >
                            <div className="text-[9.5px] font-black">{opt.label}</div>
                            <div className="text-[8px] text-slate-400 font-medium leading-relaxed mt-0.5">{opt.desc}</div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* QUESTION 2: VISUAL PRESENTATION FORMAT (Dropdown list option style) */}
                <div className="relative">
                  <label className="text-[8.5px] font-bold text-slate-400 tracking-wider uppercase block mb-1 flex items-center gap-1.5 ms-0.5">
                    <Target size={10} className="text-[#0a5f6a]" />
                    <span>On-Site Presentation Asset</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleToggleSelectDropdown("presentation")}
                    className="w-full bg-[#030e14] hover:bg-[#051722] border border-[#1d3557] rounded-xl p-3 text-left font-bold text-[10px] text-white flex justify-between items-center cursor-pointer transition focus:ring-1 focus:ring-[#21c3ce]"
                  >
                    <span className={presentationFormat ? "text-[#21c3ce]" : "text-slate-400"}>
                      {presentationFormat 
                        ? presentationOptions.find(o => o.value === presentationFormat)?.label 
                        : "Select presentation asset style..."
                      }
                    </span>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${openedDropdown === "presentation" ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {openedDropdown === "presentation" && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute left-0 right-0 mt-1 bg-[#051421] border border-slate-700 rounded-xl shadow-2xl z-50 max-h-[170px] overflow-y-auto overflow-x-hidden p-1 space-y-0.5 scrollbar-thin"
                      >
                        {presentationOptions.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleSelectOption("presentation", opt.value)}
                            className="w-full p-2.5 text-left hover:bg-[#133054] rounded-lg text-white font-bold text-[9.5px] transition duration-75 text-white active:bg-[#0c243f]"
                          >
                            {opt.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* QUESTION 3: GOALS & FUND ADVOCACY (Dropdown list option style) */}
                <div className="relative">
                  <label className="text-[8.5px] font-bold text-slate-400 tracking-wider uppercase block mb-1 flex items-center gap-1.5 ms-0.5">
                    <Briefcase size={10} className="text-[#0a5f6a]" />
                    <span>Sourcing & Matchmaking Strategy</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleToggleSelectDropdown("intent")}
                    className="w-full bg-[#030e14] hover:bg-[#051722] border border-[#1d3557] rounded-xl p-3 text-left font-bold text-[10px] text-white flex justify-between items-center cursor-pointer transition focus:ring-1 focus:ring-[#21c3ce]"
                  >
                    <span className={matchmakingIntent ? "text-[#21c3ce]" : "text-slate-400"}>
                      {matchmakingIntent 
                        ? intentOptions.find(o => o.value === matchmakingIntent)?.label 
                        : "Select primary target contact type..."
                      }
                    </span>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${openedDropdown === "intent" ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {openedDropdown === "intent" && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute left-0 right-0 mt-1 bg-[#051421] border border-slate-700 rounded-xl shadow-2xl z-50 max-h-[170px] overflow-y-auto overflow-x-hidden p-1 space-y-0.5 scrollbar-thin"
                      >
                        {intentOptions.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleSelectOption("intent", opt.value)}
                            className="w-full p-2.5 text-left hover:bg-[#133054] rounded-lg text-white font-bold text-[9.5px] transition duration-75 text-white active:bg-[#0c243f]"
                          >
                            {opt.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* QUESTION 4: ELECTRICITY & CONNECTIVITY REQUIREMENTS (Dropdown list option style) */}
                <div className="relative">
                  <label className="text-[8.5px] font-bold text-slate-400 tracking-wider uppercase block mb-1 flex items-center gap-1.5 ms-0.5">
                    <Zap size={10} className="text-[#0a5f6a]" />
                    <span>Power Grid & Connectivity Requirements</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleToggleSelectDropdown("connectivity")}
                    className="w-full bg-[#030e14] hover:bg-[#051722] border border-[#1d3557] rounded-xl p-3 text-left font-bold text-[10px] text-white flex justify-between items-center cursor-pointer transition focus:ring-1 focus:ring-[#21c3ce]"
                  >
                    <span className={connectivityNeeds ? "text-[#21c3ce]" : "text-slate-400"}>
                      {connectivityNeeds 
                        ? connectivityOptions.find(o => o.value === connectivityNeeds)?.label 
                        : "Select local power output requirements..."
                      }
                    </span>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${openedDropdown === "connectivity" ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {openedDropdown === "connectivity" && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute left-0 right-0 mt-1 bg-[#051421] border border-slate-700 rounded-xl shadow-2xl z-50 max-h-[170px] overflow-y-auto overflow-x-hidden p-1 space-y-0.5 scrollbar-thin"
                      >
                        {connectivityOptions.map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleSelectOption("connectivity", opt.value)}
                            className="w-full p-2.5 text-left hover:bg-[#133054] rounded-lg text-white font-bold text-[9.5px] transition duration-75 text-white active:bg-[#0c243f]"
                          >
                            {opt.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ERROR PANEL */}
                {errorMsg && (
                  <div className="bg-red-950/20 text-red-300 border border-red-900/30 font-bold tracking-wide rounded-xl p-2.5 text-[9.5px] leading-relaxed flex items-start gap-1.5">
                    <Info size={12} className="shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* SUBMIT BUTTON */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-gradient-to-r from-[#0a5f6a] to-[#21c3ce] hover:opacity-90 active:scale-[0.98] text-white font-extrabold rounded-xl text-[10.5px] uppercase tracking-widest transition shadow-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <span>{isSubmitting ? "Uploading Profile..." : "Authorize On-Site Activation"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            /* SUCCESS CONFIRMATION PANEL */
            <motion.div
              key="questionnaire-success"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-6 space-y-4 flex flex-col items-center justify-center"
            >
              <div className="w-16 h-16 bg-[#21c3ce]/10 border border-[#21c3ce]/30 rounded-full flex items-center justify-center relative">
                <motion.div 
                  className="absolute inset-0 bg-[#21c3ce]/20 rounded-full"
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <CheckCircle size={32} className="text-[#21c3ce] relative z-10" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-sm font-black text-white uppercase tracking-wider">Gateway Configuration Locked</h4>
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed px-2">
                  Thank you, {userName}. Your corporate preferences are optimized. Cross-network synergy matching scores are processing under the B2B Economy.
                </p>
              </div>

              <div className="w-40 h-1.5 bg-[#030e14] rounded-full overflow-hidden p-[1.5px] shrink-0">
                <motion.div 
                  className="h-full bg-emerald-500 rounded-full" 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.1 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
