import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, User, Mail, Globe, MapPin, Tag, Plus, CheckCircle, Briefcase, Linkedin } from "lucide-react";
import { attendeesList } from "../data";
import { AttendeeEntity } from "../types";

export default function AttendeeTab() {
  const [attendees, setAttendees] = useState<AttendeeEntity[]>(() => {
    const saved = localStorage.getItem("ffs_attendees");
    return saved ? JSON.parse(saved) : attendeesList;
  });

  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Create form values
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [countryRegion, setCountryRegion] = useState("Canada");
  const [primarySectors, setPrimarySectors] = useState("Agritech & Smart Farming");
  const [role, setRole] = useState("Attendee");

  useEffect(() => {
    localStorage.setItem("ffs_attendees", JSON.stringify(attendees));
  }, [attendees]);

  const filteredAttendees = attendees.filter(att => 
    att.displayName.toLowerCase().includes(search.toLowerCase()) ||
    (att.email && att.email.toLowerCase().includes(search.toLowerCase())) ||
    (att.companyDescription && att.companyDescription.toLowerCase().includes(search.toLowerCase())) ||
    (att.primarySectors && att.primarySectors.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreateAttendee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !email.trim() || !companyDescription.trim()) {
      alert("Display Name, Email, and Company Description are required fields.");
      return;
    }

    const newAttendee: AttendeeEntity = {
      id: "att_" + Date.now(),
      displayName: displayName.trim(),
      email: email.trim().toLowerCase(),
      companyDescription: companyDescription.trim(),
      websiteUrl: websiteUrl.trim(),
      linkedinUrl: linkedinUrl.trim(),
      countryRegion: countryRegion.trim(),
      annualRevenue: "Pre-revenue",
      currentMarkets: "North America",
      targetMarkets: "Global",
      importExportStatus: "None",
      brandsRepresented: displayName.trim(),
      primarySectors: primarySectors,
      targetBuyers: "Investors",
      boothSizeConfirmed: "N/A",
      electricalNeeds: "None",
      exhibitorLeadId: "",
      role: role
    };

    setAttendees(prev => [newAttendee, ...prev]);
    setSuccessMsg(`Successfully registered profile card for ${displayName}!`);
    
    // Reset values
    setDisplayName("");
    setEmail("");
    setCompanyDescription("");
    setWebsiteUrl("");
    setLinkedinUrl("");
    setPrimarySectors("Agritech & Smart Farming");
    setRole("Attendee");
    setIsFormOpen(false);

    setTimeout(() => {
      setSuccessMsg("");
    }, 4000);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden pb-4 gap-3">
      
      {/* 1. HEADER ROW WITH CREATOR TOGGLE */}
      <div className="shrink-0 bg-white border border-slate-200/50 rounded-2xl p-3.5 flex justify-between items-center shadow-sm">
        <div className="text-left">
          <span className="text-[8px] font-black tracking-[0.2em] text-emerald-800 block uppercase">
            🛡️ Administrative Panel
          </span>
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider mt-0.5">Attendee Management</h2>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-3 py-1.5 bg-emerald-900 hover:bg-emerald-800 text-white text-[9px] font-black uppercase tracking-wider rounded-xl transition flex items-center gap-1 cursor-pointer"
        >
          <Plus size={11} />
          <span>{isFormOpen ? "Cancel Form" : "New Attendee"}</span>
        </button>
      </div>

      {/* 2. LIVE SUCCESS STATUS NOTIFIER */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="shrink-0 bg-emerald-50 border border-emerald-250 p-3 rounded-xl flex items-center gap-2 text-emerald-900"
          >
            <CheckCircle size={14} className="text-emerald-700 shrink-0" />
            <span className="text-[10px] font-bold text-left">{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. NEW ATTENDEE FORM MODAL / DRAWER DESIGN */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="shrink-0 bg-white border border-slate-200/60 rounded-2xl p-4 shadow-md space-y-3 overflow-hidden"
          >
            <form onSubmit={handleCreateAttendee} className="space-y-3 text-left">
              <span className="text-[8px] font-black tracking-widest text-[#006e80] block uppercase">REGISTER NEW ATTENDEE</span>
              
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marie Laurent"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full text-[11px] font-semibold border border-slate-200 px-2.5 py-1.5 rounded-lg bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  />
                </div>

                <div>
                  <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Primary Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. marie@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-[11px] font-semibold border border-slate-200 px-2.5 py-1.5 rounded-lg bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  />
                </div>

                <div>
                  <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Website URL</label>
                  <input
                    type="text"
                    placeholder="e.g. www.domain.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="w-full text-[11px] font-semibold border border-slate-200 px-2.5 py-1.5 rounded-lg bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  />
                </div>

                <div>
                  <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">LinkedIn Profile Link</label>
                  <input
                    type="text"
                    placeholder="e.g. linkedin.com/in/marie"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    className="w-full text-[11px] font-semibold border border-slate-200 px-2.5 py-1.5 rounded-lg bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  />
                </div>

                <div>
                  <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Country / Region</label>
                  <input
                    type="text"
                    value={countryRegion}
                    onChange={(e) => setCountryRegion(e.target.value)}
                    className="w-full text-[11px] font-semibold border border-slate-200 px-2.5 py-1.5 rounded-lg bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  />
                </div>

                <div>
                  <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Business Badge Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full text-[11px] font-semibold border border-slate-200 px-2.5 py-1.5 rounded-lg bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  >
                    <option value="Attendee">Attendee</option>
                    <option value="Sponsor">Sponsor</option>
                    <option value="Speaker">Speaker</option>
                    <option value="Exhibitor">Exhibitor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Primary Sourcing Sectors</label>
                  <input
                    type="text"
                    placeholder="e.g. Sustainable Packaging, Agritech"
                    value={primarySectors}
                    onChange={(e) => setPrimarySectors(e.target.value)}
                    className="w-full text-[11px] font-semibold border border-slate-200 px-2.5 py-1.5 rounded-lg bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block mb-0.5">Company Bio / Professional Intent *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Provide a succinct professional background description..."
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    className="w-full text-[11px] font-semibold border border-slate-200 p-2 rounded-lg bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-emerald-800 resize-none animate-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-3 py-1.5 text-[9.5px] font-black uppercase text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-[9.5px] font-black uppercase text-white bg-emerald-950 hover:bg-emerald-900 rounded-lg cursor-pointer"
                >
                  Register Profile
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. ATTENDEE SEARCH INPUT BAR */}
      <div className="shrink-0 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={13} className="text-slate-400" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter attendees by name, email, bio or tracks..."
          className="w-full bg-slate-100 placeholder-slate-400 text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-1 focus:ring-emerald-700/10 font-bold"
        />
      </div>

      {/* 5. SCROLLABLE ROSTER / DIRECTORY */}
      <div className="flex-grow overflow-y-auto pr-0.5 space-y-2.5 scrollbar-thin">
        {filteredAttendees.length > 0 ? (
          filteredAttendees.map((att) => (
            <motion.div
              key={att.id}
              className="bg-white border border-slate-200/50 rounded-2xl p-3.5 shadow-sm text-left flex flex-col gap-2.5"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Profile Top Row */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-900 flex items-center justify-center font-black text-xs border border-emerald-100">
                    <User size={14} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900">{att.displayName}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[7px] font-black uppercase tracking-wider bg-emerald-900 text-white px-1.5 py-0.5 rounded-md">
                        {att.role}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold flex items-center gap-0.5">
                        <MapPin size={10} />
                        {att.countryRegion || "Canada"}
                      </span>
                    </div>
                  </div>
                </div>

                {att.email && (
                  <a
                    href={`mailto:${att.email}`}
                    className="p-1 px-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-[9px] font-extrabold uppercase text-slate-500 flex items-center gap-1"
                  >
                    <Mail size={10} />
                    <span>Contact</span>
                  </a>
                )}
              </div>

              {/* Bio description */}
              <p className="text-[10.5px] leading-relaxed text-slate-700 font-medium">
                {att.companyDescription}
              </p>

              {/* Footer details row */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold max-w-full overflow-hidden text-ellipsis">
                  <Briefcase size={10} className="text-emerald-700 shrink-0" />
                  <span className="overflow-hidden text-ellipsis whitespace-nowrap">{att.primarySectors || "Agritech"}</span>
                </div>

                <div className="flex gap-1.5">
                  {att.websiteUrl && (
                    <a
                      href={att.websiteUrl.startsWith("http") ? att.websiteUrl : `https://${att.websiteUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-slate-405 hover:text-[#00ffd5]/90 transition"
                    >
                      <Globe size={11} className="text-emerald-800" />
                    </a>
                  )}
                  {att.linkedinUrl && (
                    <a
                      href={att.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-slate-405 hover:text-emerald-800 transition"
                    >
                      <Linkedin size={11} className="text-emerald-800" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-10 text-slate-400 text-xs font-semibold">
            No attendees matching filter parameters.
          </div>
        )}
      </div>

    </div>
  );
}
