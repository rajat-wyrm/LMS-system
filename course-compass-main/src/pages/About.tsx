import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bot, Target, Code2, Trophy, ArrowRight, Sparkles } from "lucide-react";

const images = [
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
];

const features = [
  {
    icon: Bot,
    title: "AI Mentors",
    description:
      "Learn from intelligent AI mentors inspired by experts and iconic personalities, making every lesson more engaging and interactive.",
  },
  {
    icon: Target,
    title: "Personalized Learning",
    description:
      "Follow customized learning paths with structured lessons, quizzes, assignments, and real-time progress tracking.",
  },
  {
    icon: Code2,
    title: "Hands-on Projects",
    description:
      "Gain practical experience through real-world projects, coding challenges, and skill-based assignments that prepare you for industry.",
  },
  {
    icon: Trophy,
    title: "Career Growth",
    description:
      "Earn certificates, showcase your achievements, and build the skills needed for internships, placements, and long-term career success.",
  },
];

const About = () => {
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

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative py-20 md:py-28">
        <div className="absolute inset-0 gradient-mesh-bg animate-mesh" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background pointer-events-none" />
        <div className="container relative">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-secondary/40 bg-secondary/10 text-secondary text-xs font-medium mb-6 opacity-0 animate-fade-in">
              <Sparkles className="w-3.5 h-3.5" /> ABOUT UPTOSKILLS
            </span>
            <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl leading-tight mb-6 opacity-0 animate-fade-in" style={{ animationDelay: "100ms" }}>
              Learn Smarter. Grow Faster.{" "}
              <span className="text-gradient">Succeed with UptoSkills.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
              At <span className="text-foreground font-semibold">UptoSkills</span>, we transform online learning through intelligent AI
              mentors, practical courses, real-world projects, quizzes, assignments, and certifications—helping learners build
              future-ready skills with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* About Content */}
      <section ref={sectionRef} className="container pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column */}
          <div className={`space-y-8 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-medium">
                WHY CHOOSE US
              </span>
              <h2 className="font-display font-bold text-3xl md:text-4xl leading-tight">
                Empowering Your{" "}
                <span className="text-gradient">Learning Journey</span>
              </h2>
              <p className="text-muted-foreground">
                We combine cutting-edge AI technology with expert-crafted curriculum to deliver a learning
                experience that adapts to your unique goals and pace.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="glass-card p-5 group hover:border-primary/40 hover:-translate-y-1 transition-all duration-300"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-semibold text-base mb-1.5">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Image Collage */}
          <div className={`relative transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <Link
              to="/"
              className="absolute -top-4 right-4 z-10 inline-flex items-center gap-2 bg-primary text-primary-foreground font-medium px-5 py-2.5 rounded-xl text-sm shadow-lg hover:shadow-[0_0_25px_hsl(var(--primary)/0.6)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
            >
              Learn More <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-3 pt-8">
                <div className="rounded-2xl overflow-hidden shadow-lg group">
                  <img
                    src={images[0]}
                    alt="Students learning"
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg group">
                  <img
                    src={images[1]}
                    alt="AI and technology"
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg group">
                  <img
                    src={images[2]}
                    alt="Online education"
                    className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="rounded-2xl overflow-hidden shadow-lg group">
                  <img
                    src={images[3]}
                    alt="Team collaboration"
                    className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg group">
                  <img
                    src={images[4]}
                    alt="Programming"
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
