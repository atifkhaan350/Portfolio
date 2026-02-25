// ============================================================================
// SITE CONFIGURATION
// ============================================================================
// Edit this file to customize all content on your site.
// All text, images, and data are controlled from here.
// Do NOT modify component files — only edit this config.
// ============================================================================

// ----------------------------------------------------------------------------
// Navigation
// ----------------------------------------------------------------------------

export interface NavLink {
  label: string;
  href: string;
}

export interface NavigationConfig {
  logo: string;
  logoAccent: string;
  navLinks: NavLink[];
  ctaText: string;
}

export const navigationConfig: NavigationConfig = {
  logo: "ATIF",
  logoAccent: ".",
  navLinks: [
    { label: "About", href: "#about" },
    { label: "Skills", href: "#skills" },
    { label: "Tech Stack", href: "#tech" },
    { label: "Contact", href: "#contact" },
  ],
  ctaText: "Hire Me",
};

// ----------------------------------------------------------------------------
// Hero Section
// ----------------------------------------------------------------------------

export interface HeroConfig {
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  backgroundImage: string;
  gridRows: number;
  gridCols: number;
  pinkCells: { row: number; col: number }[];
}

export const heroConfig: HeroConfig = {
  titleLine1: "MUHAMMAD",
  titleLine2: "ATIF",
  subtitle: "MERN Stack Developer | Building Modern Web Experiences",
  ctaText: "View My Work",
  ctaHref: "#skills",
  backgroundImage: "/images/hero-bg.jpg",
  gridRows: 6,
  gridCols: 8,
  pinkCells: [
    { row: 0, col: 2 },
    { row: 1, col: 5 },
    { row: 2, col: 1 },
    { row: 3, col: 6 },
    { row: 4, col: 3 },
    { row: 5, col: 7 },
  ],
};

// ----------------------------------------------------------------------------
// Product Showcase Section (Adapted for Skills/Projects)
// ----------------------------------------------------------------------------

export interface ProductFeature {
  value: string;
  label: string;
}

export interface ProductShowcaseConfig {
  sectionLabel: string;
  headingMain: string;
  headingAccent: string;
  productName: string;
  description: string;
  price: string;
  features: ProductFeature[];
  colorSwatches: string[];
  colorSwatchesLabel: string;
  ctaText: string;
  productImage: string;
  productImageAlt: string;
  decorativeText: string;
}

export const productShowcaseConfig: ProductShowcaseConfig = {
  sectionLabel: "EXPERTISE",
  headingMain: "FULL STACK",
  headingAccent: "DEVELOPER",
  productName: "MERN Stack Specialist",
  description: "I craft scalable, high-performance web applications using MongoDB, Express.js, React, and Node.js. From responsive frontends to robust backends, I deliver complete solutions that drive business growth.",
  price: "3+ Years",
  features: [
    { value: "MongoDB", label: "Database" },
    { value: "Express", label: "Backend Framework" },
    { value: "React", label: "Frontend Library" },
    { value: "Node.js", label: "Runtime" },
  ],
  colorSwatches: ["#61dafb", "#68a063", "#f0db4f", "#e535ab"],
  colorSwatchesLabel: "Technologies",
  ctaText: "Download Resume",
  productImage: "/images/developer.png",
  productImageAlt: "MERN Stack Development",
  decorativeText: "CODE",
};

// ----------------------------------------------------------------------------
// Color Palette Section (Adapted for Tech Stack)
// ----------------------------------------------------------------------------

export interface ColorSwatch {
  name: string;
  nameSecondary: string;
  color: string;
  description: string;
}

export interface ColorPaletteConfig {
  sectionLabel: string;
  headingMain: string;
  headingAccent: string;
  colors: ColorSwatch[];
  bottomText: string;
  decorativeText: string;
}

