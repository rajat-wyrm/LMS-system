import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Clock, Target, ArrowRight, Loader2, Layers, CheckCircle2 } from "lucide-react";
import { courseApi } from "@/api/course.api";

const LearningPaths = () => {
  const [paths, setPaths] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPaths = async () => {
      try {
        const res = await courseApi.getLearningPaths();
        setPaths(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch paths:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPaths();
  }, []);

  return (
    <div className="container py-10 min-h-[calc(100vh-80px)]">
      <div className="max-w-2xl mb-12">
        <h1 className="font-display font-bold text-3xl md:text-4xl mb-3">Learning Paths</h1>
        <p className="text-muted-foreground">Structured journeys curated by experts. Follow a path to master a role from beginner to job-ready.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : paths.length === 0 ? (
        <div className="p-16 text-center border border-border/50 rounded-2xl bg-card/30 backdrop-blur-sm">
          <p className="text-muted-foreground mb-6 text-lg">No learning paths available yet. Create some courses first!</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          {paths.map((path, idx) => {
            const isOrange = path.color === "orange";
            return (
              <div
                key={path.id}
                className="glass-card p-8 md:p-10 opacity-0 animate-fade-in hover:border-secondary transition-all flex flex-col"
                style={{ animationDelay: `${idx * 120}ms`, animationFillMode: "forwards" }}
              >
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <span className={`text-xs font-mono px-2.5 py-1 rounded-md border ${isOrange ? "bg-primary/15 text-primary border-primary/40" : "bg-secondary/15 text-secondary border-secondary/40"}`}>
                      PATH
                    </span>
                    <h2 className="font-display font-bold text-2xl mt-3">{path.title}</h2>
                  </div>
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${isOrange ? "bg-primary/15 text-primary" : "bg-secondary/15 text-secondary"}`}>
                    <Layers className="w-7 h-7" />
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-5">{path.description}</p>

                <div className="flex gap-6 text-sm text-muted-foreground mb-10">
                  <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-foreground" /> {path.duration}</span>
                  <span className="flex items-center gap-2"><Layers className="w-4 h-4 text-foreground" /> {path.courses?.length || 0} courses</span>
                </div>

                {/* Node flow */}
                <div className="space-y-2 mb-10 flex-1">
                  {path.courses?.map((c: any, i: number) => (
                    <div key={c.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                          i === 0 ? (isOrange ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-secondary-foreground border-secondary")
                                  : "bg-card border-border text-muted-foreground"
                        }`}>
                          {i === 0 ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                        </div>
                        {i < path.courses.length - 1 && (
                          <div className={`w-0.5 flex-1 my-2 ${isOrange ? "bg-gradient-to-b from-primary/60 to-border" : "bg-gradient-to-b from-secondary/60 to-border"}`} style={{ minHeight: "36px" }} />
                        )}
                      </div>
                      <Link to={`/learn/${c.id}`} className="flex-1 pb-6 group pt-1">
                        <p className="font-semibold text-base group-hover:text-primary transition-colors">{c.title}</p>
                        <p className="text-sm text-muted-foreground mt-1.5">{c.duration || "4h 30m"} • {c.level || "Beginner"}</p>
                      </Link>
                    </div>
                  ))}
                </div>

                <Link 
                  to={`/learning-paths/${path.id}`}
                  className="inline-flex justify-center items-center gap-2 py-3.5 mt-auto btn-primary w-full"
                >
                  View Full Roadmap <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LearningPaths;
