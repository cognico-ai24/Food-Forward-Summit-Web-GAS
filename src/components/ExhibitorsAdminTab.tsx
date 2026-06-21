import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building, 
  Plus, 
  Search, 
  Edit2, 
  Save, 
  X, 
  Trash2, 
  MapPin, 
  Link as LinkIcon, 
  Mail, 
  Tag, 
  Sparkles, 
  CheckCircle,
  FileText,
  HelpCircle
} from "lucide-react";
import { ExhibitorEntity } from "../types";

interface ExhibitorsAdminTabProps {
  exhibitors: ExhibitorEntity[];
  onUpdateExhibitors: (updated: ExhibitorEntity[]) => void;
}

export default function ExhibitorsAdminTab({ exhibitors, onUpdateExhibitors }: ExhibitorsAdminTabProps) {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isInserting, setIsInserting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Edit fields
  const [editName, setEditName] = useState("");
  const [editFocus, setEditFocus] = useState("");
  const [editTrack, setEditTrack] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editBoothLocation, setEditBoothLocation] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editContactEmail, setEditContactEmail] = useState("");
  const [editTier, setEditTier] = useState("Gold");
  const [editLogoAsset, setEditLogoAsset] = useState("🏢");

  // Insert fields
  const [newName, setNewName] = useState("");
  const [newFocus, setNewFocus] = useState("");
  const [newTrack, setNewTrack] = useState("Tech & Innovation");
  const [newDescription, setNewDescription] = useState("");
  const [newBoothLocation, setNewBoothLocation] = useState("");
  const [newWebsite, setNewWebsite] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");
  const [newTier, setNewTier] = useState("Gold");
  const [newLogoAsset, setNewLogoAsset] = useState("🏢");

  const filteredExhibitors = exhibitors.filter(ex => 
    ex.name.toLowerCase().includes(search.toLowerCase()) ||
    ex.focus.toLowerCase().includes(search.toLowerCase()) ||
    ex.track.toLowerCase().includes(search.toLowerCase()) ||
    ex.boothLocation.toLowerCase().includes(search.toLowerCase())
  );

  // Standard preset logos/emojis to choose from
  const logoPresets = ["🏢", "🔬", "🌿", "🛸", "🌱", "❄️", "🍄", "🌊", "🍫", "🌾", "🥩", "🤖", "🐟", "📦"];

  const tracks = ["Tech & Innovation", "Sustainability & Packaging", "Supply Chain & Automation", "Consumer & Regulatory"];
  const tiers = ["Platinum", "Gold", "Silver"];

  const handleStartEdit = (ex: ExhibitorEntity) => {
    setEditingId(ex.id);
    setEditName(ex.name);
    setEditFocus(ex.focus);
    setEditTrack(ex.track);
    setEditDescription(ex.description);
    setEditBoothLocation(ex.boothLocation);
    setEditWebsite(ex.website);
    setEditContactEmail(ex.contactEmail);
    setEditTier(ex.tier);
    setEditLogoAsset(ex.logoAsset || "🏢");
    setIsInserting(false);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editBoothLocation.trim() || !editContactEmail.trim()) {
      setErrorMessage("Company name, booth location, and contact email are required.");
      return;
    }

    const updatedList = exhibitors.map(ex => {
      if (ex.id === editingId) {
        return {
          ...ex,
          name: editName.trim(),
          focus: editFocus.trim(),
          track: editTrack,
          description: editDescription.trim(),
          boothLocation: editBoothLocation.trim(),
          website: editWebsite.trim(),
          contactEmail: editContactEmail.trim(),
          tier: editTier,
          logoAsset: editLogoAsset
        };
      }
      return ex;
    });

    onUpdateExhibitors(updatedList);
    setEditingId(null);
    setErrorMessage("");
    showFeedback("Exhibitor database record updated successfully!");
  };

  const handleSaveInsert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newBoothLocation.trim() || !newContactEmail.trim()) {
      setErrorMessage("Company name, booth location, and contact email are required.");
      return;
    }

    // Generate unique ID
    const generatedId = "ex_" + newName.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + Date.now().toString().slice(-4);

    const newExhibitor: ExhibitorEntity = {
      id: generatedId,
      name: newName.trim(),
      focus: newFocus.trim() || "Innovative food startup specializing in agricultural progress.",
      track: newTrack,
      description: newDescription.trim() || `${newName} is a registered exhibitor driving innovation to accelerate the agritech sector during the Food Forward 2026 Summit.`,
      boothLocation: newBoothLocation.trim(),
      website: newWebsite.trim() || "https://foodforwardsummit.com",
      contactEmail: newContactEmail.trim(),
      tier: newTier,
      logoAsset: newLogoAsset
    };

    onUpdateExhibitors([...exhibitors, newExhibitor]);
    setIsInserting(false);
    setErrorMessage("");
    
    // Clear insert form
    setNewName("");
    setNewFocus("");
    setNewTrack("Tech & Innovation");
    setNewDescription("");
    setNewBoothLocation("");
    setNewWebsite("");
    setNewContactEmail("");
    setNewTier("Gold");
    setNewLogoAsset("🏢");

    showFeedback("New exhibitor inserted successfully into Summit index!");
  };

  const handleDeleteExhibitor = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove '${name}' from exhibitors directory?`)) {
      const updatedList = exhibitors.filter(e => e.id !== id);
      onUpdateExhibitors(updatedList);
      showFeedback(`Exhibitor '${name}' has been deleted.`);
    }
  };

  const showFeedback = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage("");
    }, 3500);
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden pb-4 gap-3 text-left">
      
      {/* HEADER CONTROLS Banner */}
      <div className="shrink-0 bg-[#0a5f6a]/10 rounded-2xl border border-[#0a5f6a]/20 p-3.5 flex justify-between items-center bg-white/70 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-1.5">
            <Building size={15} className="text-[#0a5f6a]" />
            <h3 className="text-xs font-black text-slate-950 uppercase tracking-tight">Exhibitor Registrar</h3>
          </div>
          <p className="text-[10px] text-slate-500 font-bold">Authorized administration clearance: View, Edit & Add Corporate Booths.</p>
        </div>
        <button
          onClick={() => {
            setIsInserting(!isInserting);
            setEditingId(null);
            setErrorMessage("");
          }}
          className="p-1.5 px-3 bg-[#0a5f6a] hover:bg-[#07474f] text-white rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition flex items-center gap-1 cursor-pointer"
        >
          {isInserting ? (
            <>
              <X size={10} />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <Plus size={10} />
              <span>Add Booth</span>
            </>
          )}
        </button>
      </div>

      {/* FEEDBACK MESSAGES */}
      <AnimatePresence>
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="shrink-0 bg-emerald-50 border border-emerald-250 p-2.5 rounded-xl flex items-center gap-2 text-emerald-900 text-[10px] font-bold"
          >
            <CheckCircle size={14} className="text-emerald-700 shrink-0" />
            <span>{successMessage}</span>
          </motion.div>
        )}
        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="shrink-0 bg-rose-50 border border-rose-250 p-2.5 rounded-xl flex items-center gap-2 text-rose-900 text-[10px] font-bold"
          >
            <X size={14} className="text-rose-700 shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INSERT NEW EXHIBITOR FORM */}
      <AnimatePresence>
        {isInserting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="shrink-0 bg-white border border-slate-200/60 rounded-2xl p-3.5 shadow-md overflow-hidden space-y-3 max-h-[380px] overflow-y-auto scrollbar-thin"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-[10px] font-black uppercase text-slate-800 tracking-wider">🌟 Add Corporate Booth Record</span>
              <button onClick={() => setIsInserting(false)} className="text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSaveInsert} className="grid grid-cols-2 gap-2.5 text-[10px]">
              <div className="col-span-2">
                <label className="text-[8px] font-bold uppercase text-slate-400 block mb-0.5">Enterprise Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CarbonAgritech Corp"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold focus:ring-1 focus:ring-[#0a5f6a] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[8px] font-bold uppercase text-slate-400 block mb-0.5">Assigned Floor Booth Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Booth F-18"
                  value={newBoothLocation}
                  onChange={(e) => setNewBoothLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold focus:ring-1 focus:ring-[#0a5f6a] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[8px] font-bold uppercase text-slate-400 block mb-0.5">Corporate Domain Web URL</label>
                <input
                  type="text"
                  placeholder="e.g. www.carbonagritech.com"
                  value={newWebsite}
                  onChange={(e) => setNewWebsite(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium focus:ring-1 focus:ring-[#0a5f6a] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[8px] font-bold uppercase text-slate-400 block mb-0.5">Contact Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. info@carbonagri.com"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium focus:ring-1 focus:ring-[#0a5f6a] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[8px] font-bold uppercase text-slate-400 block mb-0.5">Summit Support Tier</label>
                <select
                  value={newTier}
                  onChange={(e) => setNewTier(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold focus:ring-1 focus:ring-[#0a5f6a]"
                >
                  {tiers.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-[8px] font-bold uppercase text-slate-400 block mb-0.5">Summit Sector Track</label>
                <select
                  value={newTrack}
                  onChange={(e) => setNewTrack(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold focus:ring-1"
                >
                  {tracks.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-[8px] font-bold uppercase text-slate-400 block mb-0.5">Abstract / Focus (One liner summary)</label>
                <input
                  type="text"
                  placeholder="e.g. Bio-reprocessing carbon sequences in wheat."
                  value={newFocus}
                  onChange={(e) => setNewFocus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium focus:ring-1"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[8px] font-bold uppercase text-slate-400 block mb-0.5">Detailed Marketing Narrative / Pitch</label>
                <textarea
                  placeholder="A detailed explanation about products, core technologies, and investment targets."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 h-14 resize-none font-medium text-slate-600 focus:outline-none focus:ring-1"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[8px] font-bold uppercase text-slate-400 block mb-1">Company Emblem Icon</label>
                <div className="flex gap-1.5 flex-wrap p-1.5 bg-slate-50 border border-slate-150 rounded-xl">
                  {logoPresets.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewLogoAsset(preset)}
                      className={`w-6 h-6 flex items-center justify-center text-xs rounded transition flex-shrink-0 ${
                        newLogoAsset === preset ? "bg-[#0a5f6a] text-white" : "bg-white hover:bg-slate-100"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-span-2 pt-1">
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-700 hover:bg-emerald-850 text-white rounded-lg font-black uppercase tracking-wider text-[9px] active:scale-95 transition flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                >
                  <Plus size={11} strokeWidth={3} />
                  <span>Insert Live Booth</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDITING EXHIBITOR DISK FORM */}
      <AnimatePresence>
        {editingId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="shrink-0 bg-white border border-slate-250 rounded-2xl p-3.5 shadow-md overflow-hidden space-y-3 max-h-[380px] overflow-y-auto scrollbar-thin"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-[10px] font-black uppercase text-slate-800 tracking-wider">📝 Edit Exhibitor Record</span>
              <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="grid grid-cols-2 gap-2.5 text-[10px]">
              <div className="col-span-2">
                <label className="text-[8px] font-bold uppercase text-slate-400 block mb-0.5">Enterprise Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold focus:ring-1 focus:ring-[#0a5f6a] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[8px] font-bold uppercase text-slate-400 block mb-0.5">Assigned Location *</label>
                <input
                  type="text"
                  required
                  value={editBoothLocation}
                  onChange={(e) => setEditBoothLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold focus:ring-1 focus:ring-[#0a5f6a] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[8px] font-bold uppercase text-slate-400 block mb-0.5">Corporate Website Domain</label>
                <input
                  type="text"
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium focus:ring-1 focus:ring-[#0a5f6a] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[8px] font-bold uppercase text-slate-400 block mb-0.5">Contact Email *</label>
                <input
                  type="email"
                  required
                  value={editContactEmail}
                  onChange={(e) => setEditContactEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium focus:ring-1 focus:ring-[#0a5f6a] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[8px] font-bold uppercase text-slate-400 block mb-0.5">Sponsor Tier</label>
                <select
                  value={editTier}
                  onChange={(e) => setEditTier(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold focus:ring-1"
                >
                  {tiers.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-[8px] font-bold uppercase text-slate-400 block mb-0.5">Sector Track Segment</label>
                <select
                  value={editTrack}
                  onChange={(e) => setEditTrack(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-semibold focus:ring-1"
                >
                  {tracks.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-[8px] font-bold uppercase text-slate-400 block mb-0.5">Focus Abstract</label>
                <input
                  type="text"
                  value={editFocus}
                  onChange={(e) => setEditFocus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[8px] font-bold uppercase text-slate-400 block mb-0.5">Detailed Marketing Narrative</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 h-14 resize-none font-medium text-slate-600 focus:outline-none focus:ring-1"
                />
              </div>

              <div className="col-span-2">
                <label className="text-[8px] font-bold uppercase text-slate-400 block mb-1">Update Company Emblem</label>
                <div className="flex gap-1.5 flex-wrap p-1.5 bg-slate-50 border border-slate-150 rounded-xl">
                  {logoPresets.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setEditLogoAsset(preset)}
                      className={`w-6 h-6 flex items-center justify-center text-xs rounded transition flex-shrink-0 ${
                        editLogoAsset === preset ? "bg-[#0a5f6a] text-white" : "bg-white hover:bg-slate-100"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="col-span-2 pt-1 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-950 text-white rounded-lg font-black uppercase tracking-wider text-[9px] active:scale-95 transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Save size={11} />
                  <span>Update Record</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="py-1.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-705 text-slate-700 rounded-lg font-black uppercase tracking-wider text-[9px] active:scale-95 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FILTER SEARCH FIELD */}
      <div className="shrink-0 relative">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search size={13} />
        </span>
        <input
          type="text"
          placeholder="Filter exhibitors register by name, focus, or track..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200/80 rounded-2xl pl-9 pr-4 py-2.5 text-[11px] font-semibold text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-1 focus:ring-[#0a5f6a]/40 transition"
        />
        {search && (
          <button 
            onClick={() => setSearch("")}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* SEARCH RESULTS COUNT */}
      <div className="shrink-0 px-1 flex justify-between items-center text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">
        <span>Displaying {filteredExhibitors.length} companies</span>
        <span className="text-[#0a5f6a]">Summit Total: {exhibitors.length}</span>
      </div>

      {/* LIST ROSTER DIRECTORY */}
      <div className="flex-grow overflow-y-auto pr-0.5 space-y-2.5 scrollbar-thin">
        {filteredExhibitors.length > 0 ? (
          filteredExhibitors.map((ex) => (
            <motion.div
              key={ex.id}
              layoutId={`admin_ex_${ex.id}`}
              className="bg-white border border-slate-200/50 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition duration-200 flex flex-col gap-2.5 text-left"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="w-9 h-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-lg shadow-sm shrink-0">
                    {ex.logoAsset || "🏢"}
                  </span>
                  <div className="min-w-0 text-left">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs font-black text-slate-900 leading-tight truncate">{ex.name}</h4>
                      <span className={`text-[7px] font-black uppercase tracking-wider text-white px-1.5 py-0.5 rounded-md ${
                        ex.tier === "Platinum" ? "bg-emerald-800" : ex.tier === "Gold" ? "bg-amber-600" : "bg-slate-500"
                      }`}>
                        {ex.tier}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                      <span className="text-[9px] text-[#0a5f6a] font-extrabold flex items-center gap-0.5">
                        <MapPin size={9} />
                        {ex.boothLocation}
                      </span>
                      <span className="text-slate-300 text-[9px] font-bold">|</span>
                      <span className="text-[8.5px] text-slate-400 font-bold max-w-[120px] truncate">{ex.track}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => handleStartEdit(ex)}
                    className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition flex items-center gap-0.5 cursor-pointer"
                    title="Edit Information"
                  >
                    <Edit2 size={9} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteExhibitor(ex.id, ex.name)}
                    className="p-1 text-rose-650 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Exhibitor"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>

              {/* Focus text */}
              <p className="text-[10px] text-slate-600 font-bold leading-relaxed bg-slate-50/70 p-2 rounded-xl border border-slate-100">
                {ex.focus}
              </p>

              {/* Full Description text (collapsible / readable) */}
              <p className="text-[9.5px] text-slate-400 leading-normal line-clamp-2">
                {ex.description}
              </p>

              {/* Contact meta lines */}
              <div className="flex items-center gap-2 pt-1.5 border-t border-slate-100 flex-wrap text-[9px] text-slate-400 font-semibold md:gap-3">
                {ex.contactEmail && (
                  <span className="flex items-center gap-1 truncate">
                    <Mail size={9} className="text-[#0a5f6a]" />
                    <span>{ex.contactEmail}</span>
                  </span>
                )}
                {ex.website && (
                  <span className="flex items-center gap-1 truncate text-[#0e8bd0] hover:underline">
                    <LinkIcon size={9} />
                    <a href={ex.website} target="_blank" rel="noreferrer" className="font-bold">
                      {ex.website.replace("https://", "").replace("www.", "")}
                    </a>
                  </span>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-8 text-center bg-white border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-semibold">
            No exhibitors found matching "{search}".
          </div>
        )}
      </div>
    </div>
  );
}
