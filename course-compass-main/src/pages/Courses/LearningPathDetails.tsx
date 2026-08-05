import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, Clock, Layers, CheckCircle2, ChevronLeft, Map, PlayCircle } from "lucide-react";
import { courseApi } from "@/api/course.api";

const LearningPathDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [courses, setCourses] = useState<any[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await courseApi.getAllCourses();
        const dbCourses = res.data.data;
        
        // Map backend courses
        const mapped = dbCourses.map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          instructor: c.celebrityTeacher || c.instructor?.name || "Unknown",
          category: c.category,
          level: c.level || "Beginner",
          thumbnail: c.thumbnail || "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80",
          lessons: Array.isArray(c.lessons) ? c.lessons.length : (c.lessons || 0),
          duration: c.duration || "Self-paced",
          rating: c.rating || 0,
          enrollments: (c._count?.enrollments ?? 0).toString(),
        }));

        // Find courses that match the category ID
        const matchedCourses = mapped.filter(c => 
          c.category.toLowerCase().replace(/\s+/g, '-') === id
        );

        if (matchedCourses.length > 0) {
          setCategoryName(matchedCourses[0].category);
          setCourses(matchedCourses);
        }
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container py-20 flex justify-center min-h-[calc(100vh-80px)]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="container py-20 min-h-[calc(100vh-80px)]">
        <div className="p-16 text-center border border-border/50 rounded-2xl bg-card/30 backdrop-blur-sm max-w-2xl mx-auto">
          <Map className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">Path Not Found</h2>
          <p className="text-muted-foreground mb-6">We couldn't find any courses for this learning path.</p>
          <Link to="/learning-paths" className="btn-primary">Browse All Paths</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12 md:py-16 min-h-[calc(100vh-80px)] max-w-5xl">
      <Link to="/learning-paths" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-12 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Learning Paths
      </Link>

      <div className="mb-16">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Map className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold tracking-wider uppercase text-primary">Career Roadmap</span>
            <h1 className="font-display font-bold text-3xl md:text-5xl">{categoryName} Path</h1>
          </div>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Follow this curated step-by-step journey to master {categoryName}. Complete all {courses.length} courses to become job-ready.
        </p>

        <div className="flex gap-10 mt-10 p-8 glass-card rounded-2xl border border-border/50 bg-card/30 w-fit">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground flex items-center gap-2 mb-2"><Layers className="w-4 h-4" /> Total Courses</span>
            <span className="text-3xl font-bold">{courses.length}</span>
          </div>
          <div className="w-px bg-border/50"></div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground flex items-center gap-2 mb-2"><Clock className="w-4 h-4" /> Est. Duration</span>
            <span className="text-3xl font-bold">{courses.length * 4} Weeks</span>
          </div>
        </div>
      </div>

      {/* Roadmap Timeline */}
      <div className="relative pl-6 md:pl-0 mt-20">
        <div className="absolute left-[35px] md:left-[47px] top-6 bottom-16 w-1.5 bg-gradient-to-b from-primary/80 via-primary/30 to-transparent rounded-full hidden md:block"></div>
        <div className="absolute left-[23px] top-6 bottom-16 w-1 bg-gradient-to-b from-primary/80 via-primary/30 to-transparent rounded-full md:hidden"></div>

        <div className="space-y-16">
          {courses.map((course, index) => (
            <div key={course.id} className="relative flex flex-col md:flex-row gap-8 md:gap-14 group">
              {/* Timeline Marker */}
              <div className="absolute -left-6 md:static md:w-24 flex flex-col items-center shrink-0 z-10 pt-2">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-background border-[5px] border-primary flex items-center justify-center text-primary font-bold text-xl md:text-2xl shadow-[0_0_20px_rgba(var(--primary),0.2)] transition-transform duration-300 group-hover:scale-110 group-hover:shadow-[0_0_35px_rgba(var(--primary),0.4)]">
                  {index + 1}
                </div>
              </div>

              {/* Course Card */}
              <div className="flex-1 glass-card p-0 overflow-hidden border border-border/50 hover:border-primary/40 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 rounded-2xl">
                <div className="flex flex-col sm:flex-row h-full">
                  <div className="sm:w-[40%] relative h-56 sm:h-auto overflow-hidden">
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-background"></div>
                    <div className="absolute bottom-4 left-4 sm:hidden">
                      <span className="text-sm font-medium px-3 py-1.5 rounded-md bg-background/80 backdrop-blur-sm text-foreground">{course.level}</span>
                    </div>
                  </div>
                  
                  <div className="p-8 md:p-10 flex-1 flex flex-col justify-center">
                    <div className="hidden sm:inline-block mb-4">
                      <span className={`text-xs font-semibold tracking-wide uppercase px-3 py-1.5 rounded-full border ${
                        course.level === 'Beginner' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        course.level === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                        'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {course.level} Step
                      </span>
                    </div>
                    
                    <h3 className="text-3xl font-bold font-display mb-4 group-hover:text-primary transition-colors">{course.title}</h3>
                    <p className="text-muted-foreground text-base leading-relaxed line-clamp-3 mb-8">
                      {course.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-muted-foreground mb-8">
                      <span className="flex items-center gap-2"><PlayCircle className="w-4 h-4" /> {course.lessons} Lessons</span>
                      <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {course.duration}</span>
                      <span className="flex items-center gap-2">👨‍🏫 {course.instructor}</span>
                    </div>

                    <Link to={`/courses/${course.id}`} className="btn-primary w-fit flex items-center gap-2 py-3 px-6">
                      Go to Course <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* End of Path Marker */}
          <div className="relative flex flex-col md:flex-row gap-8 md:gap-14 pt-10">
            <div className="absolute -left-6 md:static md:w-24 flex flex-col items-center shrink-0 z-10">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-[0_0_30px_rgba(var(--primary),0.6)]">
                <CheckCircle2 className="w-7 h-7 md:w-8 md:h-8" />
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center pb-12">
              <h3 className="text-3xl font-bold font-display text-primary mb-3">Job Ready!</h3>
              <p className="text-muted-foreground text-lg max-w-lg">You've reached the end of the {categoryName} path. You're ready to tackle real-world projects and ace interviews.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LearningPathDetails;
