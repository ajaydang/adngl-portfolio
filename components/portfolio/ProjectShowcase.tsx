'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ExternalLink, GitBranch } from 'lucide-react';
import { portfolioData } from '@/lib/portfolio-data';
import type { Project } from '@/types/portfolio';

export const ALL_PROJECTS = 'All';

export const WORK_TABS: { id: string; label: string }[] = [
  ALL_PROJECTS,
  ...Array.from(new Set(portfolioData.projects.map((p) => p.category))),
].map((c) => ({ id: c, label: c }));

interface ProjectShowcaseProps {
  filter: string;
  onBack: () => void;
}

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onClick={onClick}
      className="w-full text-left bg-(--c-bg-95) backdrop-blur-md border border-(--c-border-40) rounded-lg p-4 hover:border-(--c-accent-40) transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-(--c-text) font-medium text-sm group-hover:text-(--c-accent) transition-colors">
          {project.name}
        </p>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-(--c-border-40) text-(--c-accentH-60) border border-(--c-border-40) ml-2 shrink-0">
          {project.category}
        </span>
      </div>
      <p className="text-(--c-text-muted) text-xs leading-relaxed mb-3">{project.description}</p>
      <div className="flex flex-wrap gap-1">
        {project.technologies.slice(0, 4).map((tech) => (
          <span
            key={tech}
            className="text-[10px] px-1.5 py-0.5 rounded bg-(--c-accent-10) text-(--c-accent-70) border border-(--c-accent-20)"
          >
            {tech}
          </span>
        ))}
      </div>
    </motion.button>
  );
}

function ProjectDetail({ project, onClose }: { project: Project; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-(--c-bg-95) backdrop-blur-xl border border-(--c-border-40) rounded-xl p-6"
    >
      <button
        onClick={onClose}
        className="flex items-center gap-2 text-(--c-accent-60) hover:text-(--c-accent) text-xs tracking-widest uppercase mb-5 transition-colors rounded"
      >
        <ArrowLeft size={12} /> Back to Projects
      </button>

      <div className="mb-4">
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-(--c-border-40) text-(--c-accentH-60) border border-(--c-border-40)">
          {project.category}
        </span>
        <h3 className="text-xl font-semibold text-(--c-text) mt-2">{project.name}</h3>
        <p className="text-(--c-accentH-60) text-xs mt-0.5">{project.role}</p>
      </div>

      <p className="text-(--c-text-muted) text-sm leading-relaxed mb-5">{project.description}</p>

      <div className="mb-5">
        <p className="text-(--c-accent) text-[11px] tracking-[0.25em] uppercase mb-2">Key Features</p>
        <ul className="space-y-1">
          {project.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-(--c-text-muted) text-xs">
              <span className="text-(--c-danger) mt-0.5 shrink-0">▸</span> {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-5">
        <p className="text-(--c-accent) text-[11px] tracking-[0.25em] uppercase mb-2">Stack</p>
        <div className="flex flex-wrap gap-1.5">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="text-xs px-2 py-0.5 rounded bg-(--c-accent-10) text-(--c-accent-70) border border-(--c-accent-20)"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {(project.demoUrl || project.repoUrl) && (
        <div className="flex gap-3">
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-(--c-accent) hover:text-(--c-accentH) transition-colors"
            >
              <ExternalLink size={12} /> Live Demo
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-(--c-text-muted) hover:text-(--c-text) transition-colors"
            >
              <GitBranch size={12} /> Repository
            </a>
          )}
        </div>
      )}
    </motion.div>
  );
}

export function ProjectShowcase({ filter, onBack }: ProjectShowcaseProps) {
  const [selected, setSelected] = useState<Project | null>(null);

  const filtered =
    filter === ALL_PROJECTS
      ? portfolioData.projects
      : portfolioData.projects.filter((p) => p.category === filter);

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="bg-(--c-bg-95) backdrop-blur-xl border border-(--c-border-40) rounded-xl p-6 md:p-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-(--c-accent-60) hover:text-(--c-accent) text-xs tracking-widest uppercase mb-6 transition-colors rounded"
          aria-label="Back to home"
        >
          <ArrowLeft size={12} /> Back
        </button>

        <div className="mb-6">
          <p className="text-(--c-accent) text-xs tracking-[0.3em] uppercase mb-1">Work</p>
          <h2 className="text-2xl font-semibold text-(--c-text)">Selected Projects</h2>
        </div>

        <AnimatePresence mode="wait">
          {selected ? (
            <ProjectDetail
              key="detail"
              project={selected}
              onClose={() => setSelected(null)}
            />
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p aria-live="polite" className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-(--c-text-dim)">
                <span className="text-(--c-accent)">{filter === ALL_PROJECTS ? 'All projects' : filter}</span>
                · {filtered.length} {filtered.length === 1 ? 'project' : 'projects'}
              </p>

              <div className="grid gap-3">
                <AnimatePresence>
                  {filtered.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onClick={() => setSelected(project)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
