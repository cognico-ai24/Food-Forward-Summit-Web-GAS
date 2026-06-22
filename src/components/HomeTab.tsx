import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  MessageCircle, 
  Send, 
  Sparkles, 
  Bell, 
  Image, 
  MoreHorizontal, 
  Share2, 
  Megaphone,
  Clock,
  CheckCircle,
  ThumbsUp,
  Trash2
} from "lucide-react";
import { SocialPost } from "../types";

// Previously cached feed immediately loaded upon launch 
const cachedInitialPosts: SocialPost[] = [
  {
    id: 1,
    authorName: "Alexander Kappes",
    authorCompany: "Greener Herd",
    authorRole: "Speaker",
    textContent: "Just arrived at the Food Forward Summit in Milano! Super excited to present on AI fence line applications for smallholder ranching in the Keynote Arena later today. Let's make farming smart! 🚀🌾",
    imageResName: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=400&auto=format&fit=crop&q=80",
    likesCount: 24,
    timestamp: Date.now() - 3600000 * 2, // 2 hours ago
    isLikedByMe: false
  },
  {
    id: 2,
    authorName: "Sophia Weiss",
    authorCompany: "Grain Millers Inc.",
    authorRole: "Speaker",
    textContent: "Seaweed-based compostable polymers are looking like a serious game changer in Booth B-05. Stopped by EcoPack and they showed me wrappers that dissipate in 6 weeks! Zero waste packaging of the future is here.",
    imageResName: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400&auto=format&fit=crop&q=80",
    likesCount: 42,
    timestamp: Date.now() - 3600000 * 5, // 5 hours ago
    isLikedByMe: true
  },
  {
    id: 3,
    authorName: "Meifan Shi",
    authorCompany: "Waterpoint Lane VC",
    authorRole: "Sponsor",
    textContent: "Looking to deploy capital for agtech startups specializing in agricultural genomics or micro-factories. Visit me in the VIP Lounge to discuss partnerships! 💼🌱",
    imageResName: null,
    likesCount: 18,
    timestamp: Date.now() - 3600000 * 8, // 8 hours ago
    isLikedByMe: false
  }
];

