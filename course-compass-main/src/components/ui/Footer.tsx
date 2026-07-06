import { Github, Twitter, Linkedin } from "lucide-react";

export const Footer = () => (
  <footer className="border-t border-border mt-20 py-10 bg-card/30">
    <div className="container grid md:grid-cols-4 gap-8">
      <div>
        {/* <img src="/logo.webp" alt="UptoSkills Logo" className="h-8 w-auto mb-3" /> */}
        <p className="text-sm text-muted-foreground">Master in-demand skills with curated courses & live projects.</p>
      </div>
      <div>
        <h5 className="font-medium mb-3">Learn</h5>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>Courses</li><li>Learning Paths</li><li>Bootcamps</li>
        </ul>
      </div>
      <div>
        <h5 className="font-medium mb-3">Company</h5>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>About</li><li>Careers</li><li>Contact</li>
        </ul>
      </div>
      <div>
        <h5 className="font-medium mb-3">Connect</h5>
        <div className="flex gap-3">
          <Github className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer" />
          <Twitter className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer" />
          <Linkedin className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer" />
        </div>
      </div>
    </div>
    <div className="container mt-8 pt-6 border-t border-border text-xs text-muted-foreground text-center">
      © 2026 UpToSkills. All rights reserved.
    </div>
  </footer>
);
