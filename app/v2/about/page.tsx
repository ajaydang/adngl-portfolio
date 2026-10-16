'use client';

import dynamic from 'next/dynamic';
import V2Navigation from '../components/V2Navigation';
import V2Footer from '../components/V2Footer';
import { portfolioData } from '@/lib/portfolio-data';

const WavyGrid = dynamic(() => import('../components/WavyGrid'), { ssr: false });

export default function V2About() {
  const { bio, philosophy, skills, experience, education } = portfolioData;

  const skillCategories = skills.reduce<Record<string, typeof skills>>((acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  }, {});

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
            <p className="v2-section-label">01 — About</p>
            <h1 className="v2-about-title">
              About
              <br />
              Me
            </h1>
            <p className="v2-about-subtitle">{portfolioData.title}</p>
            <p className="v2-about-intro">{portfolioData.intro}</p>
          </div>
        </div>

        {/* Right — scrollable details */}
        <div className="v2-about-right">
          <div className="v2-about-card">
            <h3 className="v2-heading-sm">Background</h3>
            {bio.split('\n\n').map((p, i) => (
              <p key={i} className="v2-body-text">{p}</p>
            ))}
          </div>

          <div className="v2-about-card">
            <h3 className="v2-heading-sm">Philosophy</h3>
            <p className="v2-body-text">{philosophy}</p>
          </div>

          <div className="v2-about-card">
            <h3 className="v2-heading-sm">Skills &amp; Expertise</h3>
            {Object.entries(skillCategories).map(([cat, catSkills]) => (
              <div key={cat} style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--v2-accent)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  {cat}
                </p>
                <div className="v2-skills-grid">
                  {catSkills.map((s) => (
                    <div key={s.name} className="v2-skill-tag">
                      {s.name}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="v2-about-card">
            <h3 className="v2-heading-sm">Experience</h3>
            <div className="v2-experience-list">
              {experience.map((exp, i) => (
                <div key={i} className="v2-experience-item">
                  <h4>{exp.role}</h4>
                  <div className="period">{exp.company} · {exp.period}</div>
                  <p>{exp.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="v2-about-card">
            <h3 className="v2-heading-sm">Education</h3>
            <div className="v2-experience-list">
              {education.map((edu, i) => (
                <div key={i} className="v2-experience-item">
                  <h4>{edu.degree}</h4>
                  <div className="period">
                    {edu.institution}
                    {edu.affiliate && ` / ${edu.affiliate}`} · {edu.period}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <V2Footer />
    </>
  );
}
