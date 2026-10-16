'use client';

import dynamic from 'next/dynamic';
import V2Navigation from '../components/V2Navigation';
import V2Footer from '../components/V2Footer';
import { portfolioData } from '@/lib/portfolio-data';

const WavyGrid = dynamic(() => import('../components/WavyGrid'), { ssr: false });

export default function V2Work() {
  const { projects } = portfolioData;

  return (
    <>
      <V2Navigation />

      <div className="v2-hero-canvas">
        <WavyGrid />
      </div>

      <main className="v2-about-split">
        {/* Left — sticky hero-style title */}
        <div className="v2-about-left">
          <div className="v2-about-left-inner">
            <p className="v2-section-label">02 — Work</p>
            <h1 className="v2-about-title">
              Selected
              <br />
              Work
            </h1>
            <p className="v2-about-subtitle">Projects &amp; Experience</p>
            <p className="v2-about-intro">
              A collection of projects spanning fintech, healthcare, pharma, and e-commerce — built with modern web technologies and a focus on quality.
            </p>
          </div>
        </div>

        {/* Right — scrollable project cards */}
        <div className="v2-about-right">
          {projects.map((project) => {
            const href = project.demoUrl || project.repoUrl;
            const Tag = href ? 'a' : 'div';
            const linkProps = href
              ? { href, target: '_blank' as const, rel: 'noopener noreferrer' as const }
              : {};

            return (
              <Tag key={project.id} className="v2-project-card" {...linkProps}>
                <div className="v2-project-card-info">
                  <h3 className="v2-project-card-name">{project.name}</h3>
                  <div className="v2-project-card-role">
                    {project.role} · {project.category}
                  </div>
                  <p className="v2-project-card-desc">{project.description}</p>
                  <div className="v2-project-card-tech">
                    {project.technologies.map((tech) => (
                      <span key={tech}>{tech}</span>
                    ))}
                  </div>
                </div>
                <div className="v2-project-arrow" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </div>
              </Tag>
            );
          })}
        </div>
      </main>

      <V2Footer />
    </>
  );
}
