import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdSearch, MdStar, MdStarBorder, MdThumbUp, MdThumbDown,
  MdDelete, MdReply, MdClose, MdFilterList, MdFlag,
  MdVerified, MdTrendingUp, MdRateReview, MdAutoAwesome,
  MdFileDownload, MdDateRange, MdSummarize, MdInsights,
  MdArrowUpward, MdArrowDownward,
} from 'react-icons/md';

/* ─────────────────────────────────────────────
   ANIMATED PARTICLES
───────────────────────────────────────────── */
function Particles() {
  const particles = useRef(
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 12 + 8,
      delay: Math.random() * 6,
      opacity: Math.random() * 0.4 + 0.1,
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[28px]">
      {particles.current.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [p.opacity, p.opacity * 2.5, p.opacity],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   KPI CARD
───────────────────────────────────────────── */
const KPI_CARDS = [
  {
    id: 'satisfaction',
    title: 'Overall Satisfaction Score',
    value: '98%',
    sub: '+4% vs last month',
    trend: 'up',
    trendVal: '+4%',
    icon: '😊',
    gradient: 'from-blue-600/30 via-blue-500/10 to-transparent',
    border: 'border-blue-500/30',
    glow: 'bg-blue-500',
    glowShadow: 'shadow-blue-500/20',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    ring: 'from-blue-400 to-blue-600',
  },
  {
    id: 'rating',
    title: 'Average Platform Rating',
    value: '4.8★',
    sub: 'Across all courses',
    trend: 'up',
    trendVal: '+0.2',
    icon: '⭐',
    gradient: 'from-purple-600/30 via-purple-500/10 to-transparent',
    border: 'border-purple-500/30',
    glow: 'bg-purple-500',
    glowShadow: 'shadow-purple-500/20',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    ring: 'from-purple-400 to-purple-600',
  },
  {
    id: 'nps',
    title: 'Net Promoter Score',
    value: '+68',
    sub: 'Industry leading',
    trend: 'up',
    trendVal: '+5 pts',
    icon: '🚀',
    gradient: 'from-emerald-600/30 via-emerald-500/10 to-transparent',
    border: 'border-emerald-500/30',
    glow: 'bg-emerald-500',
    glowShadow: 'shadow-emerald-500/20',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    ring: 'from-emerald-400 to-emerald-600',
  },
  {
    id: 'retention',
    title: 'Retention Rate',
    value: '84%',
    sub: '+3.2% this month',
    trend: 'up',
    trendVal: '+3.2%',
    icon: '🔁',
    gradient: 'from-cyan-600/30 via-cyan-500/10 to-transparent',
    border: 'border-cyan-500/30',
    glow: 'bg-cyan-500',
    glowShadow: 'shadow-cyan-500/20',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    ring: 'from-cyan-400 to-cyan-600',
  },
  {
    id: 'sentiment',
    title: 'Positive Sentiment',
    value: '92%',
    sub: 'AI analyzed',
    trend: 'up',
    trendVal: '+1.8%',
    icon: '🤖',
    gradient: 'from-pink-600/30 via-pink-500/10 to-transparent',
    border: 'border-pink-500/30',
    glow: 'bg-pink-500',
    glowShadow: 'shadow-pink-500/20',
    badge: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    ring: 'from-pink-400 to-pink-600',
  },
  {
    id: 'moderation',
    title: 'Moderation Queue',
    value: '37',
    sub: 'Reviews require action',
    trend: 'down',
    trendVal: '+12',
    icon: '⚠️',
    gradient: 'from-red-600/30 via-red-500/10 to-transparent',
    border: 'border-red-500/30',
    glow: 'bg-red-500',
    glowShadow: 'shadow-red-500/20',
    badge: 'bg-red-500/20 text-red-300 border-red-500/30',
    ring: 'from-red-400 to-red-600',
  },
];

function KpiCard({ card, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.08, ease: 'easeOut' }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`relative overflow-hidden rounded-2xl border ${card.border} bg-gradient-to-br ${card.gradient} backdrop-blur-xl p-5 cursor-default group shadow-xl ${card.glowShadow}`}
      style={{ boxShadow: `0 8px 32px -4px rgba(0,0,0,0.4)` }}
    >
      {/* Decorative glow orb */}
      <div
        className={`absolute -right-8 -top-8 w-32 h-32 rounded-full ${card.glow} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500`}
      />
      <div
        className={`absolute -right-4 -top-4 w-16 h-16 rounded-full ${card.glow} opacity-15 blur-xl`}
      />

      {/* Glassmorphism inner surface */}
      <div className="absolute inset-0 rounded-2xl bg-white/[0.02]" />

      {/* Top row: icon + trend badge */}
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className="text-2xl">{card.icon}</div>
        <span
          className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border ${card.badge}`}
        >
          {card.trend === 'up'
            ? <MdArrowUpward size={12} />
            : <MdArrowDownward size={12} />}
          {card.trendVal}
        </span>
      </div>

      {/* Value */}
      <div className="relative z-10 mb-1">
        <span className="text-3xl font-black text-white tracking-tight">{card.value}</span>
      </div>

      {/* Title */}
      <div className="relative z-10 text-xs font-semibold text-gray-300 mb-1 leading-tight">
        {card.title}
      </div>

      {/* Sub */}
      <div className="relative z-10 text-[11px] text-gray-500">{card.sub}</div>

      {/* Bottom accent line */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${card.ring} opacity-40 group-hover:opacity-80 transition-opacity duration-300`}
      />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   DATE RANGE MODAL
───────────────────────────────────────────── */
const DATE_PRESETS = ['Today', 'Last 7 Days', 'Last 30 Days', 'Last 3 Months', 'This Year', 'Custom'];

function DateRangeModal({ onClose }) {
  const [selected, setSelected] = useState('Last 30 Days');
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0B1120] border border-white/10 rounded-3xl w-full max-w-sm shadow-2xl p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MdDateRange size={18} className="text-purple-400" /> Date Range
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <MdClose size={18} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {DATE_PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setSelected(p)}
              className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                selected === p
                  ? 'bg-purple-600/30 border border-purple-500/50 text-white'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-sm hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all"
        >
          Apply Range
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   AI SUMMARY MODAL
───────────────────────────────────────────── */
function AiSummaryModal({ onClose }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 1800); return () => clearTimeout(t); }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0B1120] border border-purple-500/20 rounded-3xl w-full max-w-lg shadow-2xl p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MdAutoAwesome size={18} className="text-purple-400" /> AI Summary
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <MdClose size={18} />
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center gap-4">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
              <div className="absolute inset-0 rounded-full border-t-2 border-purple-500 animate-spin" />
              <MdAutoAwesome size={22} className="absolute inset-0 m-auto text-purple-400" />
            </div>
            <p className="text-sm text-gray-500 animate-pulse">Analyzing {initialReviews.length} reviews with AI…</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-purple-600/10 to-cyan-600/5 border border-purple-500/20 rounded-2xl p-4 text-sm text-gray-300 leading-relaxed">
              <p className="font-semibold text-white mb-2">📊 Platform Sentiment Overview</p>
              <p>Student sentiment is <span className="text-emerald-400 font-medium">highly positive</span> with 92% of reviews rated 4★ or above. The most praised attributes are <strong>instructor engagement</strong> and <strong>content depth</strong>.</p>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-sm text-gray-300 space-y-2">
              <p className="font-semibold text-white">🔍 Key Insights</p>
              <ul className="space-y-1.5 text-gray-400">
                <li>• <span className="text-cyan-400">DSA with Java</span> has the highest helpfulness ratio (61 helpful / 0 unhelpful).</li>
                <li>• 2 reviews flagged for policy violations — require immediate moderation.</li>
                <li>• <span className="text-yellow-400">CSS & UI Design</span> shows declining satisfaction; pacing complaints in mid-modules.</li>
                <li>• Retention risk: 3 students gave 1–2★ ratings within 48 hrs of enrollment.</li>
              </ul>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 text-sm">
              <p className="font-semibold text-white mb-1">✅ Recommended Actions</p>
              <p className="text-gray-400">Update CSS & UI Design curriculum in modules 6–9, and follow up with low-rated students to offer support or refunds proactively.</p>
            </div>
            <button onClick={onClose} className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-sm hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all">
              Close
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   REVIEW DATA
───────────────────────────────────────────── */
const RATING_COLORS = {
  5: 'text-emerald-400', 4: 'text-cyan-400', 3: 'text-yellow-400', 2: 'text-orange-400', 1: 'text-red-400',
};
const SENTIMENT_BADGE = {
  positive: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  neutral:  'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  negative: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const initialReviews = [
  { id: 1, student: 'Rahul Sharma',    avatar: 'RS', course: 'Full Stack Web Development', teacher: 'Virat Kohli',     rating: 5, date: 'May 28, 2025', text: 'Absolutely phenomenal course! Virat sir explains concepts with the same intensity as he bats. Every module felt like a century partnership. Best investment ever.', helpful: 42, unhelpful: 2,  verified: true,  flagged: false, replied: false, sentiment: 'positive' },
  { id: 2, student: 'Priya Patel',     avatar: 'PP', course: 'Python Foundations',         teacher: 'Sachin Tendulkar',rating: 5, date: 'May 27, 2025', text: "Sachin sir's teaching style is just like his batting — flawless and textbook perfect. The Python curriculum is well-structured and covers everything from basics to advanced topics.", helpful: 38, unhelpful: 1,  verified: true,  flagged: false, replied: true,  sentiment: 'positive' },
  { id: 3, student: 'Aman Verma',      avatar: 'AV', course: 'JavaScript Mastery',         teacher: 'Virat Kohli',     rating: 4, date: 'May 26, 2025', text: 'Great course overall! The content is very comprehensive and up to date. Only wish there were more live coding sessions. The practice problems are well-chosen.', helpful: 27, unhelpful: 3,  verified: true,  flagged: false, replied: false, sentiment: 'positive' },
  { id: 4, student: 'Sneha Singh',     avatar: 'SS', course: 'ReactJS',                    teacher: 'Anushka Sharma',  rating: 3, date: 'May 25, 2025', text: 'The course content is decent but I expected more advanced topics. The explanations are clear but the pacing feels a bit slow in the middle modules. Overall an okay experience.', helpful: 15, unhelpful: 8,  verified: true,  flagged: false, replied: false, sentiment: 'neutral'  },
  { id: 5, student: 'Karan Mehta',     avatar: 'KM', course: 'CSS & UI Design',            teacher: 'Katrina Kaif',    rating: 2, date: 'May 24, 2025', text: 'Expected more depth in the advanced CSS topics. The fundamentals section is good but the course drops off significantly towards the end. Hope the team updates the content soon.', helpful: 9,  unhelpful: 4,  verified: false, flagged: true,  replied: false, sentiment: 'negative' },
  { id: 6, student: 'Divya Krishnan', avatar: 'DK', course: 'DSA with Java',              teacher: 'Salman Khan',     rating: 5, date: 'May 23, 2025', text: 'Bhai ne toh kamaal kar diya! 🔥 Seriously though, Salman sir makes DSA genuinely fun. Cracked my Google interview after this!', helpful: 61, unhelpful: 0,  verified: true,  flagged: false, replied: true,  sentiment: 'positive' },
  { id: 7, student: 'Rohan Das',       avatar: 'RD', course: 'Python Foundations',         teacher: 'Sachin Tendulkar',rating: 4, date: 'May 22, 2025', text: 'Solid Python course. The real-world examples are very helpful. Sachin sir clearly knows his subject inside out. Would recommend to anyone starting their coding journey.', helpful: 22, unhelpful: 2,  verified: true,  flagged: false, replied: false, sentiment: 'positive' },
  { id: 8, student: 'Neha Gupta',      avatar: 'NG', course: 'Full Stack Web Development', teacher: 'Virat Kohli',     rating: 1, date: 'May 20, 2025', text: 'The videos kept buffering and the assignments had errors that were never corrected. Very disappointed with the technical quality.', helpful: 7,  unhelpful: 12, verified: false, flagged: true,  replied: false, sentiment: 'negative' },
];

