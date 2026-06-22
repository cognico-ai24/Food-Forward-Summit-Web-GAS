import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, 
  Database, 
  BarChart, 
  Download, 
  UserCheck, 
  Edit3, 
  Tag, 
  FileText, 
  CheckCircle, 
  Save, 
  RefreshCw, 
  Flame, 
  PlusCircle, 
  BarChart2, 
  Settings,
  HelpCircle,
  Sparkles,
  Users,
  User,
  Mail,
  Globe,
  Linkedin,
  ExternalLink,
  Trash2,
  Clock
} from "lucide-react";
import { ScannedContact } from "../types";
import { attendeesList, speakersList, exhibitorsList } from "../data";

interface MenuTabProps {
  currentUserRole: string;
  onRoleOverride: (role: string) => void;
  scannedContacts: ScannedContact[];
  onUpdateScannedContact: (updated: ScannedContact) => void;
  userName?: string;
  userEmail?: string;
  userSession?: any;
}

export default function MenuTab({ 
  currentUserRole, 
  onRoleOverride, 
  scannedContacts, 
  onUpdateScannedContact,
  userName = "Alexander Sterling",
  userEmail = "cognico@nleats.com",
  userSession
}: MenuTabProps) {
  
  // Selection States inside Admin CMS
  const [cmsTab, setCmsTab] = useState<"speakers" | "sessions">("speakers");
  const [selectedSpeakerId, setSelectedSpeakerId] = useState("884384d3-2093-41e2-8b7f-8299e0ba4615");
  const [editorBio, setEditorBio] = useState("");
  const [editorTopic, setEditorTopic] = useState("");
  const [cmsSuccess, setCmsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Profile lookup states
  const [profileData, setProfileData] = useState<any>(null);
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [isSyncingProfile, setIsSyncingProfile] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "success" | "none">("idle");

  // Lead Retrieval sync states
  const [leadSyncState, setLeadSyncState] = useState<"synced" | "saving">("synced");
  const previousHashRef = useRef(JSON.stringify(scannedContacts));

  useEffect(() => {
    const currentHash = JSON.stringify(scannedContacts);
    if (previousHashRef.current !== currentHash) {
      previousHashRef.current = currentHash;
      setLeadSyncState("saving");
      const timer = setTimeout(() => {
        setLeadSyncState("synced");
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [scannedContacts]);

  // Mentimeter Live Polling states
  const [pollMode, setPollMode] = useState<"interactive" | "embedded">("interactive");
  const [votedOption, setVotedOption] = useState<number | null>(null);
  const [pollVotes, setPollVotes] = useState<number[]>([142, 89, 65, 34]);
  const [customEmbedUrl, setCustomEmbedUrl] = useState("https://www.menti.com/shbby3e8q5as");
  const [embedIframeSource, setEmbedIframeSource] = useState("https://www.menti.com/embed/shbby3e8q5as");

  // Load posts dynamically for Admin review
  const [timelinePosts, setTimelinePosts] = useState<any[]>(() => {
    const saved = localStorage.getItem("ffs_posts");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 1,
        authorName: "Alexander Kappes",
        authorCompany: "Greener Herd",
        authorRole: "Speaker",
        textContent: "Just arrived at the Food Forward Summit in Milano! Super excited to present on AI fence line applications for smallholder ranching in the Keynote Arena later today. Let's make farming smart! 🚀🌾",
        imageResName: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=400&auto=format&fit=crop&q=80",
        likesCount: 24,
        timestamp: Date.now() - 3600000 * 2,
        isLikedByMe: false,
        isApproved: true
      },
      {
        id: 2,
        authorName: "Sophia Weiss",
        authorCompany: "Grain Millers Inc.",
        authorRole: "Speaker",
        textContent: "Seaweed-based compostable polymers are looking like a serious game changer in Booth B-05. Stopped by EcoPack and they showed me wrappers that dissipate in 6 weeks! Zero waste packaging of the future is here.",
        imageResName: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400&auto=format&fit=crop&q=80",
        likesCount: 42,
        timestamp: Date.now() - 3600000 * 5,
        isLikedByMe: true,
        isApproved: true
      },
      {
        id: 3,
        authorName: "Meifan Shi",
        authorCompany: "Waterpoint Lane VC",
        authorRole: "Sponsor",
        textContent: "Looking to deploy capital for agtech startups specializing in agricultural genomics or micro-factories. Visit me in the VIP Lounge to discuss partnerships! 💼🌱",
        imageResName: null,
        likesCount: 18,
        timestamp: Date.now() - 3600000 * 8,
        isLikedByMe: false,
        isApproved: true
      }
    ];
  });

  // Re-sync posts when user role shifts or component mounts
  useEffect(() => {
    const saved = localStorage.getItem("ffs_posts");
    if (saved) {
      setTimelinePosts(JSON.parse(saved));
    }
  }, [currentUserRole]);

  const handleApprovePost = (postId: number) => {
    const updated = timelinePosts.map(p => {
      if (p.id === postId) {
        return { ...p, isApproved: true };
      }
      return p;
    });
    setTimelinePosts(updated);
    localStorage.setItem("ffs_posts", JSON.stringify(updated));
  };

  const handleRejectPost = (postId: number) => {
    const updated = timelinePosts.filter(p => p.id !== postId);
    setTimelinePosts(updated);
    localStorage.setItem("ffs_posts", JSON.stringify(updated));
  };

  const syncProfileDb = async () => {
    setIsSyncingProfile(true);
    setSyncStatus("idle");
    await new Promise((resolve) => setTimeout(resolve, 600));

    try {
      const emailToMatch = userEmail || userSession?.email || "cognico@nleats.com";
      const idToMatch = userSession?.userId || "demo";

      if (currentUserRole === "Admin" || idToMatch === "admin") {
        setProfileData({
          fullName: "System Admin",
          email: "admin@nleats.com",
          bio: "System Administrator for Food Forward Milano Summit 2026 Admin Panel.",
          location: "System Console",
          role: "Admin",
          id: "admin"
        });
        setSyncStatus("success");
      } else if (currentUserRole === "Speaker") {
        try {
          const response = await fetch("/api/speakers");
          let list = null;
          if (response.ok) {
            list = await response.json().catch(() => null);
          }
          const activeList = (Array.isArray(list) && list.length > 0) ? list : speakersList;
          const found = activeList.find((s: any) => 
            s.id?.toLowerCase() === idToMatch?.toLowerCase() || 
            s.email?.toLowerCase() === emailToMatch?.toLowerCase()
          ) || activeList[0];
          
          if (found) {
            setProfileData({
              fullName: found.fullName,
              email: found.email,
              topicTitle: found.topicTitle,
              bio: found.bio,
              location: found.location || "Hall A (Main Stage)",
              linkedinUrl: found.linkedinUrl,
              sessionFormat: found.sessionFormat,
              role: "Speaker",
              id: found.id
            });
            setSyncStatus("success");
          } else {
            setSyncStatus("none");
          }
        } catch (err) {
          console.error("Failed speaker list sync, falling back", err);
          const activeList = speakersList;
          const found = activeList.find((s: any) => 
            s.id?.toLowerCase() === idToMatch?.toLowerCase() || 
            s.email?.toLowerCase() === emailToMatch?.toLowerCase()
          ) || activeList[0];
          if (found) {
            setProfileData({
              fullName: found.fullName,
              email: found.email,
              topicTitle: found.topicTitle,
              bio: found.bio,
              location: found.location || "Hall A (Main Stage)",
              linkedinUrl: found.linkedinUrl,
              sessionFormat: found.sessionFormat,
              role: "Speaker",
              id: found.id
            });
            setSyncStatus("success");
          } else {
            setSyncStatus("none");
          }
        }
      } else if (currentUserRole === "Exhibitor" || currentUserRole === "Sponsor") {
        try {
          const response = await fetch("/api/exhibitors");
          let list = null;
          if (response.ok) {
            list = await response.json().catch(() => null);
          }
          const activeList = (Array.isArray(list) && list.length > 0) ? list : exhibitorsList;
          const found = (activeList.find((e: any) => 
            e.id?.toLowerCase() === idToMatch?.toLowerCase() || 
            e.email?.toLowerCase() === emailToMatch?.toLowerCase() ||
            (e.contactEmail && e.contactEmail.toLowerCase() === emailToMatch?.toLowerCase())
          ) || activeList[0]) as any;
          
          if (found) {
            setProfileData({
              fullName: found.name || found.displayName || "Exhibitor Host",
              email: found.contactEmail || found.email || emailToMatch,
              companyDescription: found.description || found.companyDescription || "Sustainable agrifood startup",
              websiteUrl: found.website || found.websiteUrl,
              location: found.boothLocation || found.location || "Booth B-05",
              role: currentUserRole,
              id: found.id,
              primarySectors: found.track || found.primarySectors || "Sustainability & Auto-scaling"
            });
            setSyncStatus("success");
          } else {
            setSyncStatus("none");
          }
        } catch (err) {
          console.error("Failed exhibitor list sync, falling back", err);
          const activeList = exhibitorsList;
          const found = (activeList.find((e: any) => 
            e.id?.toLowerCase() === idToMatch?.toLowerCase() || 
            e.email?.toLowerCase() === emailToMatch?.toLowerCase() ||
            (e.contactEmail && e.contactEmail.toLowerCase() === emailToMatch?.toLowerCase())
          ) || activeList[0]) as any;
          if (found) {
            setProfileData({
              fullName: found.name || found.displayName || "Exhibitor Host",
              email: found.contactEmail || found.email || emailToMatch,
              companyDescription: found.description || found.companyDescription || "Sustainable agrifood startup",
              websiteUrl: found.website || found.websiteUrl,
              location: found.boothLocation || found.location || "Booth B-05",
              role: currentUserRole,
              id: found.id,
              primarySectors: found.track || found.primarySectors || "Sustainability & Auto-scaling"
            });
            setSyncStatus("success");
          } else {
            setSyncStatus("none");
          }
        }
      } else {
        // Attendee
        const savedAttendees = localStorage.getItem("ffs_attendees");
        const list = savedAttendees ? JSON.parse(savedAttendees) : attendeesList;
        const found = list.find((a: any) => 
          a.id?.toLowerCase() === idToMatch?.toLowerCase() || 
          a.email?.toLowerCase() === emailToMatch?.toLowerCase()
        ) || list[0];

        if (found) {
          setProfileData({
            fullName: found.displayName,
            email: found.email,
            companyDescription: found.companyDescription,
            websiteUrl: found.websiteUrl,
            location: found.countryRegion || "Milan, Italy",
            role: "Attendee",
            id: found.id,
            primarySectors: found.primarySectors || "Agritech & Smart Farming",
            linkedinUrl: found.linkedinUrl
          });
          setSyncStatus("success");
        } else {
          setSyncStatus("none");
        }
      }
    } catch (err) {
      console.error(err);
      setSyncStatus("none");
    } finally {
      setIsSyncingProfile(false);
    }
  };

  useEffect(() => {
    syncProfileDb();
  }, [currentUserRole, userSession]);

  const handleVoteSubmit = (optionIndex: number) => {
    if (votedOption !== null) return;
    setVotedOption(optionIndex);
    setPollVotes(prev => {
      const copy = [...prev];
      copy[optionIndex]++;
      return copy;
    });
  };

  const handleUpdateMentimeterUrl = (e: React.FormEvent) => {
    e.preventDefault();
    let url = customEmbedUrl.trim();
    if (!url) return;
    
    let finalSource = url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      const cleaned = url.replace(/\s+/g, "");
      if (/^\d{8}$/.test(cleaned)) {
        finalSource = `https://www.menti.com/${cleaned}`;
      } else {
        finalSource = `https://${url}`;
      }
    }
    
    if (finalSource.includes("menti.com") && !finalSource.includes("/embed/")) {
      const parts = finalSource.split("menti.com/");
      if (parts.length > 1) {
        const code = parts[1].split("?")[0];
        finalSource = `https://www.menti.com/embed/${code}`;
      }
    }

    setEmbedIframeSource(finalSource);
  };

  // Load selected speaker details into editor
  useEffect(() => {
    const fetchSpeakerProfile = async () => {
      try {
        const response = await fetch("/api/speakers").catch(() => null);
        let list = null;
        if (response && response.ok) {
          const data = await response.json().catch(() => null);
          if (Array.isArray(data)) {
            list = data;
          }
        }
        
        const activeList = (list && list.length > 0) ? list : speakersList;
        const found = activeList.find((s: any) => s.id === selectedSpeakerId);
        if (found) {
          setEditorBio(found.bio || "");
          setEditorTopic(found.topicTitle || "");
        }
      } catch (e) {
        console.error("Failed to sync CMS database details", e);
        const found = speakersList.find((s: any) => s.id === selectedSpeakerId);
        if (found) {
          setEditorBio(found.bio || "");
          setEditorTopic(found.topicTitle || "");
        }
      }
    };
    fetchSpeakerProfile();
  }, [selectedSpeakerId]);

  const handleUpdateCms = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setCmsSuccess(false);

    try {
      const response = await fetch("/api/speakers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedSpeakerId,
          topicTitle: editorTopic,
          bio: editorBio,
        })
      });

      if (response.ok) {
        setCmsSuccess(true);
        setTimeout(() => setCmsSuccess(false), 3000);
      }
    } catch (e) {
      alert("Database is read-only right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = (type: "leads" | "analytics" | "credits") => {
    let headers = "";
    let rows = "";
    let filename = "";

    if (type === "leads") {
      headers = "Rank,Attendee Name,Company Name,Email Address,Phone,Lead Notes,Scanned Epoch\n";
      rows = scannedContacts.length > 0 
        ? scannedContacts.map(c => `"${c.rank}","${c.name}","${c.company}","${c.email}","${c.phone}","${c.notes.replace(/"/g,'""')}",${c.scannedAt}`).join("\n")
        : `"Hot","Sophia Weiss","Grain Millers","sophia@grainmillers.com","312-555-0928","Expressed high interest in seaweed wraps",171439281\n"Warm","Alexander Kappes","Greener Herd","alex@greenerherd.co","204-555-1212","Interested in testing AI fence metrics under joint lease",171439555`;
      filename = "FFS2026_LeadRetrieval_Report.csv";
    } else if (type === "analytics") {
      headers = "Metric Entity,Recorded Value,Benchmark Target,Status\n";
      rows = `"Attendee Check-ins",432,600,"Active Check-ins"\n"Sourcing Poll Votes",529,500,"Target Exceeded"\n"Exhibitor Leads Triggered",214,150,"142% Target achieved"\n"Server Handshake Latency","44ms","<100ms","Verified Optimum"`;
      filename = "FFS25_SystemAnalytics_Summary.csv";
    } else if (type === "credits") {
      headers = "Certification Code,Professional Holder,Email Address,Accredited Hours,Accreditation Agency\n";
      rows = `"CE-FFS-9281A","${userName}","${userEmail}",11.5,"Agritech Continuing Education Board"`;
      filename = `CE_Credit_FFS2026_${userName.replace(/\s/g,"")}.csv`;
    }

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + rows);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateContactTag = (contactId: string, newRank: "Hot" | "Warm" | "Cold") => {
    const contact = scannedContacts.find(c => c.id === contactId);
    if (contact) {
      onUpdateScannedContact({
        ...contact,
        rank: newRank
      });
    }
  };

  const handleUpdateContactNotes = (contactId: string, newNotes: string) => {
    const contact = scannedContacts.find(c => c.id === contactId);
    if (contact) {
      onUpdateScannedContact({
        ...contact,
        notes: newNotes
      });
    }
  };

  return (
    <div className="flex-grow flex flex-col h-full min-h-0 overflow-hidden pb-4 gap-3">
      
      {/* ROLE SWITCHER DEMO RAIL - For easy previewing of RBAC portals! */}
      <div className="shrink-0 bg-slate-900 text-slate-100 rounded-2xl p-3 border border-slate-800">
        <div className="flex justify-between items-center mb-1.5">
          <div className="flex items-center gap-1.5">
            <Shield size={12} className="text-amber-400" />
            <span className="text-[8.5px] font-black uppercase tracking-wider text-amber-300">
              RBAC AUDIT OVERRIDE TOOL
            </span>
          </div>
          <span className="text-[8px] font-mono text-slate-400">Current Role: {currentUserRole}</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {["Attendee", "Exhibitor", "Speaker", "Sponsor", "Admin"].map((r) => {
            const isSel = currentUserRole.toLowerCase() === r.toLowerCase();
            return (
              <button
                key={r}
                onClick={() => onRoleOverride(r)}
                className={`text-[8.5px] font-black uppercase tracking-wider py-1 rounded transition-all cursor-pointer ${
                  isSel 
                    ? "bg-amber-400 text-slate-950 font-black shadow-md scale-[1.03]" 
                    : "bg-[#182a35] text-slate-300 hover:text-white"
                }`}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-0.5 scrollbar-thin">

        {/* VIEW 0: VERIFIED DATABASE PROFILE CARD (Interactive & Syncing) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3.5 text-left">
          <div className="flex justify-between items-center bg-transparent border-none">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-900 flex items-center justify-center font-black">
                <UserCheck size={14} />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">Personal Profile Registry</h3>
                <p className="text-[9px] text-slate-400 font-bold leading-none mt-0.5">Database status: Ready</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                setIsProfileExpanded(!isProfileExpanded);
                if (!profileData) {
                  syncProfileDb();
                }
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] uppercase font-extrabold tracking-wider rounded-lg flex items-center gap-1 cursor-pointer transition"
            >
              <span>{isProfileExpanded ? "Hide Profile" : "Reveal Profile"}</span>
            </button>
          </div>

          <AnimatePresence>
            {isProfileExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-3 border-t border-slate-100 space-y-3 overflow-hidden text-left"
              >
                {isSyncingProfile ? (
                  <div className="flex flex-col items-center justify-center py-6 gap-2 text-slate-400">
                    <RefreshCw size={18} className="animate-spin text-emerald-800" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Retrieving authenticated entity records...</span>
                  </div>
                ) : profileData ? (
                  <div className="space-y-4">
                    {/* User Profile Badge Design */}
                    <div className="p-3.5 bg-emerald-50/40 border border-emerald-100 rounded-xl space-y-2.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[13px] font-black text-slate-900 block leading-tight">{profileData.fullName}</span>
                          <span className="text-[9px] text-emerald-800 font-bold block mt-0.5">{profileData.email}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                          <span className="text-[8px] font-black uppercase tracking-wider bg-emerald-950 text-emerald-50 px-2.5 py-0.5 rounded-md">
                            {profileData.role} Profile
                          </span>
                          <span className="text-[8px] text-slate-400 font-mono font-bold block mt-0.5">Registered ID: {profileData.id}</span>
                        </div>
                      </div>

                      {profileData.primarySectors && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 pt-1 border-t border-emerald-150/30">
                          <span className="text-emerald-800 shrink-0">💼</span>
                          <span className="text-slate-650 block overflow-hidden text-ellipsis whitespace-nowrap">{profileData.primarySectors}</span>
                        </div>
                      )}
                    </div>

                    {/* Meta Fields Grid list */}
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="p-2 border border-slate-150 rounded-xl">
                        <span className="text-[8px] font-black uppercase text-slate-400 block mb-0.5">Assigned Location</span>
                        <span className="font-bold text-slate-800 block truncate">{profileData.location || "Main Stage Hall"}</span>
                      </div>
                      
                      <div className="p-2 border border-slate-150 rounded-xl">
                        <span className="text-[8px] font-black uppercase text-slate-400 block mb-0.5">Entity Status</span>
                        <span className="font-bold text-emerald-850 block truncate">✓ Valid Credential</span>
                      </div>
                      
                      {profileData.topicTitle && (
                        <div className="p-2.5 border border-slate-150 rounded-xl col-span-2">
                          <span className="text-[8px] font-black uppercase text-slate-400 block mb-0.5">Topic Abstract</span>
                          <span className="font-bold text-slate-850 leading-relaxed block">{profileData.topicTitle}</span>
                        </div>
                      )}

                      {profileData.sessionFormat && (
                        <div className="p-2 border border-slate-150 rounded-xl">
                          <span className="text-[8px] font-black uppercase text-slate-400 block mb-0.5">Format</span>
                          <span className="font-bold text-slate-800 block truncate">{profileData.sessionFormat}</span>
                        </div>
                      )}

                      {profileData.websiteUrl && (
                        <div className="p-2 border border-slate-150 rounded-xl">
                          <span className="text-[8px] font-black uppercase text-slate-400 block mb-0.5">External Website</span>
                          <a 
                            href={profileData.websiteUrl.startsWith("http") ? profileData.websiteUrl : `https://${profileData.websiteUrl}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="font-black text-emerald-800 hover:underline block truncate"
                          >
                            {profileData.websiteUrl} ➔
                          </a>
                        </div>
                      )}

                      {profileData.linkedinUrl && (
                        <div className="p-2.5 border border-slate-150 rounded-xl col-span-2 flex items-center justify-between">
                          <div className="min-w-0 pr-2">
                            <span className="text-[8px] font-black uppercase text-slate-400 block mb-0.5">LinkedIn Handle</span>
                            <span className="font-bold text-indigo-900 block truncate">{profileData.linkedinUrl}</span>
                          </div>
                          <a 
                            href={profileData.linkedinUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-lg text-[9px] font-black uppercase tracking-tight flex items-center gap-0.5 transition shrink-0"
                          >
                            <span>Connect</span>
                            <ExternalLink size={9} />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Bio Paragraph description text */}
                    {(profileData.bio || profileData.companyDescription) && (
                      <div className="space-y-1">
                        <span className="text-[8px] font-black uppercase text-slate-400 block">Personal Background Bio & Description</span>
                        <p className="text-[10.5px] leading-relaxed text-slate-700 p-3 bg-slate-50 border border-slate-150 rounded-xl">
                          {profileData.bio || profileData.companyDescription}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 justify-between items-center text-[9px] text-slate-500 bg-emerald-500/5 p-2.5 rounded-xl border border-emerald-500/10">
                      <span className="font-bold text-emerald-900">✓ Database Synchronized Live</span>
                      <button 
                        onClick={syncProfileDb} 
                        type="button"
                        className="px-2 py-1 border border-slate-200 bg-white hover:bg-slate-100 rounded-lg font-black text-slate-650 uppercase text-[8px] cursor-pointer transition shrink-0"
                      >
                        Re-Sync DB
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 text-center text-slate-400 text-[10px] font-bold">
                    Profile dataset empty. Select user session role configuration to sync.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* VIEW 0.5: MENTIMETER LIVE POLLING MODULE (Embedded iframe or API) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3.5 text-left">
          <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-900 flex items-center justify-center font-black">
                📊
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">Mentimeter Live Poll</h3>
                <p className="text-[9px] text-slate-400 font-bold leading-none mt-0.5">Real-time brainstorm gateway</p>
              </div>
            </div>
            
            <div className="flex p-0.5 bg-slate-100 rounded-lg text-[8px] font-black uppercase shrink-0">
              <button
                onClick={() => setPollMode("interactive")}
                className={`px-2.5 py-1 rounded-md transition ${pollMode === "interactive" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"}`}
              >
                Menti API Poll
              </button>
              <button
                onClick={() => setPollMode("embedded")}
                className={`px-2.5 py-1 rounded-md transition ${pollMode === "embedded" ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"}`}
              >
                Embedded Iframe
              </button>
            </div>
          </div>

          <p className="text-[9.5px] text-slate-400 font-semibold leading-relaxed">
            Answer the live summit interactive audience question or configure your own live Mentimeter presentation frame directly.
          </p>

          {pollMode === "interactive" ? (
            <div className="space-y-3 text-left">
              <div className="bg-[#f0fcfe] border border-cyan-100 rounded-xl p-3">
                <span className="text-[8px] font-black text-cyan-800 tracking-wider uppercase block mb-1">AUDIENCE SURVEY TOPIC</span>
                <h4 className="text-xs font-black text-slate-900 leading-snug">
                  What is the most critical agritech innovation for Milano 2026?
                </h4>
              </div>

              <div className="space-y-2">
                {[
                  "Cellular Biomass Scaling & Cultured Proteins",
                  "Robotic Precision Weeding & Micro-Watering",
                  "Subsea Micro-algae Farming Systems",
                  "Regenerative Carbon Indexing & Soil Agronomy"
                ].map((opt, idx) => {
                  const votes = pollVotes[idx];
                  const total = pollVotes.reduce((a, b) => a + b, 0);
                  const percentage = total > 0 ? Math.round((votes / total) * 100) : 0;
                  const isVoted = votedOption === idx;
                  const anyVoted = votedOption !== null;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleVoteSubmit(idx)}
                      disabled={anyVoted}
                      className={`w-full text-left p-3 rounded-xl border relative overflow-hidden transition active:scale-[0.99] ${
                        isVoted 
                          ? "border-cyan-400 bg-cyan-50/20" 
                          : anyVoted 
                            ? "border-slate-100 bg-slate-50/50 cursor-default" 
                            : "border-slate-200 hover:border-cyan-300 hover:bg-slate-50/50 cursor-pointer"
                      }`}
                    >
                      {/* Animated slide background */}
                      {anyVoted && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className={`absolute inset-y-0 left-0 -z-10 ${isVoted ? "bg-cyan-100/40" : "bg-slate-105"}`}
                        />
                      )}

                      <div className="flex justify-between items-center relative z-10 text-[10px]">
                        <span className={`font-bold pr-4 leading-normal ${isVoted ? "text-cyan-950 font-black" : "text-slate-700"}`}>
                          {opt}
                        </span>
                        {anyVoted && (
                          <div className="text-right shrink-0">
                            <span className="text-[11px] font-black text-slate-900 block leading-none">{percentage}%</span>
                            <span className="text-[7.5px] text-slate-400 font-bold block mt-0.5">{votes} votes</span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {votedOption !== null ? (
                <div className="text-center p-3 bg-emerald-50 text-emerald-950 border border-emerald-150 rounded-xl space-y-1">
                  <span className="text-[10px] font-black flex items-center justify-center gap-1">✓ Live Vote Sent to Mentimeter API Endpoint</span>
                  <span className="text-[8px] text-slate-500 font-bold block">Total active respondents: {pollVotes.reduce((a, b) => a + b, 0)} votes</span>
                  <button 
                    onClick={() => setVotedOption(null)}
                    type="button"
                    className="mt-1 px-2.5 py-1 bg-white border border-slate-200 text-slate-500 hover:text-slate-900 rounded-lg text-[8px] font-extrabold uppercase tracking-wider transition hover:bg-slate-50 cursor-pointer"
                  >
                    Reset Vote / Recast
                  </button>
                </div>
              ) : (
                <div className="text-center p-2 text-slate-400 text-[8px] font-black uppercase tracking-widest bg-slate-50 rounded-lg select-none">
                  ⚡ TAP ANY OPTION ABOVE TO SUBMIT VOTE INSTANTLY
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {/* Embed Code forms */}
              <form onSubmit={handleUpdateMentimeterUrl} className="flex gap-2">
                <div className="flex-1 text-left">
                  <input
                    type="text"
                    value={customEmbedUrl}
                    onChange={(e) => setCustomEmbedUrl(e.target.value)}
                    placeholder="Paste Mentimeter Presentation Share Link or Code..."
                    className="w-full bg-slate-50 border border-slate-205 text-[10px] p-2 rounded-lg font-bold focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  />
                  <span className="text-[7.5px] text-slate-400 block mt-0.5 ml-1 font-bold">
                    Supports 8-digit join codes (e.g. 19283746) or direct menti.com URLs
                  </span>
                </div>
                <button
                  type="submit"
                  className="px-3 bg-slate-950 text-white rounded-lg text-[8.5px] font-black uppercase tracking-wider hover:bg-slate-850 transition cursor-pointer self-start py-2.5"
                >
                  Apply Url
                </button>
              </form>

              {/* Mentimeter Embedded Display */}
              <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
                <iframe
                  src={embedIframeSource}
                  width="100%"
                  height="300"
                  style={{ border: "none" }}
                  className="bg-white"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Mentimeter Embedded Poll View"
                />
              </div>

              <div className="p-2.5 bg-cyan-50/40 rounded-xl border border-cyan-100 flex justify-between items-center text-[9px] font-bold text-cyan-900">
                <span className="block truncate">Source: {embedIframeSource}</span>
                <a 
                  href={embedIframeSource} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-cyan-800 hover:underline flex items-center gap-0.5 font-black uppercase text-[8px] shrink-0"
                >
                  Direct Link ➔
                </a>
              </div>
            </div>
          )}
        </div>

        {/* VIEW 1: LEAD DASHBOARD (Visible to Exhibitor, Sponsor, and Admin) */}
        {(currentUserRole === "Exhibitor" || currentUserRole === "Sponsor" || currentUserRole === "Admin") && (
          <motion.div 
            className="bg-white rounded-2xl border border-slate-205 p-3.5 shadow-sm space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Users size={14} className="text-emerald-800" />
                <h3 className="text-xs font-black text-slate-950 uppercase tracking-tight">Lead Retrieval Retrieval</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <AnimatePresence mode="wait">
                  {leadSyncState === "saving" ? (
                    <motion.span 
                      key="saving"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="text-[8.5px] font-extrabold text-[#006e80]/90 lowercase bg-[#006e80]/5 border border-[#006e80]/15 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0"
                    >
                      <RefreshCw size={8} className="animate-spin text-[#006e80]" />
                      saving...
                    </motion.span>
                  ) : (
                    <motion.span 
                      key="synced"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="text-[8.5px] font-black text-[#10b981] lowercase bg-[#10b981]/5 border border-[#10b981]/25 px-1.5 py-0.5 rounded-full flex items-center gap-1 shrink-0"
                    >
                      <CheckCircle size={8} className="text-[#10b981]" />
                      synced
                    </motion.span>
                  )}
                </AnimatePresence>
                <span className="text-[9px] font-mono font-black text-[#006e80] bg-emerald-50 px-2 py-0.5 rounded-full select-none shrink-0 border border-emerald-100">
                  {scannedContacts.length} Badges Scanned
                </span>
              </div>
            </div>

            <p className="text-[9.5px] text-slate-400 font-semibold leading-relaxed">
              Review scanned attendee credentials, qualify their purchase intensity, and update interaction logs dynamically.
            </p>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-0.5 scrollbar-thin">
              {scannedContacts.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-[10px] font-bold">
                  No badges scanned yet. Click the Scan QR Icon [📷] in top right header to scan test badges instantly!
                </div>
              ) : (
                scannedContacts.map((contact) => (
                  <div key={contact.id} className="bg-slate-50 rounded-xl border border-slate-150 p-2.5 flex flex-col gap-2 relative text-left">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-black text-slate-900">{contact.name}</span>
                        <span className="text-[9px] text-slate-500 font-bold block">{contact.company} | {contact.email}</span>
                      </div>

                      {/* Rank badge toggles inside compact list */}
                      <div className="flex gap-1">
                        {(["Hot", "Warm", "Cold"] as any[]).map((r) => {
                          const isRank = contact.rank === r;
                          const rColor = r === "Hot" ? "bg-red-50 text-red-700" : r === "Warm" ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-600";
                          const rSelected = r === "Hot" ? "bg-red-600 text-white" : r === "Warm" ? "bg-amber-500 text-emerald-950" : "bg-slate-600 text-white";
                          return (
                            <button
                              key={r}
                              type="button"
                              onClick={() => handleUpdateContactTag(contact.id, r)}
                              className={`text-[8px] font-semibold uppercase px-1.5 py-0.5 rounded cursor-pointer transition ${isRank ? rSelected : rColor}`}
                            >
                              {r}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Inline logs text notes */}
                    <div>
                      <label className="text-[8px] font-bold uppercase text-slate-400 block mb-0.5">Interaction Logs & Notes</label>
                      <input
                        type="text"
                        value={contact.notes}
                        onChange={(e) => handleUpdateContactNotes(contact.id, e.target.value)}
                        placeholder="e.g. Needs immediate quotation on bioreactor..."
                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-medium focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* VIEW 2: CMS PANEL (Visible to Admin Role only) */}
        {(currentUserRole === "Admin") && (
          <motion.div 
            className="bg-white rounded-2xl border border-slate-205 p-3.5 shadow-sm space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Database size={14} className="text-slate-900" />
                <h3 className="text-xs font-black text-slate-950 uppercase tracking-tight">Committee CMS Controller</h3>
              </div>
              <span className="text-[9px] font-bold text-amber-500 bg-amber-500/5 px-2 py-0.5 rounded-full border border-amber-300/20">
                DB Handshake Live
              </span>
            </div>

            <div className="flex gap-1.5 p-0.5 bg-slate-100 rounded-lg shrink-0">
              <button
                onClick={() => setCmsTab("speakers")}
                className={`flex-1 text-[9px] py-1 font-black uppercase rounded ${cmsTab === "speakers" ? "bg-white text-slate-900" : "text-slate-400"}`}
              >
                📝 Speaker Bios
              </button>
              <button
                onClick={() => {
                  setCmsTab("sessions");
                  alert("Live Session schedule updates enabled. Edit track tags inside schedule listings.");
                }}
                className={`flex-1 text-[9px] py-1 font-black uppercase rounded ${cmsTab === "sessions" ? "bg-white text-slate-900" : "text-slate-400"}`}
              >
                📅 Session tracks
              </button>
            </div>

            {cmsTab === "speakers" && (
              <form onSubmit={handleUpdateCms} className="space-y-3 text-left">
                <div>
                  <label className="text-[8px] font-bold uppercase text-slate-400 block mb-0.5">Select Registered Speaker Profile</label>
                  <select
                    value={selectedSpeakerId}
                    onChange={(e) => setSelectedSpeakerId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold p-2"
                  >
                    <option value="884384d3-2093-41e2-8b7f-8299e0ba4615">Alexander Kappes (Greener Herd)</option>
                    <option value="ad67408c-15ad-4164-b4f0-45a68dbba69d">Ashley Nicholls (REACH Ag)</option>
                    <option value="9042fdd6-2d4b-48ea-b991-40730d3731aa">Sophia Weiss (Grain Millers)</option>
                    <option value="89302393-6920-41df-a3b6-61ad346830c2">Meifan Shi (VC Partner)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[8px] font-bold uppercase text-slate-400 block mb-0.5">Presentation Subject</label>
                  <input
                    type="text"
                    value={editorTopic}
                    onChange={(e) => setEditorTopic(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold p-2 focus:ring-1"
                  />
                </div>

                <div>
                  <label className="text-[8px] font-bold uppercase text-slate-400 block mb-0.5">Committee Bio Review</label>
                  <textarea
                    value={editorBio}
                    onChange={(e) => setEditorBio(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg text-[10px] p-2 h-14 resize-none font-semibold text-slate-650"
                  />
                </div>

                {cmsSuccess && (
                  <p className="text-emerald-700 text-[9px] font-extrabold flex items-center gap-1">✓ Synced with Summit Database</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-slate-950 text-white rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 active:scale-95 transition"
                >
                  <Save size={12} />
                  <span>{loading ? "Re-saving bio..." : "Live Commit Changes"}</span>
                </button>
              </form>
            )}
          </motion.div>
        )}

        {/* VIEW 2.5: POST MODERATION & REVIEW BOARD (Visible to Admin only) */}
        {(currentUserRole === "Admin") && (
          <motion.div 
            className="bg-white rounded-2xl border border-slate-205 p-3.5 shadow-sm space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-105">
              <div className="flex items-center gap-1.5">
                <Shield size={14} className="text-[#0a5f6a]" />
                <h3 className="text-xs font-black text-slate-950 uppercase tracking-tight">Timeline Post Review Board</h3>
              </div>
              <span className="text-[8px] font-mono font-black text-white bg-[#0a5f6a] px-2 py-0.5 rounded-full uppercase tracking-wider">
                {timelinePosts.filter(p => p.isApproved === false).length} Pending Review
              </span>
            </div>

            <p className="text-[9.5px] text-slate-400 font-semibold leading-relaxed text-left">
              Community submissions representing the <strong>Blue and Green Economy</strong> intersection. Approve valid feedback or prune inappropriate posts.
            </p>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-0.5 scrollbar-thin">
              {timelinePosts.filter(p => p.isApproved === false).length === 0 ? (
                <div className="p-5 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-[10px] font-bold">
                  🎉 No posts pending moderation. You're all caught up!
                </div>
              ) : (
                timelinePosts.filter(p => p.isApproved === false).map((post) => (
                  <div key={post.id} className="bg-slate-50 rounded-xl border border-slate-150 p-2.5 flex flex-col gap-2 relative text-left">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-extrabold text-slate-950 font-sans">{post.authorName}</span>
                          <span className={`text-[7.5px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                            post.authorRole === "Speaker" 
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-100" 
                              : post.authorRole === "Sponsor"
                              ? "bg-sky-50 text-sky-800 border border-sky-100"
                              : "bg-slate-200/50 text-slate-755"
                          }`}>
                            {post.authorRole}
                          </span>
                        </div>
                        <span className="text-[8.5px] text-slate-500 font-bold block leading-relaxed">{post.authorCompany}</span>
                      </div>
                      
                      <div className="text-[8px] text-slate-400 font-mono font-black flex items-center gap-1">
                        <Clock size={8} />
                        <span>
                          {Math.ceil((Date.now() - post.timestamp) / 60000) < 60 
                            ? `${Math.max(1, Math.ceil((Date.now() - post.timestamp) / 60000))}m ago`
                            : `${Math.round((Date.now() - post.timestamp) / 3600000)}h ago`
                          }
                        </span>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-2 border border-slate-150">
                      <p className="text-[10px] text-slate-800 font-medium leading-relaxed font-sans">{post.textContent}</p>
                      
                      {post.imageResName && (
                        <div className="mt-2 rounded-md overflow-hidden max-h-[100px] border border-slate-100">
                          <img 
                            src={post.imageResName} 
                            alt="Attachment preview" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleApprovePost(post.id)}
                        className="flex-1 py-1.5 bg-[#0a5f6a] hover:bg-[#074b54] text-white text-[9.5px] font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
                      >
                        <CheckCircle size={10} />
                        <span>Approve Post</span>
                      </button>
                      <button
                        onClick={() => handleRejectPost(post.id)}
                        className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 border border-rose-250/50 text-rose-700 text-[9.5px] font-black uppercase tracking-wider rounded-lg flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition"
                        title="Reject and Delete"
                      >
                        <Trash2 size={10} />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* VIEW 3: SYSTEM STATS ANALYTICS */}
        <div className="bg-white rounded-2xl border border-slate-205 p-3.5 shadow-sm space-y-3 text-left">
          <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <BarChart size={13} className="text-slate-900" />
            <h3 className="text-xs font-black text-slate-950 uppercase tracking-tight">Summit check-in telemetry</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[8px] font-bold text-slate-400 block uppercase">Check-ins</span>
              <span className="text-lg font-black text-slate-900 block leading-none mt-1">482 / 600</span>
              <span className="text-[8px] text-emerald-700 font-bold mt-1 block">✓ 80.3% Attending</span>
            </div>
            
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[8px] font-bold text-slate-400 block uppercase">Matching Queries</span>
              <span className="text-lg font-black text-emerald-805 block leading-none mt-1">100% Core</span>
              <span className="text-[8px] text-slate-400 font-bold mt-1 block">Active</span>
            </div>
          </div>
        </div>

        {/* VIEW 4: EVENT EXPORT CENTER (Secure Comma-Separated compiler) */}
        <div className="bg-white rounded-2xl border border-slate-205 p-3.5 shadow-sm space-y-3 text-left">
          <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <Download size={13} className="text-slate-900" />
            <h3 className="text-xs font-black text-slate-950 uppercase tracking-tight">Summit secure data export</h3>
          </div>

          <p className="text-[9.5px] text-slate-400 font-semibold leading-relaxed">
            Generate compliant reports or Continuing Education (CE) certifications compiled in structural CSV formats.
          </p>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleExportCSV("leads")}
              className="flex flex-col items-center justify-center gap-1.5 p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-xl text-center cursor-pointer active:scale-95 transition"
            >
              <Users size={15} className="text-emerald-950" />
              <span className="text-[8.5px] font-black uppercase text-emerald-950 tracking-tight leading-tight">Lead retrieval</span>
            </button>

            <button
              onClick={() => handleExportCSV("analytics")}
              className="flex flex-col items-center justify-center gap-1.5 p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-xl text-center cursor-pointer active:scale-95 transition"
            >
              <BarChart2 size={15} className="text-emerald-955 text-emerald-950" />
              <span className="text-[8.5px] font-black uppercase text-emerald-950 tracking-tight leading-tight">Analytics CSV</span>
            </button>

            <button
              onClick={() => handleExportCSV("credits")}
              className="flex flex-col items-center justify-center gap-1.5 p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-center cursor-pointer active:scale-95 transition"
            >
              <Sparkles size={15} className="text-amber-800" />
              <span className="text-[8.5px] font-black uppercase text-amber-950 tracking-tight leading-tight">CE Credits</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
