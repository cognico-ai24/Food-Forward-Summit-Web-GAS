import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  MapPin, 
  ExternalLink, 
  Mail, 
  Tag, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Calendar, 
  CheckCircle,
  HelpCircle,
  ArrowUpRight
} from "lucide-react";
import { exhibitorsList } from "../data";
import { ExhibitorEntity } from "../types";

export default function ExhibitorTab() {
  const [search, setSearch] = useState("");
  const [selectedExhibitorId, setSelectedExhibitorId] = useState<string>("ex_biocult");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingOpened, setBookingOpened] = useState(false);
  const [bookingPurpose, setBookingPurpose] = useState("Corporate Sourcing Discussion");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Filter list
  const filteredExhibitors = exhibitorsList.filter(ex => 
    ex.name.toLowerCase().includes(search.toLowerCase()) ||
    ex.focus.toLowerCase().includes(search.toLowerCase()) ||
    ex.track.toLowerCase().includes(search.toLowerCase())
  );

  const activeExhibitor = exhibitorsList.find(e => e.id === selectedExhibitorId) || exhibitorsList[0];

  // Simulated media carousel photos for each exhibitor
  const mediaCarousels: Record<string, string[]> = {
    ex_biocult: [
      "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400&auto=format&fit=crop&q=80", // lab 1
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&auto=format&fit=crop&q=80"  // lab 2
    ],
    ex_ecopack: [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80", // compost
      "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400&auto=format&fit=crop&q=80"  // ocean Algae
    ],
    ex_agridrone: [
      "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&auto=format&fit=crop&q=80", // drone flight
      "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&auto=format&fit=crop&q=80"  // fields uav
    ],
    ex_verdevertical: [
      "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&auto=format&fit=crop&q=80", // indoor farming
      "https://images.unsplash.com/photo-1558449028-b53a39d100fc?w=400&auto=format&fit=crop&q=80"  // hydro setups
    ],
    ex_freezefresh: [
      "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=400&auto=format&fit=crop&q=80", // cold warehouse
      "https://images.unsplash.com/photo-1584483768114-2c3307409f42?w=400&auto=format&fit=crop&q=80"  // cargo
    ],
    ex_mycelium: [
      "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&auto=format&fit=crop&q=80", // protein fungi
      "https://images.unsplash.com/photo-1570784294028-250a252a13cc?w=400&auto=format&fit=crop&q=80"  // chef fungal cut
    ],
    ex_aqualoop: [
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&auto=format&fit=crop&q=80", // shrimp farm
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80"  // ocean
    ],
    ex_chocotrace: [
      "https://images.unsplash.com/photo-1540806771270-3949f299191d?w=400&auto=format&fit=crop&q=80", // blockchain map
      "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=400&auto=format&fit=crop&q=80"  // cocoa pods
    ]
  };

  const [carouselIdx, setCarouselIdx] = useState(0);

  useEffect(() => {
    setCarouselIdx(0);
    setBookingSuccess(false);
  }, [selectedExhibitorId]);

  const handleBookMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingTime) return;
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingOpened(false);
      setBookingSuccess(false);
    }, 2500);
  };

  // Click on map booth ID to select
  const handleMapBoothClick = (exhibitorId: string) => {
    setSelectedExhibitorId(exhibitorId);
    // Smooth scroll down to panel on mobile frame
    document.getElementById("exhibitor_detail_panel")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden pb-4 gap-3">
      
      {/* 1. INTERACTIVE DIGITAL FLOOR PLAN (Clickable grid SVG) */}
      <div className="shrink-0 bg-slate-950 text-white rounded-2xl p-3 border border-slate-800">
        <span className="text-[8px] font-black tracking-[0.2em] text-[#00e1ef] block mb-1.5 uppercase">
          🗺️ INTERACTIVE MAP (CLICK BOOTHS TO SELECT)
        </span>
        
        {/* Responsive Mini Floor SVG */}
        <div className="relative aspect-[33/14] w-full bg-[#050f14] rounded-xl border border-slate-800 flex items-center justify-center p-1 overflow-hidden select-none">
          <svg viewBox="0 0 330 140" className="w-full h-full font-sans antialiased">
            {/* Legend grid backing */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.04" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Entrance labels */}
            <text x="10" y="75" fill="#47a5b3" fontSize="7" fontWeight="bold">ENTRANCE</text>
            <line x1="0" y1="70" x2="15" y2="70" stroke="#00e1ef" strokeWidth="1" strokeDasharray="2,2" />

            {/* BOOTH A-12 (BioCult) */}
            <g className="cursor-pointer" onClick={() => handleMapBoothClick("ex_biocult")}>
              <rect 
                x="30" y="20" width="55" height="35" rx="6" 
                fill={selectedExhibitorId === "ex_biocult" ? "#047857" : "#0f2b35"} 
                stroke={selectedExhibitorId === "ex_biocult" ? "#00ffd5" : "#1e4d58"} 
                strokeWidth={selectedExhibitorId === "ex_biocult" ? "1.5" : "1"} 
              />
              <text x="57" y="37" fill="#ffffff" fontSize="8" fontWeight="black" textAnchor="middle">🔬 Booth A-12</text>
              <text x="57" y="47" fill="#84a6b0" fontSize="6.5" fontWeight="bold" textAnchor="middle">BioCult Tech</text>
            </g>

            {/* BOOTH A-20 (Mycelium) */}
            <g className="cursor-pointer" onClick={() => handleMapBoothClick("ex_mycelium")}>
              <rect 
                x="95" y="20" width="55" height="35" rx="6" 
                fill={selectedExhibitorId === "ex_mycelium" ? "#047857" : "#0f2b35"} 
                stroke={selectedExhibitorId === "ex_mycelium" ? "#00ffd5" : "#1e4d58"} 
                strokeWidth={selectedExhibitorId === "ex_mycelium" ? "1.5" : "1"} 
              />
              <text x="122" y="37" fill="#ffffff" fontSize="8" fontWeight="black" textAnchor="middle">🍄 Booth A-20</text>
              <text x="122" y="47" fill="#84a6b0" fontSize="6" fontWeight="bold" textAnchor="middle">Mycelium Foods</text>
            </g>

            {/* BOOTH B-05 (EcoPack) */}
            <g className="cursor-pointer" onClick={() => handleMapBoothClick("ex_ecopack")}>
              <rect 
                x="160" y="20" width="55" height="35" rx="6" 
                fill={selectedExhibitorId === "ex_ecopack" ? "#047857" : "#0f2b35"} 
                stroke={selectedExhibitorId === "ex_ecopack" ? "#00ffd5" : "#1e4d58"} 
                strokeWidth={selectedExhibitorId === "ex_ecopack" ? "1.5" : "1"} 
              />
              <text x="187" y="37" fill="#ffffff" fontSize="8" fontWeight="black" textAnchor="middle">🌿 Booth B-05</text>
              <text x="187" y="47" fill="#84a6b0" fontSize="6.5" fontWeight="bold" textAnchor="middle">EcoPack Sol</text>
            </g>

            {/* BOOTH B-19 (AquaLoop) */}
            <g className="cursor-pointer" onClick={() => handleMapBoothClick("ex_aqualoop")}>
              <rect 
                x="225" y="20" width="55" height="35" rx="6" 
                fill={selectedExhibitorId === "ex_aqualoop" ? "#047857" : "#0f2b35"} 
                stroke={selectedExhibitorId === "ex_aqualoop" ? "#00ffd5" : "#1e4d58"} 
                strokeWidth={selectedExhibitorId === "ex_aqualoop" ? "1.5" : "1"} 
              />
              <text x="252" y="37" fill="#ffffff" fontSize="8" fontWeight="black" textAnchor="middle">🌊 Booth B-19</text>
              <text x="252" y="47" fill="#84a6b0" fontSize="6" fontWeight="bold" textAnchor="middle">AquaLoop Marine</text>
            </g>

            {/* BOOTH C-08 (AgriDrone) */}
            <g className="cursor-pointer" onClick={() => handleMapBoothClick("ex_agridrone")}>
              <rect 
                x="30" y="80" width="55" height="35" rx="6" 
                fill={selectedExhibitorId === "ex_agridrone" ? "#047857" : "#0f2b35"} 
                stroke={selectedExhibitorId === "ex_agridrone" ? "#00ffd5" : "#1e4d58"} 
                strokeWidth={selectedExhibitorId === "ex_agridrone" ? "1.5" : "1"} 
              />
              <text x="57" y="97" fill="#ffffff" fontSize="8" fontWeight="black" textAnchor="middle">🛸 Booth C-08</text>
              <text x="57" y="107" fill="#84a6b0" fontSize="6.5" fontWeight="bold" textAnchor="middle">AgriDrone</text>
            </g>

            {/* BOOTH C-14 (VerdeVerticals) */}
            <g className="cursor-pointer" onClick={() => handleMapBoothClick("ex_verdevertical")}>
              <rect 
                x="95" y="80" width="55" height="35" rx="6" 
                fill={selectedExhibitorId === "ex_verdevertical" ? "#047857" : "#0f2b35"} 
                stroke={selectedExhibitorId === "ex_verdevertical" ? "#00ffd5" : "#1e4d58"} 
                strokeWidth={selectedExhibitorId === "ex_verdevertical" ? "1.5" : "1"} 
              />
              <text x="122" y="97" fill="#ffffff" fontSize="8" fontWeight="black" textAnchor="middle">🌱 Booth C-14</text>
              <text x="122" y="107" fill="#84a6b0" fontSize="6.5" fontWeight="bold" textAnchor="middle">VerdeVert</text>
            </g>

            {/* BOOTH D-01 (FreezeFresh) */}
            <g className="cursor-pointer" onClick={() => handleMapBoothClick("ex_freezefresh")}>
              <rect 
                x="160" y="80" width="55" height="35" rx="6" 
                fill={selectedExhibitorId === "ex_freezefresh" ? "#047857" : "#0f2b35"} 
                stroke={selectedExhibitorId === "ex_freezefresh" ? "#00ffd5" : "#1e4d58"} 
                strokeWidth={selectedExhibitorId === "ex_freezefresh" ? "1.5" : "1"} 
              />
              <text x="187" y="97" fill="#ffffff" fontSize="8" fontWeight="black" textAnchor="middle">❄️ Booth D-01</text>
              <text x="187" y="107" fill="#84a6b0" fontSize="6.5" fontWeight="bold" textAnchor="middle">FreezeFresh</text>
            </g>

            {/* BOOTH E-04 (ChocoTrace) */}
            <g className="cursor-pointer" onClick={() => handleMapBoothClick("ex_chocotrace")}>
              <rect 
                x="225" y="80" width="55" height="35" rx="6" 
                fill={selectedExhibitorId === "ex_chocotrace" ? "#047857" : "#0f2b35"} 
                stroke={selectedExhibitorId === "ex_chocotrace" ? "#00ffd5" : "#1e4d58"} 
                strokeWidth={selectedExhibitorId === "ex_chocotrace" ? "1.5" : "1"} 
              />
              <text x="252" y="97" fill="#ffffff" fontSize="8" fontWeight="black" textAnchor="middle">🍫 Booth E-04</text>
              <text x="252" y="107" fill="#84a6b0" fontSize="6.5" fontWeight="bold" textAnchor="middle">ChocoTrace</text>
            </g>

          </svg>
        </div>
      </div>

      {/* 2. DIRECTORY FILTER & SEARCH BAR */}
      <div className="shrink-0 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={13} className="text-slate-400" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Fuzzy search company, track, or focus sector..."
          className="w-full bg-slate-100 placeholder-slate-400 text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-1 focus:ring-emerald-700/20 font-bold"
        />
      </div>

      {/* 3. SCROLLABLE SPLIT SECTION */}
      <div className="flex-grow flex flex-col gap-3.5 min-h-0 overflow-y-auto overflow-x-hidden pr-0.5 scrollbar-thin">
        
        {/* Compact Quick Select Row */}
        <div className="shrink-0 flex gap-2 overflow-x-auto scrollbar-none py-1">
          {filteredExhibitors.map((ex) => (
            <button
              key={ex.id}
              onClick={() => setSelectedExhibitorId(ex.id)}
              className={`whitespace-nowrap rounded-full px-3 py-1 font-black uppercase text-[8.5px] transition-all cursor-pointer ${
                selectedExhibitorId === ex.id 
                  ? "bg-emerald-900 border border-emerald-900 text-white" 
                  : "bg-white border border-slate-200 text-slate-500"
              }`}
            >
              {ex.logoAsset} {ex.name}
            </button>
          ))}
        </div>

        {/* DETAILS PANEL FOR THE SELECTED EXHIBITOR */}
        {activeExhibitor && (
          <motion.div 
            id="exhibitor_detail_panel"
            className="bg-white rounded-3xl border border-slate-200/60 p-4 shadow-sm space-y-4"
            key={activeExhibitor.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header profile block */}
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl leading-none">{activeExhibitor.logoAsset}</span>
                  <h3 className="text-sm font-black text-slate-950">{activeExhibitor.name}</h3>
                  <span className="text-[7.5px] font-black px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded uppercase tracking-wider">
                    {activeExhibitor.tier}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold mt-1">
                  <MapPin size={11} className="text-emerald-700" />
                  <span>{activeExhibitor.boothLocation} (Milano Hall)</span>
                </div>
              </div>

              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-emerald-900 text-white rounded-md tracking-wider">
                {activeExhibitor.track}
              </span>
            </div>

            {/* Media Carousel - Tapping cycles photos */}
            {mediaCarousels[activeExhibitor.id] && (
              <div 
                className="relative h-[150px] rounded-2xl overflow-hidden shadow-inner group cursor-pointer bg-slate-900"
                onClick={() => setCarouselIdx(prev => (prev === 0 ? 1 : 0))}
              >
                <img 
                  src={mediaCarousels[activeExhibitor.id][carouselIdx]} 
                  alt="Enterprise showcase product" 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  referrerPolicy="no-referrer"
                />
                
                {/* Carousel metadata overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-2.5 flex justify-between items-center text-white select-none">
                  <span className="text-[9px] font-bold">Cycle products (Click picture)</span>
                  <span className="text-[9.5px] font-mono font-black">{carouselIdx + 1}/2 Demo Views</span>
                </div>

                <button className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-950/30 flex items-center justify-center text-white backdrop-blur-sm">
                  <ChevronLeft size={12} />
                </button>
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-950/30 flex items-center justify-center text-white backdrop-blur-sm">
                  <ChevronRight size={12} />
                </button>
              </div>
            )}

            {/* Company Bio */}
            <div className="space-y-1.5 text-left">
              <span className="text-[8px] font-black tracking-widest text-[#006e80] block uppercase">EXHIBITING PROFILE</span>
              <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                {activeExhibitor.description}
              </p>
              <div className="text-[10px] text-slate-500 font-bold bg-slate-50 p-2 rounded-xl">
                🌟 <strong>Target/Sourcing Area:</strong> {activeExhibitor.focus}
              </div>
            </div>

            {/* Resource Downloads & Meeting CTAs */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              
              {/* Sourcing brochures / PDF Resource Downloads */}
              <button
                onClick={() => alert(`Downloaded file: FFS2026_${activeExhibitor.name.replace(/\s/g,"")}_Specifications.pdf`)}
                className="flex items-center justify-center gap-1.5 p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-[10px] font-extrabold uppercase tracking-wide text-slate-700 transition cursor-pointer"
              >
                <Download size={12} />
                <span>Get PDF Specs</span>
              </button>

              {/* Book meeting trigger */}
              <button
                onClick={() => setBookingOpened(!bookingOpened)}
                className="flex items-center justify-center gap-1.5 p-2.5 bg-emerald-905 bg-emerald-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wide cursor-pointer active:scale-95 transition"
              >
                <Calendar size={12} />
                <span>Book Meeting</span>
              </button>

            </div>

            {/* BOOK MEETING POPUP FORM */}
            <AnimatePresence>
              {bookingOpened && (
                <motion.form 
                  onSubmit={handleBookMeeting}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200 mt-2 space-y-3 text-left"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <span className="text-[8px] font-black tracking-widest text-[#c25e00] block uppercase">📆 DIRECT B2B SCHEDULER</span>
                  
                  {bookingSuccess ? (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2 text-emerald-850">
                      <CheckCircle size={15} />
                      <span className="text-[10px] font-black uppercase tracking-wider">Simulated: Meeting booked successfully! Visit booth {activeExhibitor.boothLocation}.</span>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[8px] font-bold text-slate-500 block mb-0.5 uppercase">Choose Slot Time</label>
                          <select 
                            value={bookingTime}
                            onChange={(e) => setBookingTime(e.target.value)}
                            required
                            className="w-full bg-white border border-slate-250 text-[10px] font-bold rounded-lg p-1.5"
                          >
                            <option value="">Select Time...</option>
                            <option value="10:30 AM">10:30 AM (Oct 14)</option>
                            <option value="01:15 PM">01:15 PM (Oct 14)</option>
                            <option value="03:45 PM">03:45 PM (Oct 14)</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="text-[8px] font-bold text-slate-500 block mb-0.5 uppercase">Meeting Intent</label>
                          <select 
                            value={bookingPurpose}
                            onChange={(e) => setBookingPurpose(e.target.value)}
                            className="w-full bg-white border border-slate-250 text-[10px] font-semibold rounded-lg p-1.5"
                          >
                            <option value="Corporate Sourcing Discussion">Corporate Sourcing Goal</option>
                            <option value="Technical Bioreactor Blueprint Audit">Bioreactor blueprint review</option>
                            <option value="Pilot Investment Deal Offer">Investment venture proposal</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-slate-950 text-white rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                      >
                        Confirm Slot with {activeExhibitor.name}
                      </button>
                    </>
                  )}
                </motion.form>
              )}
            </AnimatePresence>

          </motion.div>
        )}

      </div>
    </div>
  );
}