function Stars({ rating, size = 16 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) =>
        s <= rating
          ? <MdStar key={s} size={size} className={RATING_COLORS[rating]} />
          : <MdStarBorder key={s} size={size} className="text-gray-600" />
      )}
    </div>
  );
}

function ReplyModal({ review, onClose, onSave }) {
  const [text, setText] = useState('');
  if (!review) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
    >
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0B1120] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Reply to {review.student}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"><MdClose size={20} /></button>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-2"><Stars rating={review.rating} size={14} /><span className="text-xs text-gray-500">{review.date}</span></div>
          <p className="text-sm text-gray-300 line-clamp-3">{review.text}</p>
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4}
          placeholder="Write your admin reply…"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500 focus:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1736] transition-all resize-none mb-5"
        />
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium">Cancel</button>
          <button onClick={() => { if (text.trim()) { onSave(review.id, text); onClose(); } }}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-sm hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all"
          >Send Reply</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════ */
const Reviews = () => {
  const [reviews, setReviews]         = useState(initialReviews);
  const [search, setSearch]           = useState('');
  const [ratingFilter, setRatingFilter]     = useState('All');
  const [sentimentFilter, setSentimentFilter] = useState('All');
  const [replyTarget, setReplyTarget] = useState(null);
  const [showDate, setShowDate]       = useState(false);
  const [showAI, setShowAI]           = useState(false);
  const [dateLabel, setDateLabel]     = useState('Last 30 Days');

  /* KPI derivations */
  const totalReviews  = reviews.length;
  const avgRating     = (reviews.reduce((a, r) => a + r.rating, 0) / totalReviews).toFixed(1);
  const positiveCount = reviews.filter((r) => r.sentiment === 'positive').length;
  const flaggedCount  = reviews.filter((r) => r.flagged).length;

  /* Rating distribution */
  const ratingDist = [5, 4, 3, 2, 1].map((n) => ({
    star: n,
    count: reviews.filter((r) => r.rating === n).length,
    pct: Math.round((reviews.filter((r) => r.rating === n).length / totalReviews) * 100),
  }));

  /* Filtered list */
  const filtered = useMemo(() =>
    reviews.filter((r) => {
      const matchSearch    = r.student.toLowerCase().includes(search.toLowerCase()) || r.course.toLowerCase().includes(search.toLowerCase()) || r.teacher.toLowerCase().includes(search.toLowerCase());
      const matchRating    = ratingFilter === 'All' ? true : r.rating === Number(ratingFilter);
      const matchSentiment = sentimentFilter === 'All' ? true : r.sentiment === sentimentFilter.toLowerCase();
      return matchSearch && matchRating && matchSentiment;
    }),
    [reviews, search, ratingFilter, sentimentFilter]
  );

  const handleDelete  = (id) => setReviews((p) => p.filter((r) => r.id !== id));
  const handleFlag    = (id) => setReviews((p) => p.map((r) => r.id === id ? { ...r, flagged: !r.flagged } : r));
  const handleReply   = (id)  => setReviews((p) => p.map((r) => r.id === id ? { ...r, replied: true } : r));
  const handleHelpful = (id, type) => setReviews((p) => p.map((r) => r.id === id ? { ...r, [type]: r[type] + 1 } : r));

  const handleExport = () => {
    const header = 'Student,Course,Teacher,Rating,Sentiment,Date,Helpful,Unhelpful,Verified,Flagged\n';
    const rows = reviews.map((r) =>
      `"${r.student}","${r.course}","${r.teacher}",${r.rating},${r.sentiment},${r.date},${r.helpful},${r.unhelpful},${r.verified},${r.flagged}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'reviews-report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadInsights = () => {
    const content = `UpToSkills — Review Insights Report\n====================================\n\nPeriod: ${dateLabel}\n\nKPI Summary\n-----------\nOverall Satisfaction: 98%\nAverage Rating: ${avgRating} / 5\nNet Promoter Score: +68\nRetention Rate: 84%\nPositive Sentiment: ${Math.round((positiveCount / totalReviews) * 100)}%\nModeration Queue: ${flaggedCount} reviews\n\nTotal Reviews Analyzed: ${totalReviews}\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'review-insights.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen text-white">

      {/* ══════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════ */}
      <div className="relative rounded-[28px] overflow-hidden mb-8"
        style={{ background: 'linear-gradient(135deg, #060B18 0%, #0D1433 40%, #100D2E 70%, #07111F 100%)' }}
      >
        {/* Purple glow orb */}
        <div className="absolute -top-20 -left-20 w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.22) 0%, transparent 70%)' }}
        />
        {/* Cyan glow orb */}
        <div className="absolute -bottom-24 -right-16 w-[380px] h-[380px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)' }}
        />
        {/* Extra accent orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] pointer-events-none opacity-30"
          style={{ background: 'radial-gradient(ellipse, rgba(99,38,180,0.15) 0%, transparent 70%)' }}
        />

        {/* Animated particles */}
        <Particles />

        {/* Glass overlay */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.015) 0%, transparent 100%)' }}
        />

        {/* Grid lines overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Hero Content */}
        <div className="relative z-10 px-8 py-10 md:px-12 md:py-14">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold mb-5"
          >
            <MdAutoAwesome size={12} />
            AI-Powered Review Intelligence
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.06 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 leading-none"
          >
            <span className="text-white">Reviews &amp;</span>{' '}
            <span className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #A78BFA 0%, #67E8F9 100%)' }}
            >
              Ratings
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.12 }}
            className="text-gray-400 text-sm md:text-base max-w-2xl leading-relaxed mb-8"
          >
            Monitor learner satisfaction, celebrity mentor performance, course quality, sentiment trends,
            retention risks, and platform reputation in real time.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.18 }}
            className="flex flex-wrap gap-3"
          >
            {/* Date Range */}
            <button
              onClick={() => setShowDate(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <MdDateRange size={16} className="text-purple-400" />
              {dateLabel}
            </button>

            {/* Export Report */}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <MdFileDownload size={16} className="text-cyan-400" />
              Export Report
            </button>

            {/* Generate AI Summary */}
            <button
              onClick={() => setShowAI(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(124,58,237,0.4)]"
              style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.4) 0%, rgba(6,182,212,0.25) 100%)',
                border: '1px solid rgba(124,58,237,0.4)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <MdAutoAwesome size={16} className="text-purple-300" />
              Generate AI Summary
            </button>

            {/* Download Insights */}
            <button
              onClick={handleDownloadInsights}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <MdInsights size={16} className="text-emerald-400" />
              Download Insights
            </button>
          </motion.div>

          {/* Floating stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.26 }}
            className="flex flex-wrap gap-6 mt-10 pt-8 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.07)' }}
          >
            {[
              { label: 'Total Reviews',  value: totalReviews },
              { label: 'Avg Rating',     value: `${avgRating} ★` },
              { label: 'Positive',       value: `${Math.round((positiveCount / totalReviews) * 100)}%` },
              { label: 'Flagged',        value: flaggedCount },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          KPI CARDS — 6 Premium Cards
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8 px-0">
        {KPI_CARDS.map((card, i) => (
          <KpiCard key={card.id} card={card} index={i} />
        ))}
      </div>

      {/* ══════════════════════════════════════════
          REVIEW MANAGEMENT PANEL
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-4">

          {/* Rating Distribution */}
          <div className="bg-[#161b22] border border-white/5 rounded-3xl p-5">
            <h2 className="text-sm font-semibold text-white mb-5">Rating Distribution</h2>
            <div className="space-y-3">
              {ratingDist.map(({ star, count, pct }) => (
                <button
                  key={star}
                  onClick={() => setRatingFilter(ratingFilter === String(star) ? 'All' : String(star))}
                  className={`w-full flex items-center gap-3 transition-all ${ratingFilter === String(star) ? 'opacity-100' : 'opacity-75 hover:opacity-100'}`}
                >
                  <span className="text-xs text-gray-400 w-4 text-right flex-shrink-0">{star}</span>
                  <MdStar size={14} className={RATING_COLORS[star]} />
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${star === 5 ? 'bg-emerald-400' : star === 4 ? 'bg-cyan-400' : star === 3 ? 'bg-yellow-400' : star === 2 ? 'bg-orange-400' : 'bg-red-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-5 text-right flex-shrink-0">{count}</span>
                </button>
              ))}
            </div>
            <div className="mt-6 pt-5 border-t border-white/5 text-center">
              <div className="text-5xl font-black text-white mb-1">{avgRating}</div>
              <div className="flex justify-center mb-1"><Stars rating={Math.round(Number(avgRating))} size={18} /></div>
              <div className="text-xs text-gray-500">Based on {totalReviews} reviews</div>
            </div>
          </div>

          {/* Sentiment Filter */}
          <div className="bg-[#161b22] border border-white/5 rounded-3xl p-5">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><MdFilterList size={16} />Filter Sentiment</h2>
            <div className="space-y-2">
              {['All', 'Positive', 'Neutral', 'Negative'].map((s) => (
                <button
                  key={s}
                  onClick={() => setSentimentFilter(s)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${sentimentFilter === s ? 'bg-purple-600/20 border border-purple-500/30 text-white font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
                >
                  {s === 'All' ? '✦ All Sentiments' : s === 'Positive' ? '😊 Positive' : s === 'Neutral' ? '😐 Neutral' : '😞 Negative'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-9 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text" placeholder="Search by student, course, or teacher…"
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#161b22] border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-purple-500/50 focus:bg-white/5 focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2 focus-visible:ring-offset-[#161b22] transition-all text-white placeholder:text-gray-600"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{filtered.length} review{filtered.length !== 1 ? 's' : ''} found</span>
            {(ratingFilter !== 'All' || sentimentFilter !== 'All' || search) && (
              <button onClick={() => { setRatingFilter('All'); setSentimentFilter('All'); setSearch(''); }}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
              >
                <MdClose size={14} /> Clear filters
              </button>
            )}
          </div>

          <AnimatePresence>
            {filtered.map((review) => (
              <motion.div key={review.id} layout
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
                className={`bg-[#161b22] border rounded-3xl p-5 transition-all duration-200 group ${review.flagged ? 'border-red-500/30' : 'border-white/5 hover:border-white/10'}`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {review.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{review.student}</span>
                        {review.verified && <MdVerified size={14} className="text-cyan-400" />}
                        {review.replied && <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20">Replied</span>}
                        {review.flagged && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">Flagged</span>}
                      </div>
                      <div className="text-[11px] text-gray-500">{review.course} · {review.teacher}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${SENTIMENT_BADGE[review.sentiment]}`}>{review.sentiment}</span>
                    <Stars rating={review.rating} size={14} />
                    <span className="text-[11px] text-gray-500 ml-1">{review.date}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-300 leading-relaxed mb-4">{review.text}</p>

                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleHelpful(review.id, 'helpful')} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-400 transition-colors">
                      <MdThumbUp size={14} /> {review.helpful}
                    </button>
                    <button onClick={() => handleHelpful(review.id, 'unhelpful')} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors">
                      <MdThumbDown size={14} /> {review.unhelpful}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setReplyTarget(review)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all">
                      <MdReply size={14} /> Reply
                    </button>
                    <button onClick={() => handleFlag(review.id)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-all ${review.flagged ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 border-transparent hover:border-orange-500/20'}`}>
                      <MdFlag size={14} /> {review.flagged ? 'Unflag' : 'Flag'}
                    </button>
                    <button onClick={() => handleDelete(review.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all">
                      <MdDelete size={14} /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-600">
              <MdRateReview size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No reviews match your filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showDate && (
          <DateRangeModal
            onClose={() => setShowDate(false)}
          />
        )}
        {showAI && <AiSummaryModal onClose={() => setShowAI(false)} />}
        {replyTarget && (
          <ReplyModal
            review={replyTarget}
            onClose={() => setReplyTarget(null)}
            onSave={handleReply}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Reviews;
