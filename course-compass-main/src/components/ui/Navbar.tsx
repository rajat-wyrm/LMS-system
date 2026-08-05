import { NavLink, useNavigate } from "react-router-dom";
import { GraduationCap, Menu, X, LayoutGrid, Shield } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/store/AuthContext";

const links = [
  { to: "/", label: "Home" },
  { to: "/courses", label: "Courses" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/certificates", label: "Certificates" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isStaff = user?.role === "admin";
  const hiddenForStaff = ["/certificates", "/dashboard", "/learning-paths"];
  const filteredLinks = links.filter(l => !(isStaff && hiddenForStaff.includes(l.to)));

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <NavLink to="/" className="flex items-center gap-2">
          <img src="/logo.webp" alt="UptoSkills Logo" className="h-10 w-auto" />
        </NavLink>

        <nav className="hidden md:flex items-center gap-8">
          {filteredLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          {/* Portal link — admins only */}
          {user?.role === "admin" && (
            <NavLink
              to="/portal"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive ? "text-primary" : "text-primary/70 hover:text-primary"
                }`
              }
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Portal
            </NavLink>
          )}
          
          {/* Admin Portal link */}
          {user?.role === "admin" && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive ? "text-primary" : "text-destructive/80 hover:text-destructive"
                }`
              }
            >
              <Shield className="w-3.5 h-3.5" /> Admin
            </NavLink>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-4">
              <NavLink to="/profile" className="text-sm font-medium hover:text-primary transition-colors">
                Hi, {user.name.split(" ")[0]}
              </NavLink>
              <button onClick={handleLogout} className="text-sm text-muted-foreground hover:text-foreground">Logout</button>
            </div>
          ) : (
            <>
              <NavLink to="/login" className="text-sm font-medium hover:text-primary transition-colors">
                Sign In
              </NavLink>
              <NavLink to="/register" className="btn-primary !py-2 !px-4 text-sm">
                Get Started
              </NavLink>
            </>
          )}
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <div className="container py-4 flex flex-col gap-3">
            {filteredLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm py-2 ${isActive ? "text-primary" : "text-muted-foreground"}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            {user?.role === "admin" && (
              <NavLink
                to="/portal"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm py-2 flex items-center gap-1.5 ${isActive ? "text-primary" : "text-primary/70"}`
                }
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Portal
              </NavLink>
            )}
            {user?.role === "admin" && (
              <NavLink
                to="/admin"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `text-sm py-2 flex items-center gap-1.5 ${isActive ? "text-primary" : "text-destructive/80"}`
                }
              >
                <Shield className="w-3.5 h-3.5" /> Admin
              </NavLink>
            )}
            <div className="border-t border-border my-2" />
            {isAuthenticated && user ? (
              <>
                <NavLink to="/profile" onClick={() => setOpen(false)} className="text-sm py-2 font-medium hover:text-primary transition-colors">
                  Hi, {user.name}
                </NavLink>
                <button 
                  onClick={() => { handleLogout(); setOpen(false); }}
                  className="text-sm py-2 text-left text-muted-foreground hover:text-foreground"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={() => setOpen(false)} className="text-sm py-2 text-muted-foreground hover:text-primary">
                  Sign In
                </NavLink>
                <NavLink to="/register" onClick={() => setOpen(false)} className="text-sm py-2 text-primary font-medium">
                  Get Started
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

