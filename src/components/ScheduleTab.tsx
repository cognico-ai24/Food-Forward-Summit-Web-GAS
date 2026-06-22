import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, MapPin, Tag, Bookmark, Check, ChevronDown, ChevronUp, Download, Sparkles, AlertTriangle, Languages, Plus, PlusCircle } from "lucide-react";
import { initialSessions } from "../data";
import { AgendaSession } from "../types";

// Static translations helper for bilingual presentation
const frTranslations: Record<string, { title: string; desc: string; loc: string }> = {
  "Session 1: Opening Plenary & Keynote Address": {
    title: "Session 1 : Plénière d'ouverture et discours d'orientation",
    desc: "Plongez dans les tendances d'investissement et de distribution agroalimentaire de 2026. Découvrez les innovations durables déployées à l'échelle de l'UE et rencontrez les régulateurs de la chaîne d'approvisionnement.",
    loc: "Auditorium Principal"
  },
  "Agritech Investment Panel & Pitches": {
    title: "Panel d'investissement Agritech et présentations",
    desc: "Présentations de startups en phase de démarrage démontrant des drones agricoles autonomes, des robots de désherbage de précision et des solutions de télédétection par satellite.",
    loc: "Salle d'Innovation B"
  },
  "Regenerative Agriculture Workshops": {
    title: "Ateliers d'agriculture régénératrice",
    desc: "Séances d’apprentissage interactives et pratiques dirigées par des scientifiques renommé sur la restauration microbiologique des sols et le captage du carbone.",
    loc: "Pavillon Éco"
  },
  "Smart Cold-Chain Logistics roundtable": {
    title: "Table ronde sur la logistique intelligente de la chaîne du froid",
    desc: "Débats interactifs sur les emballages hermétiques compostables protecteurs d'oxygène, le suivi RFID actif et la gestion du transit maritime.",
    loc: "Salle d'Innovation B"
  },
  "B2B Sourcing Matchmaking & Closing": {
    title: "Rencontres de Sourcing B2B et clôture",
    desc: "Ressource de réseautage exclusive facilitée par Gemini AI pour sceller de nouveaux contrats de distribution agroalimentaire.",
    loc: "Auditorium Principal"
  }
};

interface ScheduleTabProps {
  bookmarkedIds: string[];
  onToggleBookmark: (id: string) => void;
  userRole?: string;
}

