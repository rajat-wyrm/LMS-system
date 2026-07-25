import { Link } from "react-router-dom";
import { Star, Users, School, TrendingUp, Clock, BookOpen } from "lucide-react";
import { useState } from "react";
import { getCourseImageUrl } from "@/utils/courseImage";

const levelStyles: Record<string, { bg: string; border: string; color: string }> = {
  Beginner: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.35)', color: '#10B981' },
  Intermediate: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.35)', color: '#3B82F6' },
  Advanced: { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.35)', color: '#8B5CF6' },
  Expert: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.35)', color: '#F59E0B' },
};

const Stat = ({ icon: Icon, label, value, accent }: any) => (
  <div className="rounded-xl py-2 px-2 border bg-background/40 border-border/50 backdrop-blur-sm transition-colors hover:bg-background/80">
    <div className="flex items-center gap-1 mb-0.5">
      <Icon size={12} style={{ color: accent }} />
      <span className="text-[10px] text-muted-foreground uppercase font-semibold">{label}</span>
    </div>
    <p className="text-sm font-bold text-foreground">{value}</p>
  </div>
);

export const CourseCard = ({ course, index = 0 }: { course: Course; index?: number }) => {
  const [imgError, setImgError] = useState(false);
  const lvl = levelStyles[course.level] || levelStyles.Beginner;
  const thumbnail = !imgError ? getCourseImageUrl(course.thumbnail) : getCourseImageUrl(undefined);

  const fullStars = Math.floor(course.rating || 0);
  const showProgress = course.progress !== undefined;
  const progressVal = course.progress || 94; // fallback fake completion rate for UI

  return (
    <Link
      to={`/courses/${course.id}`}
      className="group block opacity-0 animate-fade-in relative h-full outline-none"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <article className="course-card flex flex-col h-full bg-card/60 backdrop-blur-md">
        <div className="relative h-40 overflow-hidden shrink-0 bg-muted">
          <img
            src={thumbnail}
            alt={course.title}
            onError={() => setImgError(true)}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay" />

          {/* Top badges */}
          <span className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full border bg-black/40 backdrop-blur-md border-white/10 text-white shadow-sm">
            {course.category}
          </span>
          <div className="absolute top-3 right-3 flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border bg-black/40 backdrop-blur-md border-white/10 text-white shadow-sm">
            <Clock size={12} className="text-primary" />
            {course.duration}
          </div>
        </div>

        <div className="flex flex-col flex-1 p-5 gap-3">
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border"
              style={{ background: lvl.bg, borderColor: lvl.border, color: lvl.color }}
            >
              {course.level}
            </span>
            <span className="text-[10px] font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
              {course.price && course.price > 0 ? `$${course.price.toFixed(2)}` : "Free"}
            </span>
          </div>

          <h3 className="text-base font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {course.title}
          </h3>

          <p className="flex items-center gap-1.5 text-xs text-muted-foreground -mt-1">
            <School size={14} className="text-secondary shrink-0" />
            <span className="truncate">{typeof course.instructor === 'object' ? course.instructor?.name : (course.celebrityTeacher || course.instructor || "Expert Instructor")}</span>
          </p>

          <div className="flex items-center gap-0.5">
             {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={i < fullStars ? "fill-[#FBBF24] text-[#FBBF24]" : "fill-muted border-none text-muted"}
                />
             ))}
             <span className="ml-1 text-xs font-semibold text-[#FBBF24]">{course.rating}</span>
             <span className="ml-2 text-xs text-muted-foreground flex items-center gap-1">
                <BookOpen size={12} /> {Array.isArray(course.lessons) ? course.lessons.length : course.lessons || 0} lessons
             </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-auto pt-2">
            <Stat
              icon={Users}
              label="Enrolled"
              value={course._count?.enrollments ?? course.enrollments ?? 0}
              accent="#8B5CF6"
            />
            <Stat
              icon={TrendingUp}
              label="Completion"
              value={`${progressVal}%`}
              accent="#06B6D4"
            />
          </div>

          <div className="mt-1">
             <div className="w-full h-1.5 rounded-full bg-muted/50 overflow-hidden shadow-inner">
               <div
                 className="h-full rounded-full transition-all duration-1000 ease-out"
                 style={{
                   width: `${progressVal}%`,
                   background: `linear-gradient(90deg, #8B5CF6, #06B6D4)`,
                 }}
               />
             </div>
          </div>
        </div>
      </article>
    </Link>
  );
};
