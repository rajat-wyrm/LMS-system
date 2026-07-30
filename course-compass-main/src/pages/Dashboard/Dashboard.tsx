import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { Award, BookOpen, Clock, Flame, ChevronLeft, ChevronRight, Trophy, Star, Zap, Target, Medal, Loader2, Layers, CheckCircle2, ArrowRight } from "lucide-react";
import { CourseCard } from "@/components/common/CourseCard";
import { useAuth } from "@/store/AuthContext";
import { courseApi } from "@/api/course.api";
import { getCourseImageUrl } from "@/utils/courseImage";

const Dashboard = () => {
  const { user } = useAuth();
  const carouselRef = useRef<HTMLDivElement>(null);

  const [inProgress, setInProgress] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enrollRes, coursesRes] = await Promise.all([
          courseApi.getMyEnrollments().catch(() => ({ data: { data: [] } })),
          courseApi.getAllCourses().catch(() => ({ data: { data: [] } }))
        ]);
        
        const enrollments = enrollRes.data.data;
        const allCourses = coursesRes.data.data;
        
        const enrolledCourseIds = new Set(enrollments.map((e: any) => e.courseId));
        
        setInProgress(enrollments.map((e: any) => ({
          ...e.course,
          progress: e.progress || 0,
          lessons: e.course.lessons?.length || 0,
          completedLessons: e.completedLessons || [],
          certificateApproved: e.certificateApproved,
          thumbnail: getCourseImageUrl(e.course.thumbnail)
        })));
        

        const unEnrolled = allCourses
          .filter((c: any) => !enrolledCourseIds.has(c.id))
          .map((c: any) => ({
            ...c,
            thumbnail: getCourseImageUrl(c.thumbnail),
            level: c.level,
            rating: c.rating,
            enrollments: c._count?.enrollments || 0,
            duration: c.duration,
            lessons: c.lessons?.length || 0,
            instructor: c.instructor?.name || "",
          }));
          
        setRecommended(unEnrolled.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchData();
    }
  }, [user]);

  const scroll = (dir: number) => {
    carouselRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  const stats = [
    { icon: BookOpen, label: "Courses Enrolled", val: inProgress.length, color: "text-primary" },
    { icon: CheckCircle2, label: "Completed Courses", val: inProgress.filter((course) => course.progress === 100).length, color: "text-secondary" },
    { icon: Award, label: "Certificates", val: inProgress.filter((course) => course.progress === 100 && course.certificateApproved).length, color: "text-primary" },
    { icon: Layers, label: "Lessons Completed", val: inProgress.reduce((total, course) => total + (course.completedLessons?.length || 0), 0), color: "text-secondary" },
  ];


  return (
    <div className="container py-10">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-16 h-16 rounded-full border-2 border-primary bg-muted flex items-center justify-center overflow-hidden">
          {user?.name ? (
            <span className="text-2xl font-bold text-primary">{user.name.charAt(0).toUpperCase()}</span>
          ) : (
            <img src={"https://images.unsplash.com/photo-1633332755192-727a05c4013d"} alt="Avatar" className="w-full h-full object-cover" />
          )}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="font-display font-bold text-2xl md:text-3xl">{user?.name || "Guest"} 👋</h1>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {stats.map((s, i) => (
              <div key={i} className="glass-card p-5 opacity-0 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <s.icon className={`w-6 h-6 ${s.color} mb-3`} />
                <p className="font-display font-bold text-3xl">{s.val}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>

      {/* In progress carousel */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-2xl">Continue Learning</h2>
          <div className="flex gap-2">
            <button onClick={() => scroll(-1)} className="w-9 h-9 rounded-lg border border-border hover:border-primary hover:text-primary flex items-center justify-center transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => scroll(1)} className="w-9 h-9 rounded-lg border border-border hover:border-primary hover:text-primary flex items-center justify-center transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div ref={carouselRef} className="flex gap-5 overflow-x-auto pb-4 snap-x scroll-smooth -mx-4 px-4">
          {inProgress.map((c) => (
            <div key={c.id} className="course-card min-w-[300px] snap-start relative flex flex-col">
              <Link to={`/learn/${c.id}`} className="block aspect-video relative">
                <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
              </Link>
              <div className="p-5 flex-1 flex flex-col">
                <Link to={`/learn/${c.id}`}>
                  <h4 className="font-display font-semibold mb-3 line-clamp-1 hover:text-primary transition-colors">{c.title}</h4>
                </Link>
                <div className="mt-auto">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>{c.progress}% complete</span>
                    <span>{c.lessons} lessons</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-700" style={{ width: `${c.progress}%` }} />
                  </div>
                  {c.progress === 100 && (
                    <Link to={`/certificate/${c.id}`} className="mt-4 block w-full text-center py-2 text-sm font-semibold bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                      View Certificate
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* Recommended */}
      <section>
        <h2 className="font-display font-bold text-2xl mb-6">Recommended for You</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommended.map((c, i) => <CourseCard key={c.id} course={c} index={i} />)}
        </div>
      </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;

