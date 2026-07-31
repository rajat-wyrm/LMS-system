import { Link } from "react-router-dom";
import { Github, Linkedin, Twitter } from "lucide-react";

const learnLinks = [
  { label: "Courses", to: "/courses" },
  { label: "Learning Paths", to: "/learning-paths" },
  { label: "Bootcamps", to: "/bootcamps" },
];

const companyLinks = [
  { label: "About", to: "/about" },
  { label: "Careers", to: "/careers" },
  { label: "Contact", to: "/contact" },
];

const socialLinks = [
  { label: "GitHub", href: "https://github.com/", icon: Github },
  { label: "Twitter", href: "https://x.com/", icon: Twitter },
  { label: "LinkedIn", href: "https://www.linkedin.com/", icon: Linkedin },
];

export const Footer = () => (
  <footer className="border-t border-border mt-20 py-10 bg-card/30">
    <div className="container grid md:grid-cols-4 gap-8">
      <div>
        <Link to="/" className="inline-block">
          <img src="/logo.webp" alt="UptoSkills Logo" className="h-8 w-auto mb-3" />
        </Link>
        <p className="text-sm text-muted-foreground">Master in-demand skills with curated courses & live projects.</p>
      </div>
      <div>
        <h5 className="font-medium mb-3">Learn</h5>
        <ul className="text-sm text-muted-foreground space-y-2">
          {learnLinks.map((link) => (
            <li key={link.to}>
              <Link to={link.to} className="transition-colors hover:text-primary">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h5 className="font-medium mb-3">Company</h5>
        <ul className="text-sm text-muted-foreground space-y-2">
          {companyLinks.map((link) => (
            <li key={link.to}>
              <Link to={link.to} className="transition-colors hover:text-primary">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h5 className="font-medium mb-3">Connect</h5>
        <div className="flex gap-3">
          {socialLinks.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              <Icon className="w-5 h-5" />
            </a>
          ))}
        </div>
      </div>
    </div>
    <div className="container mt-8 pt-6 border-t border-border text-xs text-muted-foreground text-center">
      © 2026 UpToSkills. All rights reserved.
    </div>
  </footer>
);
