import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin } from "lucide-react";

export const Footer = () => (
  <footer className="border-t border-border mt-20 py-10 bg-card/30">
    <div className="container grid md:grid-cols-4 gap-8">
      <div>
        <Link to="/">
          <img src="/logo.webp" alt="UptoSkills Logo" className="h-8 w-auto mb-3" />
        </Link>
        <p className="text-sm text-muted-foreground">Master in-demand skills with curated courses & live projects.</p>
      </div>
      <div>
        <h5 className="font-medium mb-3">Learn</h5>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li><Link to="/courses" className="hover:text-primary transition-colors">Courses</Link></li>
          <li><Link to="/learning-paths" className="hover:text-primary transition-colors">Learning Paths</Link></li>
          <li><Link to="/courses" className="hover:text-primary transition-colors">Bootcamps</Link></li>
        </ul>
      </div>
      <div>
        <h5 className="font-medium mb-3">Company</h5>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li><Link to="/about" className="hover:text-primary transition-colors">About</Link></li>
          <li><Link to="/" className="hover:text-primary transition-colors">Careers</Link></li>
          <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
        </ul>
      </div>
      <div>
        <h5 className="font-medium mb-3">Connect</h5>
        <div className="flex gap-3">
          <a href="https://github.com/rajat-wyrm/LMS-system" target="_blank" rel="noreferrer">
            <Github className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
          </a>
          <a href="https://twitter.com/SkillsUpto" target="_blank" rel="noreferrer">
            <Twitter className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
          </a>
          <a href="https://linkedin.com/company/uptoskills" target="_blank" rel="noreferrer">
            <Linkedin className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
          </a>
        </div>
      </div>
    </div>
    <div className="container mt-8 pt-6 border-t border-border text-xs text-muted-foreground text-center">
      © 2026 UpToSkills. All rights reserved.
    </div>
  </footer>
);
