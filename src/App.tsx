import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import LoginForm, { UserSession } from "./components/LoginForm";
import HomeTab from "./components/HomeTab";
import ScheduleTab from "./components/ScheduleTab";
import NetworkingTab from "./components/NetworkingTab";
import ExhibitorTab from "./components/ExhibitorTab";
import AttendeeTab from "./components/AttendeeTab";
import MenuTab from "./components/MenuTab";
import ExhibitorsAdminTab from "./components/ExhibitorsAdminTab";
import ExhibitorQuestionnaire from "./components/ExhibitorQuestionnaire";
import { 
  Home as HomeIcon, 
  Calendar, 
  Sparkles, 
  Map, 
  Users,
  Menu as MenuIcon, 
  Bell, 
  QrCode, 
  Search, 
  Sun,
  Moon, 
  LogOut, 
  X, 
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  Building
} from "lucide-react";
import { ScannedContact } from "./types";
import { exhibitorsList, initialSessions, speakersList } from "./data";

type TabType = "home" | "schedule" | "networking" | "exhibitors" | "menu";

// Synth high-frequency digital scan confirmation beep in the browser!
function playBeepSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(1150, ctx.currentTime); // high clean chirp
    
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.12);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (error) {
    console.log("Audio feedback skipped due to initial gesture locks:", error);
  }
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("cognico@nleats.com");
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  
  // High-Frequency bottom navigation tab
  const [activeTab, setActiveTab] = useState<TabType>("home");
  
  // Role switcher state for testing RBAC
  const [overriddenRole, setOverriddenRole] = useState<string | null>(null);
  
  // Wallet Entry Pass states
  const [isRegistered, setIsRegistered] = useState(false);
  const [isTicketOpen, setIsTicketOpen] = useState(false);

  // Real Dark Mode dynamic state
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("ffs_dark_mode") === "true");

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem("ffs_dark_mode", String(next));
      return next;
    });
  };
  
  // Bookmarked Session list
  const [bookmarkedSessionIds, setBookmarkedSessionIds] = useState<string[]>(["session_1", "session_3"]);

  // Lead scans retrieval state
  const [scannedContacts, setScannedContacts] = useState<ScannedContact[]>(() => {
    const saved = localStorage.getItem("ffs_scanned_leads");
    return saved ? JSON.parse(saved) : [
      { 
        id: "lead_demo_1", 
        name: "Sophia Weiss", 
        company: "Grain Millers Inc.", 
        email: "sophia@grainmillers.com", 
        phone: "+1 (312) 555-0928", 
        notes: "Expressed immediate interest in Booth B-05 compostable polymers.", 
        rank: "Hot", 
        scannedAt: Date.now() - 3600000 
      },
      { 
        id: "lead_demo_2", 
        name: "Alexande Kappes", 
        company: "Greener Herd", 
        email: "a.m.kappes@gmail.com", 
        phone: "+1 (204) 555-1212", 
        notes: "Needs specifications on animal records and automated scale sensor deployment.", 
        rank: "Warm", 
        scannedAt: Date.now() - 1800000 
      }
    ];
  });

  const [exhibitors, setExhibitors] = useState<any[]>(() => {
    const saved = localStorage.getItem("ffs_exhibitors");
    return saved ? JSON.parse(saved) : exhibitorsList;
  });

  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  // Global utilities modal overlay triggers
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Notifications broadcasts queue
  const [broadcasts] = useState([
    { id: 1, text: "Keynote Rescheduled: Block B cellular engineering panel now starting at 1:15 PM.", read: false, time: "4m ago" },
    { id: 2, text: "Catering Notice: Vegan macro seaweed bites served fresh in the central courtyard.", read: true, time: "1h ago" },
    { id: 3, text: "Exhibitor Hall open. Touch interactive floor map down in Exhibitor tab to locate Booths.", read: true, time: "2h ago" }
  ]);
  const [unreadCount, setUnreadCount] = useState(1);

  // Search filter query
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    localStorage.setItem("ffs_scanned_leads", JSON.stringify(scannedContacts));
  }, [scannedContacts]);

  useEffect(() => {
    localStorage.setItem("ffs_exhibitors", JSON.stringify(exhibitors));
  }, [exhibitors]);

  const handleLogin = (session: UserSession) => {
    setUserSession(session);
    setOverriddenRole(null); // Reset overrides
    setCurrentUserEmail(session.email || "cognico@nleats.com");
    setIsRegistered(true);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserSession(null);
    setOverriddenRole(null);
    setIsRegistered(false);
    setActiveTab("home");
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedSessionIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleRoleOverride = (role: string) => {
    setOverriddenRole(role);
  };

  const handleUpdateScannedContact = (updated: ScannedContact) => {
    setScannedContacts(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  // Scan Code Demo Simulator: Picks an attendee to scan
  const [scannerSuccessMsg, setScannerSuccessMsg] = useState("");
  const handleSimulateScan = (name: string, company: string, email: string) => {
    const isAlreadyScanned = scannedContacts.some(c => c.email.toLowerCase() === email.toLowerCase());
    if (isAlreadyScanned) {
      setScannerSuccessMsg(`Oops! ${name} is already scanned in your Leads list.`);
      setTimeout(() => setScannerSuccessMsg(""), 2200);
      return;
    }

    const testScan: ScannedContact = {
      id: "scanned_" + Date.now(),
      name,
      company,
      email,
      phone: "+1 (555) 928-" + Math.floor(1000 + Math.random() * 9000),
      notes: "Scan retrieved from FFS Milano Digital Badge. Needs follow up.",
      rank: "Warm",
      scannedAt: Date.now()
    };

    playBeepSound();
    setScannedContacts(prev => [testScan, ...prev]);
    setScannerSuccessMsg(`badge scanned successfully: ${name}! Added to Lead retrieval.`);
    setTimeout(() => {
      setScannerSuccessMsg("");
      setIsScannerOpen(false);
    }, 1800);
  };

  const currentUserRole = overriddenRole || userSession?.role || "Attendee";

  useEffect(() => {
    if (currentUserRole === "Exhibitor") {
      const isCompleted = localStorage.getItem(`ffs_questionnaire_${currentUserEmail}`);
      setShowQuestionnaire(!isCompleted);
    } else {
      setShowQuestionnaire(false);
    }
  }, [currentUserRole, currentUserEmail]);

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  // Filter speakers, exhibitors and sessions for search
  const filteredSpeakers = speakersList.filter(s => 
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.topicTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredExhibitors = exhibitors.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.focus.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSessions = initialSessions.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.speaker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen w-screen bg-[#070b0e] text-slate-900 font-sans flex items-center justify-center overflow-hidden">
      
      {/* Outer Mobile Mock Container Frame mimicking Facebook's compact, premium aesthetic */}
      <div className={`w-full max-w-md h-full max-h-[100dvh] sm:h-[840px] sm:max-h-[90vh] flex flex-col relative shadow-2xl sm:rounded-[36px] overflow-hidden border border-slate-800 transition-colors duration-300 ${
        isDarkMode ? "dark-theme bg-[#060d17]" : "bg-[#f0f2f5]"
      }`}>
        
        {/* GLOBAL HEADER - Brand on left, Global Utilities on right */}
        <header className="shrink-0 bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center h-14 z-30 select-none">
          
          <div className="flex items-center gap-2">
            <img
              src="/src/assets/images/FF Favicon.png"
              alt="Food Forward Logo"
              className="w-6.5 h-6.5 object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="text-left leading-none">
              <h1 className="text-[12px] font-black uppercase tracking-tight text-emerald-950">Food Forward 2026</h1>
            </div>
          </div>

          {/* Top Right interaction hub */}
          <div className="flex items-center gap-1.5">
            {/* Immersive Search icon */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full cursor-pointer transition active:scale-90"
              title="Universal Search"
            >
              <Search size={14} />
            </button>

            {/* Hardware badge camera scanner triggers */}
            <button
              onClick={() => setIsScannerOpen(true)}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-705 text-slate-700 rounded-full cursor-pointer transition active:scale-90"
              title="Native QR Badge Scan"
            >
              <QrCode size={14} />
            </button>

            {/* Notification Bell with unread counter badge */}
            <button
              onClick={() => {
                setIsNotificationsOpen(true);
                setUnreadCount(0);
              }}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full cursor-pointer transition relative active:scale-90"
              title="Broadcast announcements"
            >
              <Bell size={14} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[12px] h-3 bg-red-500 rounded-full text-[7.5px] font-black text-white px-0.5 flex items-center justify-center leading-none">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Divider line */}
            <span className="h-5 w-px bg-slate-200 mx-1"></span>

            {/* Dark Mode Slider Toggle Switch */}
            <div className="flex items-center gap-1 select-none">
              <button
                type="button"
                onClick={toggleDarkMode}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none flex items-center cursor-pointer ${
                  isDarkMode ? "bg-emerald-500" : "bg-slate-300"
                }`}
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                <motion.div
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center ${
                    isDarkMode ? "ml-auto" : "mr-auto"
                  }`}
                >
                  {isDarkMode ? (
                    <Sun size={9} className="text-amber-600 font-extrabold" />
                  ) : (
                    <Moon size={9} className="text-indigo-900" />
                  )}
                </motion.div>
              </button>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-full cursor-pointer transition"
              title="Log Out"
            >
              <LogOut size={13} />
            </button>
          </div>

        </header>

        {/* CURRENT LIVE OVERVIEW ACTIVE ROLE TOAST */}
        <div className="shrink-0 bg-[#091b2e] text-slate-200 border-b border-[#1c2e42]/60 text-[8.5px] font-bold tracking-widest px-4 py-1.5 text-center uppercase select-none">
          ROLE ACCESS CLEARANCE: <span className="text-[#10b981] font-extrabold">{currentUserRole}</span>
        </div>

        {/* PRIMARY WINDOW CONTENT PORT - scrollable internal tabs */}
        <main className="flex-1 overflow-hidden px-4.5 pt-3.5 pb-24 flex flex-col min-h-0 bg-[#f0f2f5]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.14 }}
              className="flex-1 flex flex-col min-h-0"
            >
              {activeTab === "home" && (
                <HomeTab 
                  userName={userSession?.displayName || "Experimental Guest"} 
                  userRole={currentUserRole} 
                />
              )}

              {activeTab === "schedule" && (
                <ScheduleTab 
                  bookmarkedIds={bookmarkedSessionIds} 
                  onToggleBookmark={toggleBookmark} 
                  userRole={currentUserRole}
                />
              )}

              {activeTab === "networking" && (
                currentUserRole === "Admin" ? (
                  <ExhibitorsAdminTab 
                    exhibitors={exhibitors} 
                    onUpdateExhibitors={setExhibitors} 
                  />
                ) : (
                  <NetworkingTab 
                    userName={userSession?.displayName} 
                    userCompany={userSession?.profile?.brandsRepresented || "Food Forward"} 
                    userRole={currentUserRole}
                  />
                )
              )}

              {activeTab === "exhibitors" && (
                currentUserRole === "Admin" ? <AttendeeTab /> : <ExhibitorTab exhibitors={exhibitors} />
              )}

              {activeTab === "menu" && (
                <MenuTab 
                  currentUserRole={currentUserRole}
                  onRoleOverride={handleRoleOverride}
                  scannedContacts={scannedContacts}
                  onUpdateScannedContact={handleUpdateScannedContact}
                  userName={userSession?.displayName}
                  userEmail={userSession?.email}
                  userSession={userSession}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* FB5 PERSISTENT BOTTOM TAB BAR NAVIGATION (rounded pill shape highlights) */}
        <nav className="absolute bottom-0 inset-x-0 bg-white border-t border-slate-200/80 py-2.5 px-4 flex justify-around items-center z-40 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] pb-safe-bottom">
          {[
            { id: "home", label: "Home", icon: HomeIcon },
            { id: "schedule", label: "Agenda", icon: Calendar },
            currentUserRole === "Admin" 
              ? { id: "networking", label: "Exhibitors", icon: Building }
              : { id: "networking", label: "Match", icon: Sparkles },
            { 
              id: "exhibitors", 
              label: currentUserRole === "Admin" ? "Attendee" : "Booths", 
              icon: currentUserRole === "Admin" ? Users : Map 
            },
            { id: "menu", label: "Menu", icon: MenuIcon }
          ].map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabType);
                  // Dismiss top overlays on click
                  setIsSearchOpen(false);
                  setIsNotificationsOpen(false);
                }}
                className="flex flex-col items-center justify-center py-1 px-3.5 rounded-2xl relative transition cursor-pointer touch-manipulation active:scale-[0.93] group"
              >
                {/* Active highlight color pill */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-[#0a5f6a] rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 360, damping: 28 }}
                  />
                )}

                <IconComponent 
                  size={17} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className="transition-colors duration-100"
                  style={{ color: isActive ? "#21c3ce" : undefined }}
                />
                
                <span className={`text-[8.5px] font-extrabold mt-1 tracking-wider uppercase transition-colors duration-100 ${
                  isActive ? "text-white font-extrabold" : "text-slate-400 group-hover:text-slate-500"
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* PERSISTENT MODAL 1: NOTIFICATION ANNOUNCEMENTS OVERLAY */}
        <AnimatePresence>
          {isNotificationsOpen && (
            <motion.div 
              className="absolute inset-x-0 top-0 bottom-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-end justify-center p-4 select-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              id="broadcasts_dialog"
            >
              <motion.div 
                className="w-full bg-[#0a141b] text-white rounded-3xl overflow-hidden border border-slate-800 flex flex-col max-h-[75%]"
                initial={{ y: 150 }}
                animate={{ y: 0 }}
                exit={{ y: 150 }}
              >
                <div className="p-4 bg-[#050d12] border-b border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Bell size={14} className="text-[#00e1ef] animate-bounce" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-100">Broadcast Center</span>
                  </div>
                  <button 
                    onClick={() => setIsNotificationsOpen(false)}
                    className="p-1 px-2.5 bg-slate-800 rounded-full hover:bg-slate-700 transition cursor-pointer text-slate-400 font-black text-xs"
                  >
                    Close
                  </button>
                </div>

                <div className="p-4 overflow-y-auto space-y-3 shrink-1 text-left">
                  {broadcasts.map((b) => (
                    <div key={b.id} className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 flex gap-2 items-start justify-between">
                      <div className="flex-grow space-y-0.5">
                        <p className="text-[10.5px] leading-relaxed text-slate-250 font-medium">
                          {b.text}
                        </p>
                        <span className="text-[8px] font-mono font-extrabold text-slate-500 block">{b.time}</span>
                      </div>
                      <span className="w-1.5 h-1.5 bg-[#00e1ef] rounded-full shrink-0 mt-1.5"></span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PERSISTENT MODAL 2: BADGE QR RETRIEVAL SIMULATOR CARD */}
        <AnimatePresence>
          {isScannerOpen && (
            <motion.div 
              className="absolute inset-x-0 top-0 bottom-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-5 select-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              id="camera_scanner_modal"
            >
              <motion.div 
                className="w-full max-w-[340px] bg-[#070b0e] border border-slate-800 rounded-[28px] overflow-hidden text-center text-white"
                initial={{ scale: 0.9, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 15 }}
              >
                <div className="py-3 px-4 bg-slate-900 border-b border-slate-800/80 flex justify-between items-center text-left">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#00e1ef]">LEAD RETRIEVAL ACTIVE</span>
                  <button onClick={() => setIsScannerOpen(false)} className="p-1 text-slate-400 hover:text-white cursor-pointer"><X size={15} /></button>
                </div>

                <div className="p-5 space-y-4">
                  {/* Active Camera Target box */}
                  <div className="w-full aspect-square bg-[#030608] rounded-2xl border-2 border-slate-800 relative overflow-hidden flex flex-col items-center justify-center p-4">
                    
                    {/* Laser scanning laser line effect */}
                    <div className="absolute inset-x-0 h-0.5 bg-[#00ffd5]/60 animate-[pulse_1s_infinite] top-[30%]"></div>
                    
                    {/* Crosshair grids */}
                    <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-[#00ffd5]"></div>
                    <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-[#00ffd5]"></div>
                    <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-[#00ffd5]"></div>
                    <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-[#00ffd5]"></div>

                    {scannerSuccessMsg ? (
                      <div className="z-10 p-4 bg-emerald-900/90 rounded-2xl border border-emerald-500 scale-105 transition-all text-xs font-black uppercase text-emerald-100 flex flex-col items-center gap-1">
                        <CheckCircle size={20} className="text-emerald-400" />
                        <span>{scannerSuccessMsg}</span>
                      </div>
                    ) : (
                      <div className="space-y-2 z-10 p-2 text-center text-slate-400">
                        <span className="text-2xl block animate-spin">📷</span>
                        <p className="text-[10px] font-bold">Align attendee QR badge inside grid.</p>
                      </div>
                    )}
                  </div>

                  {/* Simulator Select Buttons - Pick attendee to mock scan */}
                  <div className="space-y-2">
                    <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block text-left mb-1">Simulate scanning badge registrations:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => handleSimulateScan("Julie Francoeur", "Fairtrade Canada", "communications@fairtrade.ca")}
                        className="py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 text-[10.5px] font-black uppercase rounded-xl transition cursor-pointer"
                      >
                        Julie Francoeur
                      </button>
                      <button 
                        onClick={() => handleSimulateScan("Marc-André Roberge", "Nectar Hive AI", "marc@nectar.buzz")}
                        className="py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-100 text-[10.5px] font-black uppercase rounded-xl transition cursor-pointer"
                      >
                        Marc-André R.
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PERSISTENT MODAL 3: IMMERSIVE UNIVERSAL SEARCH OVERLAY */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div 
              className="absolute inset-0 bg-white z-50 flex flex-col select-none text-slate-900"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              id="search_immersive_panel"
            >
              {/* Header Box */}
              <div className="shrink-0 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50">
                <div className="flex-grow relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search size={13} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search speakers, exhibitors, sessions..."
                    className="w-full bg-white border border-slate-250 placeholder-slate-400 text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none font-bold focus:ring-1 focus:ring-emerald-800"
                    autoFocus
                  />
                </div>
                <button 
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-[10px] uppercase rounded-xl transition cursor-pointer shrink-0"
                >
                  Cancel
                </button>
              </div>

              {/* Results View */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-left">
                {searchQuery.trim() === "" ? (
                  <div className="text-center py-10 space-y-2 text-slate-400">
                    <HelpCircle size={28} className="mx-auto opacity-40 animate-pulse" />
                    <p className="text-[11px] font-bold">Write query matching speakers, sessions or booths</p>
                    <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                      {["BioCult", "Alexander", "Regenerative", "Drone"].map((sWord) => (
                        <button 
                          key={sWord}
                          onClick={() => setSearchQuery(sWord)}
                          className="bg-slate-100 text-slate-600 font-black uppercase text-[9px] px-2.5 py-1 rounded-full border border-slate-200 cursor-pointer"
                        >
                          {sWord}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    
                    {/* Exhibitor Results */}
                    {filteredExhibitors.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block">Exhibiting Booths ({filteredExhibitors.length})</span>
                        <div className="space-y-2">
                          {filteredExhibitors.map(ex => (
                            <div 
                              key={ex.id} 
                              onClick={() => {
                                setIsSearchOpen(false);
                                setActiveTab("exhibitors");
                              }}
                              className="bg-slate-55 p-3 bg-slate-50 border rounded-2xl flex justify-between items-center cursor-pointer hover:bg-slate-100 transition"
                            >
                              <div>
                                <span className="text-xs font-black text-slate-900">{ex.logoAsset} {ex.name}</span>
                                <span className="text-[9px] text-slate-500 block font-bold">Loc: {ex.boothLocation} | {ex.focus}</span>
                              </div>
                              <ArrowRight size={12} className="text-emerald-800" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Speakers Results */}
                    {filteredSpeakers.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block">Speakers & Experts ({filteredSpeakers.length})</span>
                        <div className="space-y-2">
                          {filteredSpeakers.map(spk => (
                            <div 
                              key={spk.id} 
                              onClick={() => {
                                setIsSearchOpen(false);
                                setActiveTab("menu"); // Go to role-level profiles/agenda
                              }}
                              className="bg-slate-55 p-3 bg-slate-50 border rounded-2xl flex justify-between items-center cursor-pointer hover:bg-slate-100 transition"
                            >
                              <div>
                                <span className="text-xs font-black text-slate-900">🗣️ {spk.fullName}</span>
                                <span className="text-[9px] text-slate-500 block font-bold">{spk.topicTitle}</span>
                              </div>
                              <ArrowRight size={12} className="text-emerald-800" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sessions Results */}
                    {filteredSessions.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block">Agenda Presentations ({filteredSessions.length})</span>
                        <div className="space-y-2">
                          {filteredSessions.map(sess => (
                            <div 
                              key={sess.id} 
                              onClick={() => {
                                setIsSearchOpen(false);
                                setActiveTab("schedule");
                              }}
                              className="bg-slate-55 p-3 bg-slate-50 border rounded-2xl flex justify-between items-center cursor-pointer hover:bg-slate-100 transition"
                            >
                              <div>
                                <span className="text-xs font-black text-slate-900">📅 {sess.title}</span>
                                <span className="text-[9px] text-slate-500 block font-bold">{sess.startTime} - {sess.endTime} | Room: {sess.location}</span>
                              </div>
                              <ArrowRight size={12} className="text-emerald-800" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {filteredExhibitors.length === 0 && filteredSpeakers.length === 0 && filteredSessions.length === 0 && (
                      <div className="text-center py-8 text-slate-400 text-xs font-semibold">No direct results matching term.</div>
                    )}

                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {showQuestionnaire && (
          <ExhibitorQuestionnaire
            userEmail={currentUserEmail}
            userName={userSession?.displayName || "Exhibitor Guest"}
            onComplete={() => setShowQuestionnaire(false)}
          />
        )}

      </div>
    </div>
  );
}