export default function ScheduleTab({ bookmarkedIds, onToggleBookmark, userRole = "Attendee" }: { bookmarkedIds: string[]; onToggleBookmark: (id: string) => void; userRole?: string }) {
  const [sessions, setSessions] = useState<AgendaSession[]>(() => {
    const saved = localStorage.getItem("ffs_sessions");
    return saved ? JSON.parse(saved) : initialSessions;
  });

  const [selectedTrack, setSelectedTrack] = useState<string>("All");
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [language, setLanguage] = useState<"EN" | "FR">("EN");

  // Admin New Session Creation Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSpeaker, setNewSpeaker] = useState("");
  const [newSpeakerRole, setNewSpeakerRole] = useState("");
  const [newStartTime, setNewStartTime] = useState("09:00 AM");
  const [newEndTime, setNewEndTime] = useState("10:00 AM");
  const [newTrack, setNewTrack] = useState("Tech & Innovation");
  const [newLocation, setNewLocation] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newAttachmentUrl, setNewAttachmentUrl] = useState("");

  const isAdmin = userRole === "Admin";

  useEffect(() => {
    localStorage.setItem("ffs_sessions", JSON.stringify(sessions));
  }, [sessions]);

  // Available unique tracks
  const tracks = ["All", "Tech & Innovation", "Sustainability & Packaging", "Supply Chain & Automation", "Consumer & Regulatory"];

  // Filter sessions
  const filteredSessions = selectedTrack === "All"
    ? sessions
    : sessions.filter(s => s.track === selectedTrack);

  const toggleExpand = (id: string) => {
    setExpandedSessionId(prev => (prev === id ? null : id));
  };

  // 1. CONFLICT DETECTION LOGIC - checking if bookmarked times overlap!
  // Simple check: we index bookmarked sessions by start time
  const getConflictWarning = () => {
    if (bookmarkedIds.length <= 1) return null;
    
    const savedSessions = sessions.filter(s => bookmarkedIds.includes(s.id));
    const conflicts: string[] = [];

    for (let i = 0; i < savedSessions.length; i++) {
      for (let j = i + 1; j < savedSessions.length; j++) {
        const s1 = savedSessions[i];
        const s2 = savedSessions[j];
        // If they share the exact same start time, they overlap conflict!
        if (s1.startTime === s2.startTime) {
          conflicts.push(`"${s1.title}" clashing with "${s2.title}" at ${s1.startTime}`);
        }
      }
    }
    return conflicts.length > 0 ? conflicts : null;
  };

  const conflicts = getConflictWarning();

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSpeaker.trim() || !newSpeakerRole.trim() || !newLocation.trim() || !newDescription.trim()) {
      alert("Please fill in all requested fields to configure a valid schedule presentation slot.");
      return;
    }

    const newSession: AgendaSession = {
      id: "session_" + Date.now(),
      title: newTitle.trim(),
      speaker: newSpeaker.trim(),
      speakerRole: newSpeakerRole.trim(),
      startTime: newStartTime.trim(),
      endTime: newEndTime.trim(),
      track: newTrack,
      location: newLocation.trim(),
      description: newDescription.trim(),
      isBookmarked: false,
      attachmentUrl: newAttachmentUrl.trim() ? newAttachmentUrl.trim() : null
    };

    setSessions(prev => [newSession, ...prev]);

    // Reset fields
    setNewTitle("");
    setNewSpeaker("");
    setNewSpeakerRole("");
    setNewStartTime("09:00 AM");
    setNewEndTime("10:00 AM");
    setNewLocation("");
    setNewDescription("");
    setNewAttachmentUrl("");
    setIsFormOpen(false);
  };

  // 2. ICS FILE SYNC FILE BUILDER
  const handleExportICS = () => {
    if (bookmarkedIds.length === 0) {
      alert("Please bookmark/save at least one session to export to your device calendar.");
      return;
    }

    const savedSessions = sessions.filter(s => bookmarkedIds.includes(s.id));
    
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Food Forward Summit//NONSGML v1.0//EN\n";
    
    savedSessions.forEach(session => {
      icsContent += "BEGIN:VEVENT\n";
      icsContent += `SUMMARY:${session.title.replace(/,/g, "\\,")}\n`;
      icsContent += `DESCRIPTION:${session.description.replace(/,/g, "\\,")}\n`;
      icsContent += `LOCATION:${session.location.replace(/,/g, "\\,")}\n`;
      // Simply mock timestamps for Milano Oct 14 2026
      const startHour = session.startTime.includes("AM") ? parseInt(session.startTime) : parseInt(session.startTime) + 12;
      const formattedHour = startHour.toString().padStart(2, '0');
      icsContent += `DTSTART:20261014T${formattedHour}0000Z\n`;
      icsContent += `DTEND:20261014T${(startHour + 1).toString().padStart(2, '0')}0000Z\n`;
      icsContent += "END:VEVENT\n";
    });

    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", "FoodForward2026_MySchedule.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden pb-4 gap-3">
      
      {/* LANGUAGE SELECTOR & EXPORT ROW */}
      <div className="shrink-0 flex justify-between items-center bg-white p-2.5 rounded-2xl border border-slate-200/50">
        <div className="flex items-center gap-1.5">
          <Languages size={13} className="text-emerald-800" />
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Bilingual Track</span>
          
          <div className="flex bg-slate-100 p-0.5 rounded-lg shrink-0 ml-1">
            <button 
              onClick={() => setLanguage("EN")}
              className={`text-[8.5px] px-2 py-0.5 font-bold rounded ${language === "EN" ? "bg-emerald-900 text-white font-extrabold" : "text-slate-500"}`}
            >
              EN 🇬🇧
            </button>
            <button 
              onClick={() => setLanguage("FR")}
              className={`text-[8.5px] px-2 py-0.5 font-bold rounded ${language === "FR" ? "bg-emerald-900 text-white font-extrabold" : "text-slate-500"}`}
            >
              FR 🇫🇷
            </button>
          </div>
        </div>

        <button
          onClick={handleExportICS}
          className="p-1 px-3 bg-slate-900 hover:bg-slate-850 text-white text-[8.5px] font-black uppercase tracking-wider rounded-lg transition active:scale-95 flex items-center gap-1"
        >
          <Download size={10} />
          <span>Sync Calendar (.ics)</span>
        </button>
      </div>

      {/* ADMIN REQ: CONFIGURE AGENDA SESSIONS PANEL */}
      {isAdmin && (
        <div className="shrink-0 bg-white border border-slate-200/65 rounded-2xl p-3.5 shadow-sm space-y-2.5">
          <div className="flex justify-between items-center bg-transparent border-none">
            <div className="flex items-center gap-1.5 text-left">
              <span className="text-sm">📅</span>
              <div>
                <h3 className="text-[11px] font-black uppercase text-slate-800 tracking-wider">Configure Agenda Sessions</h3>
                <p className="text-[8.5px] text-slate-400 font-bold leading-none mt-0.5">Admin-only: Create summit presentation slots</p>
              </div>
            </div>
            <button
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="px-2.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-wider rounded-xl transition flex items-center gap-1 cursor-pointer"
            >
              <Plus size={10} />
              <span>{isFormOpen ? "Close Form" : "Create Event"}</span>
            </button>
          </div>

          <AnimatePresence>
            {isFormOpen && (
              <motion.form
                onSubmit={handleCreateSession}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-2.5 pt-2 border-t border-slate-100"
              >
                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className="col-span-2">
                    <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Session / Presentation Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Keynote: Lab-grown Protein Scaling"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full text-[11px] font-medium border border-slate-200 px-2.5 py-1.5 rounded-lg bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Speaker / Presenter Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Elena Rostova"
                      value={newSpeaker}
                      onChange={(e) => setNewSpeaker(e.target.value)}
                      className="w-full text-[11px] font-medium border border-slate-200 px-2.5 py-1.5 rounded-lg bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Speaker Corporate Role *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chief Biotech Officer"
                      value={newSpeakerRole}
                      onChange={(e) => setNewSpeakerRole(e.target.value)}
                      className="w-full text-[11px] font-medium border border-slate-200 px-2.5 py-1.5 rounded-lg bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Start Time *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 09:15 AM"
                      value={newStartTime}
                      onChange={(e) => setNewStartTime(e.target.value)}
                      className="w-full text-[11px] font-medium border border-slate-200 px-2.5 py-1.5 rounded-lg bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">End Time *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 10:30 AM"
                      value={newEndTime}
                      onChange={(e) => setNewEndTime(e.target.value)}
                      className="w-full text-[11px] font-medium border border-slate-200 px-2.5 py-1.5 rounded-lg bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Presentation Track / Cluster *</label>
                    <select
                      value={newTrack}
                      onChange={(e) => setNewTrack(e.target.value)}
                      className="w-full text-[11px] font-medium border border-slate-200 px-2.5 py-1.5 rounded-lg bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                    >
                      {tracks.filter(t => t !== "All").map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Location Room / Stage *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hall A (Main Stage)"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="w-full text-[11px] font-medium border border-slate-200 px-2.5 py-1.5 rounded-lg bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Abstract / Description Notes *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Identify core presentation themes, technologies discussed, and key objectives..."
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="w-full text-[11px] font-medium border border-slate-200 p-2 rounded-lg bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-emerald-800 resize-none"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Supplemental PDF Link (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Deep_Dive_Agrigenomics_2026.pdf"
                      value={newAttachmentUrl}
                      onChange={(e) => setNewAttachmentUrl(e.target.value)}
                      className="w-full text-[11px] font-medium border border-slate-200 px-2.5 py-1.5 rounded-lg bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="p-1.5 px-3 border border-slate-200 hover:bg-slate-50 rounded-lg text-[9.5px] font-extrabold uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="p-1.5 px-4 bg-emerald-950 hover:bg-emerald-900 text-white rounded-lg text-[9.5px] font-black uppercase tracking-wide cursor-pointer"
                  >
                    Publish Session Card
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* CONFLICT OVERLAPPING WARNING DIALOG PANEL */}
      {conflicts && (
        <div className="shrink-0 bg-rose-50 border border-rose-250/70 p-3 rounded-2xl flex items-start gap-2 text-rose-950">
          <AlertTriangle size={15} className="text-rose-700 shrink-0 mt-0.5 animate-pulse" />
          <div className="text-[10px] text-left">
            <span className="font-extrabold tracking-wider block text-rose-800 text-[8.5px] uppercase">🚨 OVERLAP CONFLICT DETECTED</span>
            {conflicts.map((conf, cIdx) => (
              <span key={cIdx} className="block font-semibold mt-0.5">• {conf}</span>
            ))}
          </div>
        </div>
      )}

      {/* Track Pill Filter Scroll View */}
      <div className="shrink-0 bg-slate-100 py-1.5 -mx-5 px-5 overflow-x-auto scrollbar-none flex gap-2 animate-none">
        {tracks.map((track) => {
          const isActive = selectedTrack === track;
          return (
            <button
              key={track}
              onClick={() => setSelectedTrack(track)}
              className={`whitespace-nowrap px-3.5 py-1.5 text-[9.5px] font-black uppercase tracking-wider rounded-full transition-all duration-150 cursor-pointer ${
                isActive
                  ? "bg-emerald-900 text-white shadow-sm"
                  : "bg-white text-slate-500 hover:text-slate-900 border border-slate-200/50"
              }`}
            >
              {track}
            </button>
          );
        })}
      </div>

      {/* Interactive Timeline Feed */}
      <div className="flex-grow overflow-y-auto pr-0.5 space-y-2.5 pb-2 scrollbar-thin">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200/50">
            <p className="text-slate-400 text-xs font-semibold">No specialized events in this track.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredSessions.map((session: AgendaSession) => {
            const isBookmarked = bookmarkedIds.includes(session.id);
            const isExpanded = expandedSessionId === session.id;

            // Translated components if French requested
            const displayTitle = language === "FR" && frTranslations[session.title] 
              ? frTranslations[session.title].title 
              : session.title;
            const displayDesc = language === "FR" && frTranslations[session.title]
              ? frTranslations[session.title].desc
              : session.description;
            const displayLocation = language === "FR" && frTranslations[session.title]
              ? frTranslations[session.title].loc
              : session.location;

            return (
              <motion.div
                key={session.id}
                layout="position"
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded ? "border-emerald-800 shadow-md ring-1 ring-emerald-800/10" : "border-slate-200/60 shadow-sm"
                }`}
              >
                {/* Session Card Summary */}
                <div 
                  onClick={() => toggleExpand(session.id)}
                  className="p-3.5 flex gap-3 items-start justify-between cursor-pointer select-none text-left"
                >
                  <div className="space-y-1 flex-1 pr-2">
                    {/* Time Frame Badge */}
                    <div className="flex items-center gap-1 text-slate-400 font-mono text-[9px] font-extrabold">
                      <Clock size={10} className="text-emerald-700" />
                      <span>{session.startTime} - {session.endTime}</span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-950 leading-snug">
                      {displayTitle}
                    </h4>

                    {/* Meta badges */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="text-[9px] font-bold text-slate-650">
                        {session.speaker}
                      </span>
                      <span className="text-[8px] px-1 px-0.5 bg-slate-100 text-slate-500 rounded font-extrabold uppercase tracking-wide">
                        {displayLocation.split(" (")[0]}
                      </span>
                    </div>
                  </div>

                  {/* Actions Block */}
                  <div className="flex items-center gap-0.5 self-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onToggleBookmark(session.id)}
                      className={`p-2 rounded-full border transition active:scale-95 cursor-pointer ${
                        isBookmarked 
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : "border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Bookmark size={11} fill={isBookmarked ? "currentColor" : "none"} />
                    </button>
                    <button
                      onClick={() => toggleExpand(session.id)}
                      className="p-2 text-slate-400 hover:text-slate-600 transition"
                    >
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>
                </div>

                {/* Expanded content details */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <div className="border-t border-slate-101 bg-slate-50/50 p-3.5 space-y-3">
                        <div className="text-[11px] text-slate-600 leading-relaxed font-semibold text-left">
                          {displayDesc}
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-slate-200/50 flex flex-col gap-0.5 text-left">
                          <span className="text-[8px] font-extrabold text-emerald-800 uppercase tracking-widest block">Speaker Host</span>
                          <span className="text-xs font-black text-slate-900">{session.speaker}</span>
                          <span className="text-[9px] text-slate-500 leading-none">{session.speakerRole}</span>
                        </div>

                        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold bg-white p-2.5 rounded-xl border border-slate-200/50 justify-between">
                          <div className="flex items-center gap-1">
                            <MapPin size={11} className="text-amber-500" />
                            <span>{displayLocation}</span>
                          </div>
                          <div className="flex items-center gap-1 opacity-80 shrink-0">
                            <Tag size={10} />
                            <span>{session.track}</span>
                          </div>
                        </div>

                        {session.attachmentUrl && (
                          <div className="flex items-center justify-between p-2 px-3 bg-emerald-50 rounded-xl border border-emerald-100/60">
                            <div className="flex items-center gap-1.5">
                              <Sparkles size={11} className="text-emerald-700 animate-pulse" />
                              <span className="text-[9px] font-extrabold font-mono text-emerald-900 truncate max-w-[170px]">
                                {session.attachmentUrl}
                              </span>
                            </div>
                            <button
                              onClick={() => alert(`Simulated Download of document: ${session.attachmentUrl}`)}
                              className="flex items-center gap-1 p-1 px-2 bg-emerald-800 text-white rounded-lg text-[8px] font-black uppercase tracking-wider cursor-pointer active:scale-95"
                            >
                              <Download size={9} />
                              <span>Get Doc</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
}
