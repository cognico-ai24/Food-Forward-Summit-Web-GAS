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
  Building,
  Trash2,
  Contact
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
  const [isBadgeOpen, setIsBadgeOpen] = useState(false);

  // Notifications broadcasts queue
  const [broadcasts] = useState([
    { id: 1, text: "Keynote Rescheduled: Block B cellular engineering panel now starting at 1:15 PM.", read: false, time: "4m ago" },
    { id: 2, text: "Catering Notice: Vegan macro seaweed bites served fresh in the central courtyard.", read: true, time: "1h ago" },
    { id: 3, text: "Exhibitor Hall open. Touch interactive floor map down in Exhibitor tab to locate Booths.", read: true, time: "2h ago" }
  ]);
  const [unreadCount, setUnreadCount] = useState(1);

  // Search filter query
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState<"All" | "Speakers" | "Booths" | "Sessions">("All");

  // Search history state persisted in localStorage
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem("ffs_recent_searches");
    return saved ? JSON.parse(saved) : [];
  });

  const addToSearchHistory = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(q => q.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 6);
      localStorage.setItem("ffs_recent_searches", JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromSearchHistory = (query: string) => {
    setSearchHistory(prev => {
      const updated = prev.filter(q => q !== query);
      localStorage.setItem("ffs_recent_searches", JSON.stringify(updated));
      return updated;
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("ffs_recent_searches");
  };

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
  const filteredSpeakers = (searchCategory === "All" || searchCategory === "Speakers")
    ? speakersList.filter(s => 
        s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.topicTitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredExhibitors = (searchCategory === "All" || searchCategory === "Booths")
    ? exhibitors.filter(e => 
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        e.focus.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredSessions = (searchCategory === "All" || searchCategory === "Sessions")
    ? initialSessions.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.speaker.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className={`h-screen w-screen text-slate-900 font-sans flex items-center justify-center overflow-hidden transition-colors duration-300 ${
      isDarkMode ? "bg-[#060d17]" : "bg-[#f0f2f5]"
    }`}>
      
      {/* Outer Mock Container Frame - beautifully adapted for mobile, tablet, and desktop viewports */}
      <div className={`w-full h-full xl:max-w-4xl xl:h-[880px] xl:max-h-[94vh] flex flex-col relative xl:shadow-2xl xl:rounded-[32px] overflow-hidden xl:border border-slate-800 transition-colors duration-300 ${
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

            {/* My QR Badge button */}
            <button
              onClick={() => setIsBadgeOpen(true)}
              className="px-2.5 py-1.5 text-[#0a5f6a] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl cursor-pointer transition active:scale-90 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider select-none shrink-0"
              title="My QR Badge Pass"
            >
              <Contact size={12} className="text-emerald-700" />
              <span className="hidden sm:inline">My QR Badge</span>
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
        <main className="flex-1 overflow-hidden pl-[5px] pt-[5px] pr-[5px] pb-[70px] flex flex-col min-h-0 bg-[#f0f2f5]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.14 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <div 
                className="flex-1 flex flex-col min-h-0" 
                style={{ paddingBottom: '2px' }}
              >
                <div 
                  className="flex-1 flex flex-col min-h-0" 
                  style={{ paddingBottom: '2px' }}
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
                </div>
              </div>
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
                      {userSession && (
                        <button 
                          onClick={() => handleSimulateScan(
                            userSession.displayName || "Exhibitor Guest",
                            userSession.profile?.brandsRepresented || "Food Forward",
                            userSession.email
                          )}
                          className="col-span-2 py-2.5 bg-[#0a5f6a]/20 border border-[#21c3ce]/35 hover:bg-[#0a5f6a]/30 text-[#21c3ce] text-[10.5px] font-black uppercase rounded-xl transition cursor-pointer"
                        >
                          Scan My Own Badge ({userSession.displayName.split(' ')[0]})
                        </button>
                      )}
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
              <div className="shrink-0 px-4 pt-3 pb-2.5 border-b border-slate-200 flex flex-col gap-2.5 bg-slate-50">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-grow relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Search size={13} />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && searchQuery.trim() !== "") {
                          addToSearchHistory(searchQuery);
                        }
                      }}
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

                {/* Quick-filter dynamic buttons */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none shrink-0 select-none">
                  {[
                    { id: "All", label: "✨ All Items" },
                    { id: "Booths", label: "🌱 Booths" },
                    { id: "Speakers", label: "🗣️ Speakers" },
                    { id: "Sessions", label: "📅 Sessions" }
                  ].map(cat => {
                    const isActive = searchCategory === cat.id;
                    let activeStyles = "";
                    if (isActive) {
                      if (cat.id === "All") activeStyles = "bg-[#0a5f6a] text-white border-[#0a5f6a]";
                      else if (cat.id === "Booths") activeStyles = "bg-emerald-700 text-white border-emerald-700";
                      else if (cat.id === "Speakers") activeStyles = "bg-sky-700 text-white border-sky-700";
                      else if (cat.id === "Sessions") activeStyles = "bg-[#1e1b4b] text-white border-[#1e1b4b]";
                    } else {
                      activeStyles = "bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-100";
                    }

                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSearchCategory(cat.id as any)}
                        className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border shrink-0 transition duration-150 cursor-pointer ${activeStyles}`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Results View */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5 text-left">
                {searchQuery.trim() === "" ? (
                  <div className="space-y-5">
                    {/* Recent Searches */}
                    {searchHistory.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Clock size={10} className="text-slate-450" />
                            Recent Searches
                          </span>
                          <button
                            onClick={clearSearchHistory}
                            className="text-[9.5px] font-extrabold text-rose-600 hover:text-rose-700 uppercase tracking-wider flex items-center gap-1 cursor-pointer select-none border-none bg-transparent"
                          >
                            <Trash2 size={9.5} />
                            Clear All
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          {searchHistory.map((queryText, index) => (
                            <div 
                              key={index}
                              className="flex items-center justify-between bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 hover:bg-slate-100/80 transition duration-150 group"
                            >
                              <button
                                onClick={() => {
                                  setSearchQuery(queryText);
                                  setSearchCategory("All"); // Reset category to ensure user actually hits records
                                }}
                                className="flex-grow text-left text-[11px] font-bold text-slate-700 hover:text-slate-900 flex items-center gap-2 cursor-pointer select-none"
                              >
                                <Search size={11} className="text-slate-400 group-hover:text-slate-600" />
                                <span>{queryText}</span>
                              </button>
                              <button
                                onClick={() => removeFromSearchHistory(queryText)}
                                className="p-1 px-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer select-none"
                                title="Remove item"
                              >
                                <X size={11} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Default Suggested Keywords */}
                    <div className="space-y-2">
                      <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Sparkles size={10} className="text-amber-500" />
                        Trending & Suggested Topics
                      </span>
                      <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-2xl space-y-3">
                        <p className="text-[10px] font-bold text-slate-550 leading-relaxed">
                          Tap a suggested keyword below to instantly filter speaking panels, agricultural tech booths, or agenda tracks:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {["BioCult", "Alexander", "Regenerative", "Drone", "Milano", "Aquaculture", "Decarbonization"].map((sWord) => (
                            <button 
                              key={sWord}
                              onClick={() => {
                                setSearchQuery(sWord);
                                addToSearchHistory(sWord);
                                setSearchCategory("All"); // Ensure all show
                              }}
                              className="bg-white text-[#0a5f6a] hover:bg-slate-100 font-extrabold text-[9px] px-2.5 py-1.5 rounded-full border border-slate-200 shadow-xs cursor-pointer select-none transition"
                            >
                              💡 {sWord}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fadeIn">
                    
                    {/* Exhibitor Results */}
                    {filteredExhibitors.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block">Exhibiting Booths ({filteredExhibitors.length})</span>
                        <div className="space-y-2">
                          {filteredExhibitors.map(ex => (
                            <div 
                              key={ex.id} 
                              onClick={() => {
                                addToSearchHistory(searchQuery);
                                setIsSearchOpen(false);
                                setActiveTab("exhibitors");
                              }}
                              className="bg-slate-50 p-3 border border-slate-150 hover:border-slate-350 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-slate-100 transition duration-150"
                            >
                              <div>
                                <span className="text-xs font-black text-slate-900">{ex.logoAsset} {ex.name}</span>
                                <span className="text-[9.5px] text-slate-500 block font-bold mt-0.5">Loc: {ex.boothLocation} | {ex.focus}</span>
                              </div>
                              <ArrowRight size={12} className="text-[#0a5f6a]" />
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
                                addToSearchHistory(searchQuery);
                                setIsSearchOpen(false);
                                setActiveTab("menu"); // Go to role-level profiles or agenda review
                              }}
                              className="bg-slate-55 p-3 bg-slate-50 border border-slate-150 hover:border-slate-350 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-slate-100 transition duration-150"
                            >
                              <div>
                                <span className="text-xs font-black text-slate-900">🗣️ {spk.fullName}</span>
                                <span className="text-[9.5px] text-slate-500 block font-bold mt-0.5">{spk.topicTitle}</span>
                              </div>
                              <ArrowRight size={12} className="text-[#0a5f6a]" />
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
                                addToSearchHistory(searchQuery);
                                setIsSearchOpen(false);
                                setActiveTab("schedule");
                              }}
                              className="bg-slate-55 p-3 bg-slate-50 border border-slate-150 hover:border-slate-350 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-slate-100 transition duration-150"
                            >
                              <div>
                                <span className="text-xs font-black text-slate-900">📅 {sess.title}</span>
                                <span className="text-[9.5px] text-slate-500 block font-bold mt-0.5">{sess.startTime} - {sess.endTime} | Room: {sess.location}</span>
                              </div>
                              <ArrowRight size={12} className="text-[#0a5f6a]" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {filteredExhibitors.length === 0 && filteredSpeakers.length === 0 && filteredSessions.length === 0 && (
                      <div className="text-center py-12 text-slate-400">
                        <HelpCircle size={24} className="mx-auto opacity-30 mb-2" />
                        <p className="text-xs font-semibold">No direct results matching "{searchQuery}" under the selected category.</p>
                        <button 
                          onClick={() => setSearchCategory("All")}
                          className="mt-2.5 text-[10px] font-extrabold uppercase text-[#0a5f6a] bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200"
                        >
                          Clear Categories Filter
                        </button>
                      </div>
                    )}

                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PERSISTENT MODAL 4: USER'S OWN QR CODES BADGE PASS CARD */}
        <AnimatePresence>
          {isBadgeOpen && (
            <motion.div 
              className="absolute inset-x-0 top-0 bottom-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-5 select-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              id="my_qr_badge_modal"
            >
              <motion.div 
                className="w-full max-w-[344px] max-h-[88vh] bg-white border border-slate-200 rounded-[24px] overflow-hidden shadow-2xl flex flex-col text-slate-900 animate-fadeIn"
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
              >
                {/* Header box with green theme accent representing B2B agrarian/green economy axes */}
                <div className="bg-[#091b2e] text-white p-3.5 border-b border-slate-800 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Contact size={14} className="text-[#10b981]" />
                    <span className="text-[9.5px] font-black uppercase tracking-widest text-[#10b981]">FFS Digital Badge</span>
                  </div>
                  <button 
                    onClick={() => setIsBadgeOpen(false)} 
                    className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition cursor-pointer select-none"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="p-5 overflow-y-auto flex-1 space-y-4 text-center scrollbar-thin">
                  {/* Badge Physical Frame Mockup */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 space-y-3.5 shadow-sm relative overflow-hidden">
                    {/* Top colored status pill - Forest Green/Maritime Blue gradient */}
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-600 to-[#0a5f6a]"></div>
                    
                    {/* Event logo context */}
                    <div className="text-center">
                      <span className="text-[8px] font-black tracking-widest text-slate-400 uppercase">FOOD FORWARD SUMMIT 2026</span>
                    </div>

                    {/* QR Code container */}
                    <div className="bg-white p-3.5 rounded-xl border border-slate-150 inline-block shadow-sm relative group mx-auto">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                          `BEGIN:VCARD\nVERSION:3.0\nFN:${userSession?.displayName || "Guest"}\nORG:${userSession?.profile?.brandsRepresented || "Food Forward"}\nEMAIL:${userSession?.email || ""}\nTITLE:${currentUserRole}\nNOTE:Scanned via Food Forward 2026\nEND:VCARD`
                        )}&color=052e16`}
                        alt="Your QR Badge Pass"
                        className="w-40 h-40 object-contain mx-auto transition-transform duration-300 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Attendees Detail Segment */}
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-slate-900 tracking-tight">{userSession?.displayName || "Experimental Guest"}</h4>
                      <p className="text-[10px] text-[#0a5f6a] font-extrabold uppercase tracking-wide">
                        {userSession?.profile?.brandsRepresented || "Food Forward Summit"}
                      </p>
                      
                      <div className="pt-1 flex flex-col gap-0.5 text-center">
                        <span className="text-[9.5px] font-mono font-bold text-slate-500">{userSession?.email}</span>
                        <div className="mt-1.5 inline-flex self-center items-center gap-1 px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-100">
                          🟢 {currentUserRole} Tier
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description helper */}
                  <p className="text-[10px] text-slate-500 leading-relaxed max-w-[280px] mx-auto">
                    Present this digital QR badge code at any sponsor table or networking terminal to instantly sync and share your business profile contact credentials.
                  </p>

                  {/* Recently Scanned By Section */}
                  <div className="border-t border-slate-100 pt-3.5 text-left">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9.5px] font-black uppercase tracking-wider text-[#0a5f6a] flex items-center gap-1">
                        <Users size={11} className="text-[#10b981]" />
                        Recently Scanned By ({scannedContacts.length})
                      </span>
                      <span className="text-[7.5px] font-mono font-extrabold px-1.5 bg-slate-100 text-slate-500 rounded uppercase">Live Sync</span>
                    </div>

                    {scannedContacts.length === 0 ? (
                      <div className="bg-slate-50 rounded-xl p-3 border border-dashed border-slate-200 text-center">
                        <p className="text-[9px] text-slate-400 font-semibold leading-relaxed">
                          Your badge has not been captured yet. Present your QR code to other delegates to initiate a sync!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                        {scannedContacts.map((contact) => (
                          <div 
                            key={contact.id} 
                            className="flex items-center justify-between bg-slate-50 hover:bg-emerald-50/50 p-2 rounded-xl border border-slate-100 transition duration-150"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-6.5 h-6.5 rounded-full bg-[#0a5f6a]/10 border border-[#0a5f6a]/20 flex items-center justify-center text-[#0a5f6a] font-black text-[9.5px] shrink-0">
                                {contact.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-black text-slate-900 truncate leading-tight">{contact.name}</p>
                                <p className="text-[8px] text-[#0a5f6a] font-extrabold uppercase tracking-wider truncate leading-none mt-0.5">{contact.company}</p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[7.5px] font-mono font-bold text-slate-400">
                                {new Date(contact.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <div className="text-[7px] px-1 py-0.2 bg-emerald-100/75 text-emerald-800 font-extrabold rounded uppercase tracking-wide mt-0.5">
                                Synced
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Hub */}
                  <div className="space-y-2 pt-1.5">
                    <button
                      onClick={() => {
                        const copyText = `${userSession?.displayName || "Guest"}\nCompany: ${userSession?.profile?.brandsRepresented || "Food Forward"}\nEmail: ${userSession?.email || ""}\nRole: ${currentUserRole}`;
                        navigator.clipboard.writeText(copyText);
                        playBeepSound();
                      }}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer select-none border border-slate-250 cursor-pointer"
                    >
                      📋 Copy Card Credentials
                    </button>

                    <button
                      onClick={() => {
                        setIsBadgeOpen(false);
                        setIsScannerOpen(true);
                      }}
                      className="w-full py-2 bg-gradient-to-r from-emerald-800 to-[#0a5f6a] text-white hover:opacity-90 text-[10px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer select-none cursor-pointer"
                    >
                      📸 Test Scanner Simulator
                    </button>
                  </div>

                </div>
              </motion.div>
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
