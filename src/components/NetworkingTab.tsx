import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  CheckCircle, 
  RefreshCw, 
  Award, 
  Send, 
  Briefcase, 
  Layers, 
  DollarSign, 
  Heart,
  ChevronRight,
  BookOpen,
  User,
  ExternalLink
} from "lucide-react";
import { B2BMatchResult, RecommendedExhibitor } from "../types";

const defaultQuestions = {
  goal: "Find technology partners for cellular bioreactors",
  track: "Tech & Innovation",
  budget: "$100K – $500K"
};

export default function NetworkingTab({ 
  userName = "Alexander Sterling", 
  userCompany = "Food Forward Solutions", 
  userRole = "Attendee" 
}: { 
  userName?: string; 
  userCompany?: string; 
  userRole?: string;
}) {
  const [goal, setGoal] = useState(defaultQuestions.goal);
  const [track, setTrack] = useState(defaultQuestions.track);
  const [budget, setBudget] = useState(defaultQuestions.budget);
  
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<B2BMatchResult | null>(null);
  const [error, setError] = useState("");
  
  // Simulated Chat dialog open states
  const [activeChatExhibitorId, setActiveChatExhibitorId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [sentChats, setSentChats] = useState<Record<string, string[]>>({});

  const handleGenerateMatches = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/matchmaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName,
          company: userCompany,
          goal,
          track,
          tier: budget
        })
      });

      if (!response.ok) {
        throw new Error("Matchmaking handshake aborted.");
      }

      const data = await response.json();
      setMatchResult(data);
      setIsOnboarded(true);
    } catch (err: any) {
      setError("AI model is currently busy. Please try compiling again or reloading.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendChatMessage = (exhibitorId: string) => {
    if (!chatMessage.trim()) return;
    setSentChats(prev => ({
      ...prev,
      [exhibitorId]: [...(prev[exhibitorId] || []), chatMessage]
    }));
    setChatMessage("");
    setTimeout(() => {
      // Auto reply mock from matches
      setSentChats(prev => ({
        ...prev,
        [exhibitorId]: [
          ...(prev[exhibitorId] || []), 
          "Received! Thank you for reaching out via Gemini Matchmaker. Let's schedule a brief call at our Booth tomorrow."
        ]
      }));
    }, 1250);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden pb-4 gap-3">
      
      {/* Header Info */}
      <div className="shrink-0 bg-white rounded-2xl border border-slate-200/50 p-3 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-1">
            <Sparkles size={13} className="text-emerald-700 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-800">Gemini Matchmaking Hub</span>
          </div>
          <p className="text-[10px] text-slate-500 font-bold">Cross-vector embeddings suggest matches for your enterprise.</p>
        </div>
        <button 
          onClick={() => {
            setIsOnboarded(false);
            setMatchResult(null);
          }}
          className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-[9px] font-extrabold uppercase tracking-wider text-slate-600 transition"
        >
          Reset Hub
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-0.5 space-y-3.5 scrollbar-thin">
        
        {!isOnboarded ? (
          /* ONBOARDING SURVEY FORM */
          <motion.form 
            onSubmit={handleGenerateMatches}
            className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm space-y-4"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-center pb-2 border-b border-slate-150">
              <span className="text-[16px]">🧬</span>
              <h3 className="text-xs font-black text-slate-900 mt-0.5">Let Gemini Align Your Interactions</h3>
              <p className="text-[9.5px] text-slate-400 mt-1">Specify your current business parameters to discover maximum B2B synergy in Milano.</p>
            </div>

            <div className="space-y-3.5">
              {/* Question 1: Goals */}
              <div>
                <label className="text-[9px] font-black uppercase text-emerald-850 block mb-1">
                  1. Corporate Objective & Target Interests
                </label>
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Sourcing seaweed packaging composite partners or raising VC agritech funds..."
                  className="w-full bg-slate-50/50 border border-slate-200 text-xs rounded-xl px-3 py-2.5 resize-none h-20 focus:ring-1 focus:ring-emerald-700 font-bold focus:bg-white"
                  required
                />
              </div>

              {/* Question 2: Track Select */}
              <div>
                <label className="text-[9px] font-black uppercase text-emerald-850 block mb-1">
                  2. Focus Track Selection
                </label>
                <select
                  value={track}
                  onChange={(e) => setTrack(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 text-xs rounded-xl px-3 py-3 font-semibold focus:ring-1 focus:ring-emerald-700 focus:bg-white"
                >
                  <option value="Tech & Innovation">Tech & Innovation (Lab scaling, cellular protein)</option>
                  <option value="Sustainability & Packaging">Sustainability & Packaging (Compostable polymer algae)</option>
                  <option value="Supply Chain & Automation">Supply Chain & Automation (Hardware, robotics, UAV)</option>
                  <option value="Consumer & Regulatory">Consumer & Regulatory (Geofence compliance audits)</option>
                </select>
              </div>

              {/* Question 3: Budget Tier Tier */}
              <div>
                <label className="text-[9px] font-black uppercase text-emerald-850 block mb-1">
                  3. Project Sourcing Capacity / Budget
                </label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 text-xs rounded-xl px-3 py-3 font-semibold focus:ring-1 focus:ring-emerald-700 focus:bg-white"
                >
                  <option value="Pre-revenue">Pre-revenue / Early Sourcing Research</option>
                  <option value="$100K – $500K">$100K – $500K (Standard Pilot Operations)</option>
                  <option value="$500K – $2M">$500K – $2M (Scaled Regional Rollout)</option>
                  <option value="Over $2M">Over $2M (Multi-facility Enterprise Infrastructure)</option>
                </select>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-[9.5px] font-bold text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-900 hover:bg-emerald-850 disabled:bg-[#1a382e] text-white font-black rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Computing Vector Match scores...</span>
                </>
              ) : (
                <>
                  <span>Align Embeddings Network</span>
                  <ChevronRight size={13} />
                </>
              )}
            </button>
          </motion.form>
        ) : (
          /* MATCH RESULTS SCREEN */
          <div className="space-y-4">
            
            {/* Greeting Header */}
            {matchResult && (
              <motion.div 
                className="bg-emerald-950 text-emerald-50 rounded-2xl p-4 border border-emerald-900 overflow-hidden relative"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Decorative mesh */}
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-emerald-600/30 rounded-full blur-xl"></div>
                <div className="relative z-10 space-y-1.5">
                  <div className="inline-flex items-center gap-1 bg-emerald-900 px-2 py-0.5 rounded-full text-[8.5px] font-extrabold uppercase tracking-wider text-amber-300">
                    🧬 Gemini Vector Aligned
                  </div>
                  <p className="text-xs leading-relaxed font-bold text-slate-100">
                    "{matchResult.welcomeMessage}"
                  </p>
                  <div className="pt-2 border-t border-emerald-900/30 text-[9px] font-bold text-emerald-200">
                    PRIMARY MATCHING CHANNEL: <span className="text-white font-black">{matchResult.primaryTrackRecommended.toUpperCase()}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Matchings List */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black tracking-wider uppercase text-slate-400">Top 3 Suggested B2B Exhibitor Partnerships</h4>
              
              {matchResult?.recommendedExhibitors && matchResult.recommendedExhibitors.map((rec: RecommendedExhibitor, idx: number) => {
                const colors = idx === 0 ? "border-amber-400 ring-2 ring-amber-400/5 bg-amber-50/50" : "border-slate-200/60 bg-white";
                const badgeColor = idx === 0 ? "bg-amber-400 text-amber-950" : "bg-emerald-50 text-emerald-800";
                const isChating = activeChatExhibitorId === rec.exhibitorId;

                return (
                  <motion.div
                    key={rec.exhibitorId}
                    className={`rounded-2xl border p-3.5 shadow-sm space-y-2.5 relative overflow-hidden transition-all duration-200 ${colors}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    {/* Header rank */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h5 className="text-xs font-black text-slate-900">{rec.exhibitorName}</h5>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider ${badgeColor}`}>
                            {idx === 0 ? "Top Affinity Match" : "Highly Recommended"}
                          </span>
                        </div>
                        <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest">BOOTH REF: {rec.exhibitorId.split("_")[1]?.toUpperCase() || "B-4"}</span>
                      </div>
                      
                      {/* Score Badge */}
                      <div className="bg-[#e6fbf3] text-emerald-850 font-mono font-black text-xs px-2.5 py-1 rounded-xl">
                        {rec.matchScore}% Synergy
                      </div>
                    </div>

                    {/* Reasoning explanation */}
                    <p className="text-[11px] leading-relaxed text-slate-650 font-semibold bg-white/70 p-2.5 rounded-xl border border-slate-150 shadow-inner">
                      💡 <strong>Alignment Reason:</strong> {rec.matchReason}
                    </p>

                    {/* Action Panel */}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1 text-[9.5px] font-extrabold text-emerald-800">
                        <CheckCircle size={11} />
                        <span>Profile Updates Synced</span>
                      </div>
                      
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setActiveChatExhibitorId(isChating ? null : rec.exhibitorId)}
                          className="px-3.5 py-1.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-lg text-[9px] font-black uppercase tracking-wider active:scale-95 transition"
                        >
                          {isChating ? "Close Chat" : "Connect Chat"}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Simulated Chat box inside card (FB5 minimalist) */}
                    <AnimatePresence>
                      {isChating && (
                        <motion.div 
                          className="pt-3 border-t border-dashed border-slate-205 mt-2 space-y-3 bg-slate-50/50 -mx-3.5 -mb-3.5 p-3.5"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          {/* Messages sequence */}
                          <div className="space-y-2 max-h-[110px] overflow-y-auto pr-1">
                            <div className="p-2 border border-slate-200 bg-white rounded-xl text-left">
                              <span className="text-[8px] font-mono text-slate-400 block font-bold leading-none mb-1">SYSTEM HANDSHAKE</span>
                              <span className="text-[10px] font-bold text-slate-700">
                                Connect channel established with {rec.exhibitorName} team regarding goal: "{goal.slice(0, 45)}...".
                              </span>
                            </div>

                            {sentChats[rec.exhibitorId]?.map((m, mIdx) => {
                              const isRespondent = mIdx % 2 === 1;
                              const bubbleColor = isRespondent ? "bg-white border border-slate-200 text-slate-900" : "bg-emerald-800 text-white self-end";
                              return (
                                <div key={mIdx} className={`p-2 max-w-[85%] rounded-xl text-[10px] font-semibold tracking-wide shadow-sm ${bubbleColor} ${isRespondent ? "mr-auto" : "ml-auto"}`}>
                                  {m}
                                </div>
                              );
                            })}
                          </div>

                          {/* Controls input */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={chatMessage}
                              onChange={(e) => setChatMessage(e.target.value)}
                              placeholder={`Message ${rec.exhibitorName.split(" ")[0]} team...`}
                              className="flex-grow bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] font-bold focus:outline-emerald-800"
                            />
                            <button
                              onClick={() => handleSendChatMessage(rec.exhibitorId)}
                              className="p-1 px-3 bg-slate-950 text-white rounded-lg text-[9px] font-black uppercase flex items-center justify-center"
                            >
                              Send
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </motion.div>
                );
              })}
            </div>

            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 flex justify-between items-center text-[10px] text-slate-500 font-bold">
              <span>🎯 Survey parameters can be updated above at any time.</span>
              <button 
                onClick={() => {
                  setIsOnboarded(false);
                  setMatchResult(null);
                }}
                className="text-emerald-800 font-black cursor-pointer uppercase text-[9px]"
              >
                Modify Survey
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
