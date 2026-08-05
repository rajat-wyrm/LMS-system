import { Link, useNavigate } from "react-router-dom";
import { Search, Sparkles, ArrowRight, Play, TrendingUp, Award, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { CourseCard } from "@/components/common/CourseCard";
import { courseApi } from "@/api/course.api";
import { Loader2 } from "lucide-react";

const Home = () => {
  const [query, setQuery] = useState("");
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    courseApi.getAllCourses()
      .then(res => {
        setFeatured(res.data.data.slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/courses?q=${encodeURIComponent(query)}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh-bg animate-mesh" />
        <div className="aurora-bg" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background pointer-events-none" />

        <div className="container relative pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-secondary/40 bg-secondary/10 text-secondary text-xs font-medium mb-6 opacity-0 animate-fade-in">
              <Sparkles className="w-3.5 h-3.5" /> UpToSkills LMS
            </span>
            <h1 className="font-display font-bold text-4xl md:text-6xl lg:text-7xl leading-tight mb-6 opacity-0 animate-fade-in" style={{ animationDelay: "100ms" }}>
              Discover Courses That <span className="text-gradient">Shape Your Future</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
              Hand-picked AI, Data Science & Engineering courses from world-class instructors. Learn by building real-world projects.
            </p>

            <form onSubmit={onSearch} className="relative max-w-2xl mx-auto mb-8 opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}>
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for AI, Python, Data Science…"
                className="w-full bg-card/80 backdrop-blur border border-border rounded-xl pl-14 pr-32 py-4 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <button type="submit" className="btn-primary !py-2 !px-5 text-sm">
                  Search
                </button>
              </div>
            </form>

            <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-in" style={{ animationDelay: "400ms" }}>
              <Link to="/courses" className="btn-primary">
                Explore Courses <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Floating Motivational Words */}
          <div className="hidden lg:flex absolute top-32 -left-12 flex-col items-center animate-float opacity-90">
            <div className="glass-card px-6 py-4 rotate-[-6deg] bg-secondary/10 border-secondary/20 shadow-[0_0_30px_hsl(var(--secondary)/0.15)] text-secondary transition-transform duration-500 hover:scale-110">
              <Sparkles className="w-5 h-5 mb-2 inline-block animate-pulse" />
              <p className="font-display font-bold text-lg leading-tight tracking-wide">Unlock Your<br/>Potential</p>
            </div>
          </div>
          
          <div className="hidden lg:flex absolute top-48 -right-8 flex-col items-center animate-float-delay opacity-90">
            <div className="glass-card px-6 py-4 rotate-[6deg] bg-primary/10 border-primary/20 shadow-[0_0_30px_hsl(var(--primary)/0.15)] text-primary transition-transform duration-500 hover:scale-110">
              <Award className="w-5 h-5 mb-2 inline-block animate-pulse" />
              <p className="font-display font-bold text-lg leading-tight tracking-wide">Master New<br/>Skills Today</p>
            </div>
          </div>
          
          <div className="hidden lg:flex absolute top-20 right-24 flex-col items-center animate-float opacity-70" style={{ animationDelay: "1.5s" }}>
            <div className="glass-card px-5 py-3 rotate-[12deg] bg-purple-500/10 border-purple-500/20 shadow-[0_0_20px_rgba(139,92,246,0.15)] text-purple-400 transition-transform duration-500 hover:scale-110">
               <TrendingUp className="w-4 h-4 mb-1 inline-block animate-pulse" />
               <p className="font-display font-bold text-sm tracking-widest uppercase">Build The Future</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="container relative pb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: TrendingUp, label: "500+ Courses", val: "Curated" },
              { icon: Users, label: "120K+ Learners", val: "Worldwide" },
              { icon: Award, label: "98% Completion", val: "Top rated" },
              { icon: Sparkles, label: "Live Projects", val: "Real world" },
            ].map((s, i) => (
              <div key={i} className="glass-card p-5 opacity-0 animate-fade-in" style={{ animationDelay: `${500 + i * 100}ms` }}>
                <s.icon className="w-6 h-6 text-primary mb-2" />
                <p className="font-display font-bold">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.val}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="container py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-2">Trending Courses</h2>
            <p className="text-muted-foreground">Most enrolled this week</p>
          </div>
          <Link to="/courses" className="text-secondary text-sm font-medium hover:text-primary">View all →</Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((c, i) => <CourseCard key={c.id} course={c} index={i} />)}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;

