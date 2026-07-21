import React from 'react';
import { motion } from 'framer-motion';
import {
  MdEmojiEvents,
  MdBolt,
  MdLocalFireDepartment,
  MdWorkspacePremium,
  MdMilitaryTech,
  MdLock,
  MdCode,
  MdGroups,
} from 'react-icons/md';

const badges = [
  {
    title: 'First Steps',
    description: 'Completed your very first lesson.',
    icon: MdEmojiEvents,
    accent: '#F59E0B',
    unlocked: true,
    earnedOn: 'Jun 02, 2026',
  },
  {
    title: 'Streak Starter',
    description: 'Logged in and studied 7 days in a row.',
    icon: MdLocalFireDepartment,
    accent: '#EF4444',
    unlocked: true,
    earnedOn: 'Jun 10, 2026',
  },
  {
    title: 'Code Warrior',
    description: 'Solved 50 DSA problems across all difficulty levels.',
    icon: MdCode,
    accent: '#06B6D4',
    unlocked: true,
    earnedOn: 'Jul 01, 2026',
  },
  {
    title: 'Quick Thinker',
    description: 'Finished 10 timed quizzes with a perfect score.',
    icon: MdBolt,
    accent: '#8B5CF6',
    unlocked: false,
    progress: 60,
  },
  {
    title: 'Community Mentor',
    description: 'Helped 25 peers by answering forum questions.',
    icon: MdGroups,
    accent: '#10B981',
    unlocked: false,
    progress: 32,
  },
  {
    title: 'Grand Master',
    description: 'Reached the top 1% on the global leaderboard.',
    icon: MdWorkspacePremium,
    accent: '#F59E0B',
    unlocked: false,
    progress: 12,
  },
];

const unlockedCount = badges.filter((b) => b.unlocked).length;

const AchievementBadges = () => {
  return (
    <div className="admin-page space-y-6 md:space-y-8 animate-fade-in relative z-10 pb-16 min-h-full rounded-2xl p-4 md:p-6 -m-4 md:-m-6 border border-[var(--admin-border)] shadow-[var(--admin-shadow-card)] bg-[var(--admin-page-panel)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#06B6D4]">
            Recognition
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold admin-text-primary">
            Achievement Badges
          </h1>
          <p className="mt-2 text-sm admin-text-secondary">
            Celebrate milestones and track what learners still have left to unlock.
          </p>
        </div>

        <div
          className="rounded-2xl border px-4 py-3 min-w-[190px]"
          style={{
            background: 'var(--admin-surface-raised)',
            borderColor: 'var(--admin-border)',
          }}
        >
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase admin-text-secondary">
            <span>Unlocked</span>
            <span>
              {unlockedCount} / {badges.length}
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--admin-progress-track)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(unlockedCount / badges.length) * 100}%`,
                background: 'linear-gradient(90deg, #06B6D4, #8B5CF6)',
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {badges.map((badge, index) => {
          const Icon = badge.icon;
          return (
            <motion.article
              key={badge.title}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ delay: index * 0.04, duration: 0.35 }}
              whileHover={{
                y: -8,
                scale: 1.02,
                boxShadow: '0 24px 48px rgba(6, 182, 212, 0.22)',
              }}
              className={`group relative flex flex-col rounded-2xl overflow-hidden border cursor-pointer shadow-[var(--admin-shadow-card)] bg-[var(--admin-surface-raised)] ${
                badge.unlocked ? '' : 'opacity-80'
              }`}
              style={{ borderColor: 'var(--admin-border)' }}
            >
              <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: 'var(--admin-border-subtle)', background: 'var(--admin-surface)' }}>
                <div className="flex items-center gap-3">
                  <div
                    className="relative flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: badge.unlocked ? `${badge.accent}18` : 'var(--admin-progress-track)',
                      color: badge.unlocked ? badge.accent : 'var(--admin-text-muted)',
                    }}
                  >
                    <Icon size={22} />
                    {!badge.unlocked && (
                      <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border bg-[var(--admin-surface)]" style={{ borderColor: 'var(--admin-border)' }}>
                        <MdLock size={11} className="text-[var(--admin-text-muted)]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] admin-text-secondary">
                      {badge.unlocked ? 'Unlocked' : 'Locked'}
                    </p>
                    <h2 className="text-sm font-bold admin-text-primary">{badge.title}</h2>
                  </div>
                </div>
                {badge.unlocked && (
                  <MdMilitaryTech size={20} style={{ color: badge.accent }} />
                )}
              </div>

              <div className="flex flex-1 flex-col gap-4 p-4">
                <p className="text-sm admin-text-secondary">{badge.description}</p>

                {badge.unlocked ? (
                  <div className="mt-auto flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold" style={{ borderColor: 'var(--admin-border-subtle)', background: 'var(--admin-surface)' }}>
                    <span className="admin-text-secondary">Earned on</span>
                    <span className="admin-text-primary">{badge.earnedOn}</span>
                  </div>
                ) : (
                  <div>
                    <div className="mb-1 flex items-center justify-between text-[11px] font-semibold admin-text-secondary">
                      <span>Progress</span>
                      <span className="admin-text-primary">{badge.progress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--admin-progress-track)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${badge.progress}%`,
                          background: `linear-gradient(90deg, ${badge.accent}, #06B6D4)`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementBadges;
