import React from 'react';
import { motion } from 'framer-motion';
import {
  MdCode,
  MdBarChart,
  MdCloud,
  MdSecurity,
  MdPhoneAndroid,
  MdDesignServices,
  MdArrowForward,
  MdSchool,
} from 'react-icons/md';

const careers = [
  {
    title: 'Full Stack Development',
    description: 'Build end-to-end web applications across frontend, backend, and databases.',
    icon: MdCode,
    accent: '#06B6D4',
    demand: 'High Demand',
    roadmapSteps: 6,
    avgSalary: '$95K',
    skills: ['JavaScript', 'React', 'Node.js', 'SQL', 'REST APIs'],
  },
  {
    title: 'Data Science',
    description: 'Turn raw data into actionable insight using statistics and machine learning.',
    icon: MdBarChart,
    accent: '#8B5CF6',
    demand: 'High Demand',
    roadmapSteps: 7,
    avgSalary: '$110K',
    skills: ['Python', 'Pandas', 'Machine Learning', 'SQL', 'Statistics'],
  },
  {
    title: 'Cloud & DevOps',
    description: 'Design scalable infrastructure and automate deployment pipelines.',
    icon: MdCloud,
    accent: '#10B981',
    demand: 'Growing',
    roadmapSteps: 5,
    avgSalary: '$105K',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Linux'],
  },
  {
    title: 'Cybersecurity',
    description: 'Protect systems and data from evolving digital threats.',
    icon: MdSecurity,
    accent: '#EF4444',
    demand: 'High Demand',
    roadmapSteps: 6,
    avgSalary: '$100K',
    skills: ['Network Security', 'Penetration Testing', 'Cryptography', 'SIEM'],
  },
  {
    title: 'Mobile Development',
    description: 'Craft native and cross-platform apps for iOS and Android.',
    icon: MdPhoneAndroid,
    accent: '#F59E0B',
    demand: 'Steady',
    roadmapSteps: 5,
    avgSalary: '$92K',
    skills: ['React Native', 'Swift', 'Kotlin', 'Mobile UI/UX'],
  },
  {
    title: 'UI/UX Design',
    description: 'Design intuitive, accessible, and delightful digital experiences.',
    icon: MdDesignServices,
    accent: '#EC4899',
    demand: 'Growing',
    roadmapSteps: 4,
    avgSalary: '$85K',
    skills: ['Figma', 'Wireframing', 'User Research', 'Design Systems'],
  },
];

const CareerOptions = () => {
  return (
    <div className="admin-page space-y-6 md:space-y-8 animate-fade-in relative z-10 pb-16 min-h-full rounded-2xl p-4 md:p-6 -m-4 md:-m-6 border border-[var(--admin-border)] shadow-[var(--admin-shadow-card)] bg-[var(--admin-page-panel)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#06B6D4]">
            Plan Ahead
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold admin-text-primary">
            Career Options
          </h1>
          <p className="mt-2 text-sm admin-text-secondary">
            Explore technical career paths, the skills they require, and where to start.
          </p>
        </div>

        <div
          className="rounded-2xl border px-4 py-3 min-w-[190px]"
          style={{
            background: 'var(--admin-surface-raised)',
            borderColor: 'var(--admin-border)',
          }}
        >
          <div className="flex items-center gap-2 text-sm font-semibold admin-text-primary">
            <MdSchool size={16} className="text-[#06B6D4]" />
            {careers.length} Career Paths
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {careers.map((career, index) => {
          const Icon = career.icon;
          return (
            <motion.article
              key={career.title}
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
                    style={{ background: `${career.accent}18`, color: career.accent }}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] admin-text-secondary">
                      {career.demand}
                    </p>
                    <h2 className="text-sm font-bold admin-text-primary">{career.title}</h2>
                  </div>
                </div>
                <span className="rounded-full border px-2.5 py-1 text-[10px] font-bold" style={{ borderColor: `${career.accent}55`, color: career.accent }}>
                  {career.avgSalary}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-4 p-4">
                <p className="text-sm admin-text-secondary">{career.description}</p>

                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] admin-text-secondary">
                    Core Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {career.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border px-2.5 py-1 text-[11px] font-semibold admin-text-secondary"
                        style={{ borderColor: 'var(--admin-border)' }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold" style={{ borderColor: 'var(--admin-border-subtle)', background: 'var(--admin-surface)' }}>
                  <span className="admin-text-secondary">Roadmap</span>
                  <span className="admin-text-primary">{career.roadmapSteps} milestones</span>
                </div>

                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-transform duration-300 group-hover:scale-[1.02]"
                  style={{ background: `linear-gradient(90deg, ${career.accent}, #06B6D4)` }}
                >
                  View Roadmap
                  <MdArrowForward size={16} />
                </button>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
};

export default CareerOptions;