export default function HomeTab({ userName = "Guest", userRole = "Attendee" }: { userName?: string; userRole?: string }) {
  const [posts, setPosts] = useState<SocialPost[]>(() => {
    const saved = localStorage.getItem("ffs_posts");
    return saved ? JSON.parse(saved) : cachedInitialPosts;
  });
  
  const [newPostText, setNewPostText] = useState("");
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState<number | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  
  // Moderate / comments state keyed by post ID
  const [commentsByPost, setCommentsByPost] = useState<Record<number, { author: string; text: string; date: number }[]>>(() => {
    const saved = localStorage.getItem("ffs_comments");
    return saved ? JSON.parse(saved) : {
      1: [
        { author: "Marc-André Roberge", text: "Looking forward to your session, Alexander! AI has massive potential for livestock.", date: Date.now() - 3000000 },
        { author: "Saif", text: "Brilliant topic, closing data gaps at the fence line is crucial.", date: Date.now() - 1200000 }
      ],
      2: [
        { author: "Heidi M. Peterson", text: "That packaging looks incredible! Is it oxygen-barrier compliant?", date: Date.now() - 10000000 }
      ]
    };
  });

  const [activeCommentPostId, setActiveCommentPostId] = useState<number | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [submissionToast, setSubmissionToast] = useState(false);

  const isAdmin = userRole === "Admin";

  useEffect(() => {
    localStorage.setItem("ffs_posts", JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem("ffs_comments", JSON.stringify(commentsByPost));
  }, [commentsByPost]);

  const handleLike = (postId: number) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLikedByMe: !post.isLikedByMe,
          likesCount: post.isLikedByMe ? post.likesCount - 1 : post.likesCount + 1
        };
      }
      return post;
    }));
  };

  const handleRemovePost = (postId: number) => {
    if (confirm("Are you sure you want to remove this post from the public Timeline?")) {
      setPosts(prev => prev.filter(p => p.id !== postId));
    }
  };

  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    setIsPosting(true);
    
    // Quick delay simulating immediate network confirmation
    setTimeout(() => {
      const illustrations = [
        "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=400&auto=format&fit=crop&q=80", // tech
        "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&auto=format&fit=crop&q=80", // farm
        "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?w=400&auto=format&fit=crop&q=80"  // wheat field
      ];

      const newPost: SocialPost = {
        id: Date.now(),
        authorName: userName,
        authorCompany: userRole === "Exhibitor" ? "Exhibitor Representative" : "Delegated Summit Attendee",
        authorRole: userRole || "Attendee",
        textContent: newPostText,
        imageResName: selectedPhotoIdx !== null ? illustrations[selectedPhotoIdx] : null,
        likesCount: 0,
        timestamp: Date.now(),
        isLikedByMe: false,
        isApproved: isAdmin ? true : false
      };

      setPosts(prev => [newPost, ...prev]);
      setNewPostText("");
      setSelectedPhotoIdx(null);
      setIsPosting(false);

      if (!isAdmin) {
        setSubmissionToast(true);
        // Automatically hide toast after 6 seconds
        setTimeout(() => setSubmissionToast(false), 6000);
      }
    }, 450);
  };

  const handleAddComment = (postId: number) => {
    if (!newCommentText.trim()) return;

    const newComment = {
      author: userName,
      text: newCommentText,
      date: Date.now()
    };

    setCommentsByPost(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment]
    }));
    setNewCommentText("");
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden pb-[5px] gap-3">
      
      {/* Short Dynamic Broadcast banner (Announcements Section in Feed) */}
      <div className="shrink-0 bg-amber-50 rounded-2xl border border-amber-200/80 p-3 flex gap-2.5 items-start">
        <div className="p-2 bg-amber-400 rounded-xl text-amber-950 flex items-center justify-center shrink-0">
          <Megaphone size={14} className="animate-bounce" />
        </div>
        <div className="flex-1 min-h-0">
          <div className="flex items-center justify-between">
            <span className="text-[8px] font-extrabold uppercase tracking-widest text-[#9c5905]">HIGH BROADCAST PRIORITY</span>
            <span className="text-[8px] font-mono font-bold text-slate-500">Just Now</span>
          </div>
          <p className="text-[10px] text-amber-950 font-semibold leading-relaxed mt-0.5">
            Keynote Alert: <strong>Future of Lab Scaling</strong> starting soon in Hall A. Pre-cached presentation attachments can be downloaded via Agenda portal!
          </p>
        </div>
      </div>

      {/* Primary Feed Stream */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-0.5 scrollbar-thin">
        
        {/* CREATE POST CARD - FB5 style or Admin control card */}
        {isAdmin ? (
          <div className="bg-[#fff9e6] rounded-2xl border border-amber-300 p-3.5 shadow-sm space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs">🛡️</span>
              <h3 className="text-[10px] font-black uppercase text-amber-950 tracking-wider">System Admin Timeline Monitor</h3>
            </div>
            <p className="text-[10.5px] text-amber-900 font-semibold leading-relaxed">
              As an Administrator, you are restricted from publishing public timeline updates. However, you are authorized to moderate live feeds and immediately <strong>remove any post</strong> below.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/60 p-3.5 shadow-sm space-y-3">
            <div className="flex gap-2.5 items-start">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-black text-emerald-850 select-none">
                {userName.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-h-0">
                <textarea
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  placeholder={`What's happening at Food Forward, ${userName.split(" ")[0]}?`}
                  className="w-full text-xs font-medium placeholder-slate-400 border-none bg-slate-50/50 p-2.5 rounded-xl resize-none h-16 focus:ring-1 focus:ring-emerald-700/20 focus:outline-none focus:bg-white transition"
                />
              </div>
            </div>

            {/* Quick interactive media pickers */}
            <div className="flex flex-wrap justify-between items-center gap-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-bold text-slate-400 mr-1.5 flex items-center gap-1">
                  <Image size={11} /> Attach illustrative photo:
                </span>
                {[
                  { label: "Tech 💻", idx: 0 },
                  { label: "Farm 🚜", idx: 1 },
                  { label: "Crop 🌾", idx: 2 }
                ].map((m) => (
                  <button
                    key={m.idx}
                    onClick={() => setSelectedPhotoIdx(selectedPhotoIdx === m.idx ? null : m.idx)}
                    className={`text-[9.5px] px-2.5 py-1 rounded-full font-bold transition active:scale-95 ${
                      selectedPhotoIdx === m.idx 
                        ? "bg-emerald-800 text-white" 
                        : "bg-slate-100 text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <button
                onClick={handlePublishPost}
                disabled={isPosting || !newPostText.trim()}
                className="px-4 py-2 bg-emerald-900 text-white hover:bg-emerald-800 disabled:opacity-45 disabled:hover:bg-emerald-950 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-1"
              >
                <Send size={10} />
                <span>{isPosting ? "Posting..." : "Share"}</span>
              </button>
            </div>
          </div>
        )}

        {/* SUBMISSION SUCCESS/PENDING SUCCESS ALERTS */}
        <AnimatePresence>
          {submissionToast && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-emerald-50 border border-emerald-150 rounded-2xl p-3.5 shadow-sm space-y-1 relative overflow-hidden text-left"
            >
              <div className="flex gap-2 items-start">
                <span className="text-sm shrink-0">✨</span>
                <div>
                  <h4 className="text-[10.5px] font-black text-emerald-950 uppercase tracking-wide">Post Moderation Handshake</h4>
                  <p className="text-[10px] text-emerald-900 font-semibold leading-relaxed mt-0.5">
                    Your update has been uploaded successfully! Once reviewed & approved by an <strong>administrator</strong>, it will display on the global Food Forward timeline.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FEED POSTS LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {posts
            .filter(post => post.isApproved !== false)
            .map((post) => {
          const hasComments = commentsByPost[post.id] && commentsByPost[post.id].length > 0;
          const commentsCount = commentsByPost[post.id] ? commentsByPost[post.id].length : 0;
          const isCommenting = activeCommentPostId === post.id;

          return (
            <div 
              key={post.id}
              className="bg-white rounded-2xl border border-slate-200/60 p-3.5 shadow-sm space-y-3 relative overflow-hidden"
              id={`feed_post_${post.id}`}
            >
              {/* Post Header */}
              <div className="flex justify-between items-center bg-transparent border-none">
                <div className="flex gap-2.5 items-center">
                  <div className="w-8.5 h-8.5 rounded-full bg-slate-950 text-white flex items-center justify-center font-black text-xs">
                    {post.authorName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 leading-none">
                      <span className="text-xs font-extrabold text-slate-950">{post.authorName}</span>
                      {post.authorRole !== "Attendee" && (
                        <span className="text-[8px] font-extrabold px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-100 uppercase tracking-wider">
                          {post.authorRole}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-500 font-semibold">{post.authorCompany}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold">
                  {isAdmin && (
                    <button
                      onClick={() => handleRemovePost(post.id)}
                      className="p-1 px-2 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-100 transition active:scale-95 cursor-pointer flex items-center gap-1 font-bold shrink-0"
                      title="Remove Post"
                    >
                      <Trash2 size={11} />
                      <span className="text-[9px] font-black uppercase">Remove</span>
                    </button>
                  )}
                  <div className="flex items-center gap-1 select-none">
                    <Clock size={10} />
                    <span>
                      {Math.ceil((Date.now() - post.timestamp) / 60000) < 60 
                        ? `${Math.max(1, Math.ceil((Date.now() - post.timestamp) / 60000))}m ago`
                        : `${Math.round((Date.now() - post.timestamp) / 3600000)}h ago`
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Text Body */}
              <p className="text-xs text-slate-800 font-semibold leading-relaxed whitespace-pre-line">
                {post.textContent}
              </p>

              {/* Image attachment if exists */}
              {post.imageResName && (
                <div className="rounded-xl overflow-hidden max-h-[200px] border border-slate-100 shadow-inner bg-slate-50">
                  <img 
                    src={post.imageResName} 
                    alt="Event graphic" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Engagement Stats row */}
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold pt-1.5 border-t border-slate-100/70">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-1 cursor-pointer transition active:scale-90 ${
                      post.isLikedByMe ? "text-emerald-700" : "hover:text-slate-600"
                    }`}
                  >
                    <Heart size={12} fill={post.isLikedByMe ? "currentColor" : "none"} className={post.isLikedByMe ? "animate-pulse" : ""} />
                    <span>{post.likesCount} Likes</span>
                  </button>

                  <button 
                    onClick={() => setActiveCommentPostId(isCommenting ? null : post.id)}
                    className="flex items-center gap-1 hover:text-slate-600 cursor-pointer"
                  >
                    <MessageCircle size={12} />
                    <span>{commentsCount} Details</span>
                  </button>
                </div>

                <button 
                  onClick={() => alert("Simulated: Link copied to clipboard for direct web sharing!")}
                  className="hover:text-slate-600 cursor-pointer flex items-center gap-0.5"
                >
                  <Share2 size={11} />
                  <span>Share</span>
                </button>
              </div>

              {/* Interactive Comments Panel */}
              <AnimatePresence>
                {isCommenting && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-slate-100 bg-slate-50/50 -mx-3.5 -mb-3.5 p-3.5 space-y-3.5"
                  >
                    {/* Comments List */}
                    <div className="space-y-2.5 max-h-[140px] overflow-y-auto pr-0.5 scrollbar-thin">
                      {hasComments ? (
                        commentsByPost[post.id].map((comm, cIdx) => (
                          <div key={cIdx} className="bg-white rounded-xl p-2.5 border border-slate-200/50 flex gap-2 items-start text-left">
                            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-extrabold text-[10px] shrink-0">
                              {comm.author.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-h-0">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-900">{comm.author}</span>
                                <span className="text-[8px] font-mono text-slate-400 font-bold">1m ago</span>
                              </div>
                              <p className="text-[10px] text-slate-650 leading-relaxed font-semibold mt-0.5">
                                {comm.text}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-[9.5px] text-slate-400 font-bold py-1">Be the first to share details or comments</p>
                      )}
                    </div>

                    {/* New Comment Form */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="Write a public comment..."
                        className="flex-grow bg-white border border-slate-200 px-3 py-1.5 text-[11px] rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-800 font-medium"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="p-1 px-3 bg-emerald-900 text-white text-[9px] font-extrabold uppercase rounded-lg active:scale-95 cursor-pointer"
                      >
                        Reply
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          );
        })}
        </div>

      </div>
    </div>
  );
}
