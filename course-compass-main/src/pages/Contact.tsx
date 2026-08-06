import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Headset, HelpCircle, Mail, MessageCircle, Newspaper, ArrowRight, Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/store/AuthContext";
import { contactApi } from "@/api/contact.api";

const cards = [
  {
    icon: Headset,
    title: "Get Help",
    description:
      "Need assistance? Send us your query and our support team will get back to you.",
    action: "open-modal",
    label: "Get Help",
  },
  {
    icon: HelpCircle,
    title: "FAQs",
    description:
      "Find answers to the most commonly asked questions.",
    action: "navigate",
    to: "/faqs",
    label: "Browse FAQs",
  },
  {
    icon: Mail,
    title: "Email Us",
    description:
      "Prefer writing? Drop us an email and we'll respond within 24 hours.",
    action: "mailto",
    label: "Send Email",
  },
  {
    icon: Newspaper,
    title: "Press & Media",
    description:
      "Want to know more about UptoSkills or connect with us?",
    action: "scroll-footer",
    label: "Contact Info",
  },
];

const Contact = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (modalOpen && isAuthenticated && user) {
      setForm((prev) => ({ ...prev, name: user.name, email: user.email }));
    }
  }, [modalOpen, isAuthenticated, user]);

  const handleCardAction = (action: string, to?: string) => {
    if (action === "open-modal") {
      setModalOpen(true);
    } else if (action === "navigate" && to) {
      navigate(to);
    } else if (action === "mailto") {
      window.location.href = "mailto:support@uptoskills.com";
    } else if (action === "scroll-footer") {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Full Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email format";
    if (!form.subject.trim()) errs.subject = "Subject is required";
    if (!form.message.trim()) errs.message = "Message is required";
    else if (form.message.trim().length < 10) errs.message = "Message must be at least 10 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    if (!isAuthenticated) {
      toast.error("Please login to contact support.");
      navigate("/login");
      return;
    }

    setSending(true);
    try {
      await contactApi.send(form);
      toast.success("Your message has been sent successfully.");
      setModalOpen(false);
      setForm({ name: "", email: "", subject: "", message: "" });
      setErrors({});
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const msgLen = form.message.length;

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative py-20 md:py-28">
        <div className="absolute inset-0 gradient-mesh-bg animate-mesh" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background pointer-events-none" />
        <div className="container relative">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-secondary/40 bg-secondary/10 text-secondary text-xs font-medium mb-6 opacity-0 animate-fade-in">
              <Sparkles className="w-3.5 h-3.5" /> GET IN TOUCH
            </span>
            <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl leading-tight mb-6 opacity-0 animate-fade-in" style={{ animationDelay: "100ms" }}>
              Let's <span className="text-gradient">Talk</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
              Have questions about courses, AI mentors, enrollments, certifications, or placements? We're here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Cards Grid */}
      <section ref={sectionRef} className="container pb-20">
        <div className={`grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          {cards.map((card, i) => (
            <div
              key={i}
              onClick={() => handleCardAction(card.action, (card as any).to)}
              className="glass-card p-6 md:p-8 group cursor-pointer hover:border-primary/40 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <card.icon className="w-6 h-6" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{card.description}</p>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all duration-300">
                {card.label} <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative py-20 md:py-24">
        <div className="absolute inset-0" style={{
          background: "linear-gradient(135deg, hsl(16 100% 60% / 0.15), hsl(189 94% 43% / 0.15))",
        }} />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
        <div className="container relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`space-y-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl leading-tight">
                Start Your{" "}
                <span className="text-gradient">Learning Journey</span> Today
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl">
                Explore industry-ready courses, learn from intelligent AI mentors, complete projects, and earn certificates that help you grow.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/courses" className="btn-primary">
                  Explore Courses <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 border-2 border-primary text-primary font-medium px-6 py-3 rounded-xl transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_25px_hsl(var(--primary)/0.4)] hover:-translate-y-0.5 active:translate-y-0"
                >
                  Contact Support
                </button>
              </div>
            </div>

            <div className={`relative transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-4">
                  <div className="glass-card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Headset className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">AI Mentor</span>
                  </div>
                  <div className="glass-card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">Certificates</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="glass-card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                    </div>
                    <span className="text-sm font-medium">Coding</span>
                  </div>
                  <div className="glass-card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" /></svg>
                    </div>
                    <span className="text-sm font-medium">Dashboard</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Support</DialogTitle>
            <DialogDescription>
              Send us your query and we'll get back to you.
            </DialogDescription>
          </DialogHeader>

          {!isAuthenticated && (
            <p className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
              Login to auto-fill your details.
            </p>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="contact-name" className="text-sm font-medium mb-1.5 block">Full Name</label>
              <input
                id="contact-name"
                value={isAuthenticated ? user?.name || form.name : form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                readOnly={isAuthenticated}
                className={`w-full bg-muted rounded-xl px-4 py-2.5 text-sm border ${errors.name ? "border-destructive" : "border-border"} focus:outline-none focus:ring-2 focus:ring-primary/20 ${isAuthenticated ? "opacity-60 cursor-not-allowed" : ""}`}
                placeholder="John Doe"
              />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="contact-email" className="text-sm font-medium mb-1.5 block">Email</label>
              <input
                id="contact-email"
                type="email"
                value={isAuthenticated ? user?.email || form.email : form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                readOnly={isAuthenticated}
                className={`w-full bg-muted rounded-xl px-4 py-2.5 text-sm border ${errors.email ? "border-destructive" : "border-border"} focus:outline-none focus:ring-2 focus:ring-primary/20 ${isAuthenticated ? "opacity-60 cursor-not-allowed" : ""}`}
                placeholder="john@example.com"
              />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="contact-subject" className="text-sm font-medium mb-1.5 block">Subject</label>
              <input
                id="contact-subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className={`w-full bg-muted rounded-xl px-4 py-2.5 text-sm border ${errors.subject ? "border-destructive" : "border-border"} focus:outline-none focus:ring-2 focus:ring-primary/20`}
                placeholder="How can we help?"
              />
              {errors.subject && <p className="text-xs text-destructive mt-1">{errors.subject}</p>}
            </div>

            <div>
              <label htmlFor="contact-message" className="text-sm font-medium mb-1.5 block">Message</label>
              <textarea
                id="contact-message"
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className={`w-full bg-muted rounded-xl px-4 py-2.5 text-sm border ${errors.message ? "border-destructive" : "border-border"} focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none`}
                placeholder="Tell us how we can help..."
              />
              <div className="flex justify-between mt-1">
                {errors.message ? (
                  <p className="text-xs text-destructive">{errors.message}</p>
                ) : (
                  <span />
                )}
                <span className={`text-xs ${msgLen > 500 ? "text-destructive" : "text-muted-foreground"}`}>
                  {msgLen}/500
                </span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={sending || !form.name.trim() || !form.email.trim() || !form.subject.trim() || form.message.trim().length < 10}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-medium px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-[0_0_25px_hsl(var(--primary)/0.6)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:hover:shadow-none disabled:hover:translate-y-0"
            >
              {sending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
              ) : (
                <><Send className="w-4 h-4" /> Send Message</>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Contact;
