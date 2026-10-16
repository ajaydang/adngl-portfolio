export type NavSection = 'home' | 'about' | 'work' | 'contact';

export interface NavNode {
  id: NavSection;
  label: string;
  position: [number, number, number];
  color: string;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  role: string;
  technologies: string[];
  features: string[];
  demoUrl?: string;
  repoUrl?: string;
  thumbnail?: string;
  category: string;
}

export interface Skill {
  name: string;
  level: number;
  category: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface PortfolioData {
  name: string;
  title: string;
  intro: string;
  bio: string;
  philosophy: string;
  email: string;
  github: string;
  linkedin: string;
  skills: Skill[];
  projects: Project[];
  experience: Experience[];
  education: Education[];
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  description: string;
  technologies: string[];
}

export interface Education {
  institution: string;
  affiliate?: string;
  degree: string;
  period: string;
}
