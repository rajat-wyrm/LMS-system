import React from 'react';
import { motion } from 'framer-motion';
import { MdCode, MdQuiz, MdAutoAwesome, MdSchedule } from 'react-icons/md';

const challenges = [
  {
    title: 'Solve 2 DSA Problems',
    description: 'Sharpen your problem-solving with two focused algorithm sessions.',
    progress: 72,
    points: '800 XP',
    badge: 'DSA Sprint',
    icon: MdCode,
    accent: '#06B6D4',
  },
  {
    title: 'Complete JavaScript Quiz',
    description: 'Finish the daily quiz and reinforce your frontend fundamentals.',
    progress: 58,
    points: '450 XP',
    badge: 'Quick Check',
    icon: MdQuiz,
    accent: '#8B5CF6',
  },
  {
    title: 'Build a Mini React Widget',
    description: 'Create a small interactive component and ship it confidently.',
    progress: 34,
    points: '620 XP',
    badge: 'Hands-on',
    icon: MdAutoAwesome,
    accent: '#F59E0B',
  },
  {
    title: 'Review 3 Lesson Notes',
    description: 'Revisit key concepts and lock in long-term retention.',
    progress: 81,
    points: '360 XP',
    badge: 'Revision',
    icon: MdSchedule,
    accent: '#10B981',
  },
];

const DailyChallenges = () => {
  return (
    <div className="admin-page space-y-6 md:space-y-8 animate-fade-in relative z-10 pb-16 min-h-full rounded-2xl p-4 md:p-6 -m-4 md:-m-6 border border-[var(--admin-border)] shadow-[var(--admin-shadow-card)] bg-[var(--admin-page-panel)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#06B6D4]">
            Daily Momentum
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold admin-text-primary">
            Daily Challenges
          </h1>
          <p className="mt-2 text-sm admin-text-secondary">
            Keep every learner engaged with targeted daily tasks and visible progress.
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
            <span>Today</span>
            <span>3 / 4 tasks</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--admin-progress-track)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: '75%', background: 'linear-gradient(90deg, #06B6D4, #8B5CF6)' }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {challenges.map((challenge, index) => {
          const Icon = challenge.icon;
          return (
            <motion.article
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
              className="group flex flex-col rounded-2xl overflow-hidden border cursor-pointer shadow-[var(--admin-shadow-card)] bg-[var(--admin-surface-raised)]"
              style={{ borderColor: 'var(--admin-border)' }}
            >
              <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: 'var(--admin-border-subtle)', background: 'var(--admin-surface)' }}>
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: `${challenge.accent}18`, color: challenge.accent }}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] admin-text-secondary">
                      {challenge.badge}
                    </p>
                    <h2 className="text-sm font-bold admin-text-primary">{challenge.title}</h2>
                  </div>
                </div>
                <span className="rounded-full border px-2.5 py-1 text-[10px] font-bold" style={{ borderColor: `${challenge.accent}55`, color: challenge.accent }}>
                  {challenge.points}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-4 p-4">
                <p className="text-sm admin-text-secondary">{challenge.description}</p>

                <div>
                  <div className="mb-1 flex items-center justify-between text-[11px] font-semibold admin-text-secondary">
                    <span>Progress</span>
                    <span className="admin-text-primary">{challenge.progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--admin-progress-track)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${challenge.progress}%`,
                        background: `linear-gradient(90deg, ${challenge.accent}, #06B6D4)`,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold" style={{ borderColor: 'var(--admin-border-subtle)', background: 'var(--admin-surface)' }}>
                  <span className="admin-text-secondary">Next milestone</span>
                  <span className="admin-text-primary">{Math.max(challenge.progress - 10, 0)}% to unlock</span>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
};

export default DailyChallenges;
