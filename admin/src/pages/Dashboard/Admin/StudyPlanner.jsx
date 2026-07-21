import React from 'react';
import { motion } from 'framer-motion';
import { MdCalendarToday, MdSchedule, MdAutoAwesome, MdBook } from 'react-icons/md';

const timeBlocks = [
  { label: 'Morning', hours: '7:00 - 10:00', color: '#06B6D4', tasks: ['DSA Warmup', 'React Review'] },
  { label: 'Afternoon', hours: '12:00 - 3:00', color: '#8B5CF6', tasks: ['System Design Reading', 'Project Build'] },
  { label: 'Evening', hours: '6:00 - 9:00', color: '#10B981', tasks: ['Quiz Practice', 'Revision Notes'] },
];

const scheduleItems = [
  { time: '07:30', title: 'DSA Warmup', details: '2 medium problems', accent: '#06B6D4' },
  { time: '09:00', title: 'React Review', details: 'Hooks and state management', accent: '#06B6D4' },
  { time: '13:00', title: 'System Design Reading', details: 'Scalability fundamentals', accent: '#8B5CF6' },
  { time: '19:00', title: 'Quiz Practice', details: 'Timed coding quiz', accent: '#10B981' },
];

const StudyPlanner = () => {
  return (
    <div className="admin-page space-y-6 md:space-y-8 animate-fade-in relative z-10 pb-16 min-h-full rounded-2xl p-4 md:p-6 -m-4 md:-m-6 border border-[var(--admin-border)] shadow-[var(--admin-shadow-card)] bg-[var(--admin-page-panel)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#06B6D4]">
            Study Flow
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold admin-text-primary">
            Study Planner
          </h1>
          <p className="mt-2 text-sm admin-text-secondary">
            A visual daily schedule for balancing focused learning blocks and revision time.
          </p>
        </div>

        <div className="rounded-2xl border px-4 py-3" style={{ background: 'var(--admin-surface-raised)', borderColor: 'var(--admin-border)' }}>
          <div className="flex items-center gap-2 text-sm font-semibold admin-text-primary">
            <MdCalendarToday size={16} className="text-[#06B6D4]" />
            Tuesday, July 18
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border p-4 md:p-5 shadow-[var(--admin-shadow-card)] bg-[var(--admin-surface)]" style={{ borderColor: 'var(--admin-border)' }}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold admin-text-primary">Daily Timeline</p>
              <p className="text-xs admin-text-secondary">Structured by time of day</p>
            </div>
            <div className="rounded-full border px-3 py-1 text-[11px] font-semibold admin-text-secondary" style={{ borderColor: 'var(--admin-border)' }}>
              4 tasks
            </div>
          </div>

          <div className="space-y-3">
            {scheduleItems.map((item, index) => (
              <motion.div
                key={item.time}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.3 }}
                whileHover={{ y: -4, scale: 1.01, boxShadow: '0 14px 30px rgba(6, 182, 212, 0.16)' }}
                className="flex items-start gap-3 rounded-2xl border p-3 transition-all duration-300 bg-[var(--admin-surface-raised)]"
                style={{ borderColor: 'var(--admin-border)' }}
              >
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white" style={{ background: item.accent }}>
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold admin-text-primary">{item.title}</p>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] admin-text-secondary">{item.time}</span>
                  </div>
                  <p className="mt-1 text-sm admin-text-secondary">{item.details}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border p-4 md:p-5 shadow-[var(--admin-shadow-card)] bg-[var(--admin-surface)]" style={{ borderColor: 'var(--admin-border)' }}>
            <div className="mb-4 flex items-center gap-2">
              <MdSchedule size={18} className="text-[#8B5CF6]" />
              <h2 className="text-lg font-bold admin-text-primary">Focus Blocks</h2>
            </div>

            <div className="space-y-3">
              {timeBlocks.map((block) => (
                <div key={block.label} className="rounded-2xl border p-3" style={{ borderColor: 'var(--admin-border-subtle)', background: 'var(--admin-surface-raised)' }}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: block.color }} />
                      <p className="text-sm font-semibold admin-text-primary">{block.label}</p>
                    </div>
                    <span className="text-[11px] font-semibold admin-text-secondary">{block.hours}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {block.tasks.map((task) => (
                      <span key={task} className="rounded-full border px-2.5 py-1 text-[11px] font-semibold admin-text-secondary" style={{ borderColor: 'var(--admin-border)' }}>
                        {task}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border p-4 md:p-5 shadow-[var(--admin-shadow-card)] bg-[var(--admin-surface)]" style={{ borderColor: 'var(--admin-border)' }}>
            <div className="flex items-center gap-2">
              <MdAutoAwesome size={18} className="text-[#F59E0B]" />
              <h2 className="text-lg font-bold admin-text-primary">Suggested Focus</h2>
            </div>
            <div className="mt-3 flex items-start gap-3 rounded-2xl border p-3" style={{ borderColor: 'var(--admin-border-subtle)', background: 'var(--admin-surface-raised)' }}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#06B6D4]/15 text-[#06B6D4]">
                <MdBook size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold admin-text-primary">Deep Work Session</p>
                <p className="mt-1 text-sm admin-text-secondary">Protect the afternoon block for the highest-value learning task.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyPlanner;
