import type { PortfolioData } from '@/types/portfolio';

export const portfolioData: PortfolioData = {
  name: 'Ajay Dangol',
  title: 'Full-Stack Developer',
  intro:
    'I create thoughtful, performant digital products through modern frontend engineering, immersive interaction, and purposeful design.',
  bio: `I'm a full-stack developer with a passion for creating digital experiences that blend technical precision with creative vision. With expertise spanning modern web technologies, I build products that are both beautiful and functional.

My approach combines clean architecture with expressive interfaces — I believe great software should be as enjoyable to use as it is reliable to run.`,
  philosophy:
    'Great software emerges at the intersection of engineering discipline and creative thinking. I build for humans first, optimizing for clarity, accessibility, and delight before chasing metrics.',
  email: 'ajaydangol@lftechnology.com',
  github: 'https://github.com/ajaydangol',
  linkedin: 'https://linkedin.com/in/ajaydangol',
  skills: [
    // Languages & Scripts
    { name: 'PHP', level: 80, category: 'Languages' },
    { name: 'HTML5', level: 95, category: 'Languages' },
    { name: 'CSS3', level: 92, category: 'Languages' },
    { name: 'JavaScript', level: 92, category: 'Languages' },
    { name: 'Sass', level: 88, category: 'Languages' },
    { name: 'TypeScript', level: 90, category: 'Languages' },
    // Frameworks & Libraries
    { name: 'React.js', level: 92, category: 'Frameworks' },
    { name: 'Next.js', level: 90, category: 'Frameworks' },
    { name: 'Node.js', level: 85, category: 'Frameworks' },
    { name: 'Express', level: 82, category: 'Frameworks' },
    { name: 'Tailwind CSS', level: 90, category: 'Frameworks' },
    { name: 'Ant Design', level: 80, category: 'Frameworks' },
    { name: 'Bootstrap', level: 85, category: 'Frameworks' },
    { name: 'jQuery', level: 80, category: 'Frameworks' },
    { name: 'Gatsby', level: 75, category: 'Frameworks' },
    { name: 'Yii Framework', level: 72, category: 'Frameworks' },
    { name: 'WordPress', level: 78, category: 'Frameworks' },
    { name: 'Webflow', level: 75, category: 'Frameworks' },
    { name: 'Prisma', level: 78, category: 'Frameworks' },
    { name: 'Polymer', level: 65, category: 'Frameworks' },
    // Databases
    { name: 'MySQL', level: 80, category: 'Database' },
    { name: 'PostgreSQL', level: 78, category: 'Database' },
    // DevOps & Tools
    { name: 'Docker', level: 75, category: 'DevOps' },
    { name: 'GitHub', level: 90, category: 'VCS' },
    { name: 'Bitbucket', level: 82, category: 'VCS' },
    { name: 'GitLab', level: 78, category: 'VCS' },
    // Collaboration
    { name: 'JIRA', level: 85, category: 'Collaboration' },
    { name: 'Slack', level: 90, category: 'Collaboration' },
    { name: 'Asana', level: 78, category: 'Collaboration' },
    { name: 'Phabricator', level: 70, category: 'Collaboration' },
  ],
  experience: [
    {
      company: 'Leapfrog Technology, Inc.',
      role: 'Software Engineer',
      period: '2023 – Present',
      description:
        'Building and maintaining full-stack web applications as a Software Engineer. Contributing to enterprise-grade products with a focus on frontend quality and performance.',
      technologies: ['HTML5', 'Polymer.js', 'React', 'TypeScript', 'Node.js'],
    },
    {
      company: 'Leapfrog Technology, Inc.',
      role: 'Associate Software Engineer',
      period: 'Jul 2021 – 2023',
      description:
        'Developed and maintained web applications as part of cross-functional product teams. Grew frontend expertise across multiple client projects.',
      technologies: ['Node.js', 'React', 'TypeScript'],
    },
    {
      company: 'Persimmon Health',
      role: 'Frontend Developer',
      period: 'Nov 2021 – Jul 2022',
      description:
        'Built responsive, accessible frontend interfaces for a health-tech platform. Collaborated closely with designers and backend engineers to deliver a seamless user experience.',
      technologies: ['React', 'TypeScript', 'CSS3'],
    },
    {
      company: 'Miracle Interface',
      role: 'Web Developer',
      period: 'Dec 2017 – Jul 2021',
      description:
        'Designed and developed websites and web applications for various clients. Handled full project lifecycle from concept to deployment.',
      technologies: ['PHP', 'JavaScript', 'HTML5', 'CSS3', 'WordPress'],
    },
    {
      company: 'Miracle Interface',
      role: 'Graphic Designer',
      period: 'May 2015 – Jul 2021',
      description:
        'Created visual assets, branding materials, and UI mockups for clients across different industries alongside web development work.',
      technologies: ['Photoshop', 'Illustrator', 'Figma'],
    },
  ],
  education: [
    {
      institution: 'University of Lancashire',
      affiliate: 'Softwarica College of IT & E-commerce',
      degree: 'Bachelor of Science with Honours in Business Computing and Information Systems',
      period: '2015 – 2018',
    },
  ],
  projects: [
    {
      id: 'first-help-financial',
      name: 'First Help Financial',
      description:
        'Auto finance platform providing fair lending services across the US. Includes a BPA Logviewer for transparent, traceable access to policy premium calculation logs — enabling self-service debugging and reducing engineering overhead.',
      role: 'Frontend Developer',
      technologies: ['React', 'TypeScript', 'Tailwind CSS', 'ShadCN', 'REST APIs'],
      features: [
        'Designed full UI/UX of BPA Logviewer in collaboration with clients',
        'Integrated ShadCN components with existing frontend frameworks',
        'Built reusable, modular React components following component-driven principles',
        'Consumed RESTful APIs with loading states, error handling, and dynamic rendering',
        'Delivered responsive layouts across desktop, tablet, and mobile',
      ],
      category: 'Fintech',
    },
    {
      id: 'avant-garde-healthcare',
      name: 'Avant Garde Healthcare',
      description:
        'Customisable alert system for Operating Rooms that sends timely notifications about critical cases via standardised email templates. Provides real-time and retrospective data insights to support clinical decision-making.',
      role: 'Frontend Developer',
      technologies: ['React', 'TypeScript', 'REST APIs', 'Git'],
      features: [
        'Built reusable, modular UI components for maintainability',
        'Integrated APIs with backend team, optimising data flow and state management',
        'Implemented component styles with responsiveness and accessibility in mind',
        'Collaborated cross-functionally to align on goals before client presentations',
      ],
      category: 'Healthcare',
    },
    {
      id: 'aspen-pipeline',
      name: 'Aspen Pipeline',
      description:
        'Cloud-based drug discovery pipeline management application originally built with Polymer 2. Helps pharma companies manage and track the full drug discovery process within their cloud environments.',
      role: 'Fullstack Developer',
      technologies: ['Polymer', 'LitElement', 'JavaScript', 'REST APIs'],
      features: [
        'Integrated LitElement components with existing frontend frameworks',
        'Developed and maintained backend APIs for frontend-backend communication',
        'Collaborated with UX/UI designers to ensure design specification accuracy',
        'Diagnosed and resolved bugs and performance issues across the stack',
      ],
      category: 'Pharma',
    },
    {
      id: 'addy-healthcare',
      name: 'Addy Healthcare',
      description:
        'Browser-based UI enabling business experts — not data scientists — to train machines to identify and extract text and data from documents, automating manual tasks like contract review, medical records, and resume parsing.',
      role: 'Frontend Developer',
      technologies: ['React', 'TypeScript', 'REST APIs', 'Git'],
      features: [
        'Integrated frontend components with RESTful APIs for seamless data exchange',
        'Implemented design concepts in collaboration with UX/UI designers',
        'Maintained code quality via version control and peer reviews',
        'Resolved bugs and performance issues across the application stack',
      ],
      category: 'Healthcare',
    },
    {
      id: 'venteur',
      name: 'Venteur',
      description:
        'Benefits platform that lets employers offer tax-free money for employees to choose personalised health insurance. Saves employers 20–30% on average while empowering employees with flexibility and better coverage.',
      role: 'Frontend Designer',
      technologies: ['React', 'TypeScript', 'CSS3', 'HTML5'],
      features: [
        'Translated design concepts into clean, responsive, maintainable code',
        'Validated application against design requirements for layout accuracy',
        'Identified and fixed UI issues and design inconsistencies',
        'Wrote well-structured, thoroughly tested UI code',
      ],
      category: 'Fintech',
    },
    {
      id: 'returnalyze',
      name: 'Returnalyze',
      description:
        'AI-driven returns analytics platform for data-driven retailers. Predictive models reduce return rates by 15–20% and boost repurchase rates by 6%, turning returns into customer loyalty opportunities.',
      role: 'Frontend Designer',
      technologies: ['React', 'TypeScript', 'CSS3'],
      features: [
        'Implemented UI changes in close collaboration with designers',
        'Validated application against design specifications for consistency',
        'Identified and resolved functional issues during development',
      ],
      category: 'E-Commerce',
    },
    {
      id: 'persimmon-healthcare',
      name: 'Persimmon Healthcare',
      description:
        'Platform connecting healthcare innovators with designers, engineers, and industry veterans to bring their visions to life through better use of technology in the American healthcare system.',
      role: 'Webflow Developer',
      technologies: ['Webflow', 'HTML5', 'CSS3'],
      features: [
        'Designed, implemented, and iterated on homepage and landing pages',
        'Collaborated with marketing and design teams to align with branding goals',
        'Validated pages against design specs and resolved performance issues',
      ],
      category: 'Healthcare',
    },
  ],
};