export const colorPaletteConfig: ColorPaletteConfig = {
  sectionLabel: "TECH STACK",
  headingMain: "TOOLS &",
  headingAccent: "TECHNOLOGIES",
  colors: [
    {
      name: "React",
      nameSecondary: "Frontend",
      color: "#61dafb",
      description: "Building interactive UIs with hooks, context, and modern patterns",
    },
    {
      name: "Node.js",
      nameSecondary: "Backend",
      color: "#68a063",
      description: "Server-side JavaScript for scalable applications",
    },
    {
      name: "MongoDB",
      nameSecondary: "Database",
      color: "#47a248",
      description: "NoSQL database for flexible data storage",
    },
    {
      name: "Express",
      nameSecondary: "Framework",
      color: "#404040",
      description: "Minimalist web framework for Node.js",
    },
    {
      name: "JavaScript",
      nameSecondary: "Language",
      color: "#f0db4f",
      description: "ES6+ features for modern development",
    },
    {
      name: "TypeScript",
      nameSecondary: "Typed JS",
      color: "#3178c6",
      description: "Type-safe code for better maintainability",
    },
    {
      name: "Tailwind",
      nameSecondary: "Styling",
      color: "#06b6d4",
      description: "Utility-first CSS for rapid UI development",
    },
    {
      name: "Git",
      nameSecondary: "Version Control",
      color: "#f05032",
      description: "Collaborative development and code management",
    },
  ],
  bottomText: "Click on any technology to learn more about my experience",
  decorativeText: "STACK",
};

// ----------------------------------------------------------------------------
// Finale / Brand Philosophy Section (Adapted for About/Contact)
// ----------------------------------------------------------------------------

export interface FinaleConfig {
  sectionLabel: string;
  headingMain: string;
  headingAccent: string;
  tagline: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
  image: string;
  imageAlt: string;
  decorativeText: string;
}

export const finaleConfig: FinaleConfig = {
  sectionLabel: "ABOUT ME",
  headingMain: "STUDENT &",
  headingAccent: "DEVELOPER",
  tagline: "I'm Muhammad Atif, a passionate MERN Stack Developer currently pursuing my degree at NUML University Islamabad, Pakistan. I love turning ideas into reality through clean, efficient code. Whether it's building responsive web applications or creating seamless user experiences, I'm always eager to take on new challenges and learn cutting-edge technologies.",
  features: ["Problem Solver", "Fast Learner", "Team Player", "Detail Oriented"],
  ctaText: "Get In Touch",
  ctaHref: "mailto:atifkhaan350@gmail.com",
  image: "/images/profile.jpg",
  imageAlt: "Muhammad Atif - MERN Stack Developer",
  decorativeText: "ABOUT",
};

// ----------------------------------------------------------------------------
// Footer
// ----------------------------------------------------------------------------

export interface SocialLink {
  platform: "instagram" | "twitter" | "youtube";
  href: string;
  label: string;
}

export interface FooterLinkSection {
  title: string;
  links: string[];
}

export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
}

export interface LegalLink {
  label: string;
  href: string;
}

export interface FooterConfig {
  logo: string;
  logoAccent: string;
  brandDescription: string;
  socialLinks: SocialLink[];
  linkSections: FooterLinkSection[];
  contact: ContactInfo;
  legalLinks: LegalLink[];
  copyrightText: string;
  decorativeText: string;
}

export const footerConfig: FooterConfig = {
  logo: "ATIF",
  logoAccent: ".",
  brandDescription: "MERN Stack Developer crafting modern web experiences with passion and precision.",
  socialLinks: [
    { platform: "instagram", href: "#", label: "Instagram" },
    { platform: "twitter", href: "#", label: "Twitter" },
    { platform: "youtube", href: "#", label: "YouTube" },
  ],
  linkSections: [
    { title: "Navigation", links: ["Home", "About", "Skills", "Contact"] },
    { title: "Services", links: ["Web Development", "API Design", "Database", "Consulting"] },
  ],
  contact: {
    address: "NUML University, Islamabad, Pakistan",
    phone: "+92 XXX XXXXXXX",
    email: "atifkhaan350@gmail.com",
  },
  legalLinks: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
  copyrightText: "Muhammad Atif. All rights reserved.",
  decorativeText: "CONTACT",
};

// ----------------------------------------------------------------------------
// Site Metadata
// ----------------------------------------------------------------------------

export interface SiteConfig {
  title: string;
  description: string;
  language: string;
}

export const siteConfig: SiteConfig = {
  title: "Muhammad Atif | MERN Stack Developer",
  description: "Portfolio of Muhammad Atif - MERN Stack Developer based in Islamabad, Pakistan. Specializing in MongoDB, Express.js, React, and Node.js development.",
  language: "en",
};
