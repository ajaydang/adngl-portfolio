'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { portfolioData } from '@/lib/portfolio-data';

export type AboutTab = 'profile' | 'philosophy' | 'skills' | 'experience' | 'education';

export const ABOUT_TABS: { id: AboutTab; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'philosophy', label: 'Philosophy' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
];

const TAB_HEADINGS: Record<AboutTab, string> = {
  profile: 'Profile',
  philosophy: 'Philosophy',
  skills: 'Technical Skills',
  experience: 'Experience',
  education: 'Education',
};

interface AboutSectionProps {
  tab: AboutTab;
  onBack: () => void;
}

function Profile() {
  return (
    <div className="space-y-4 text-white/60 text-sm leading-relaxed">
      {portfolioData.bio.split('\n\n').map((para, i) => (
        <p key={i}>{para}</p>
      ))}
    </div>
  );
}

function Philosophy() {
  return (
    <blockquote className="border-l-2 border-[#FF6900]/60 pl-4 text-white/70 text-base italic leading-relaxed">
      &ldquo;{portfolioData.philosophy}&rdquo;
    </blockquote>
  );
}

function Skills() {
  const grouped = portfolioData.skills.reduce<Record<string, typeof portfolioData.skills>>((acc, skill) => {
    (acc[skill.category] ??= []).push(skill);
    return acc;
  }, {});
  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([category, skills]) => (
        <div key={category}>
          <p className="text-white/30 text-xs uppercase tracking-wider mb-2">{category}</p>
          <div className="space-y-2">
            {skills.map((skill) => (
              <div key={skill.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-white/70 text-xs">{skill.name}</span>
                  <span className="text-[#FFA000]/60 text-xs">{skill.level}%</span>
                </div>
                <div className="h-px bg-[#790B20]/30 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-linear-to-r from-[#C90008] to-[#FF6900]"
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{ duration: 0.8, delay: 0.15 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Experience() {
  return (
    <div className="space-y-5">
      {portfolioData.experience.map((exp) => (
        <div key={exp.company} className="border-l border-[#790B20]/40 pl-3">
          <p className="text-white text-sm font-medium">{exp.role}</p>
          <p className="text-[#FFA000]/70 text-xs mb-1">
            {exp.company} · {exp.period}
          </p>
          <p className="text-white/50 text-xs leading-relaxed">{exp.description}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {exp.technologies.map((tech) => (
              <span
                key={tech}
                className="text-[10px] px-1.5 py-0.5 rounded bg-[#790B20]/20 text-[#FF6900]/70 border border-[#790B20]/20"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Education() {
  return (
    <div className="space-y-4">
      {portfolioData.education.map((edu) => (
        <div key={edu.degree} className="border-l border-[#790B20]/40 pl-3">
          <p className="text-white text-sm font-medium">{edu.degree}</p>
          <p className="text-[#FFA000]/70 text-xs mt-0.5">{edu.institution}</p>
          {edu.affiliate && (
            <p className="text-white/40 text-xs">{edu.affiliate}</p>
          )}
          <p className="text-white/30 text-xs mt-1">{edu.period}</p>
        </div>
      ))}
    </div>
  );
}

const PANELS: Record<AboutTab, () => React.ReactElement> = {
  profile: Profile,
  philosophy: Philosophy,
  skills: Skills,
  experience: Experience,
  education: Education,
};

export function AboutSection({ tab, onBack }: AboutSectionProps) {
  const Panel = PANELS[tab];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md">
      <div className="bg-[#0B0202]/85 backdrop-blur-xl border border-[#790B20]/30 rounded-xl p-6 md:p-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#FF6900]/60 hover:text-[#FF6900] text-xs tracking-widest uppercase mb-6 transition-colors focus-visible:outline-2 focus-visible:outline-[#FF6900] focus-visible:outline-offset-2 rounded"
          aria-label="Back to home"
        >
          <ArrowLeft size={12} />
          Back
        </button>

        <div className="mb-6">
          <p className="text-[#FF6900] text-xs tracking-[0.3em] uppercase mb-2">About</p>
          <h2 className="text-2xl font-semibold text-white mb-1">{portfolioData.name}</h2>
          <p className="text-[#FFA000] text-sm">{portfolioData.title}</p>
        </div>

        <section aria-live="polite" className="border-t border-[#790B20]/20 pt-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <h3 className="text-[#FF6900] text-xs tracking-[0.25em] uppercase mb-4">{TAB_HEADINGS[tab]}</h3>
              <Panel />
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </motion.div>
  );
}
