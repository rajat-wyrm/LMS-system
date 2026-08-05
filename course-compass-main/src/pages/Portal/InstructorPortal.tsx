import { useState, useEffect, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  PlusCircle, BookOpen, Trash2, Edit2, Loader2, CheckCircle2,
  LayoutGrid, Film, ChevronRight, AlertTriangle, X, MoreVertical,
  GraduationCap, Users, BarChart3, DollarSign
} from "lucide-react";
import { courseApi } from "@/api/course.api";
import { useAuth } from "@/store/AuthContext";
import { useToast } from "@/hooks/use-toast";

type Tab = "courses" | "curriculum";

interface CourseItem {
  id: string;
  title: string;
  category: string;
  level: string;
  thumbnail?: string;
  instructor?: { id: string; name: string };
  celebrityTeacher?: string;
  _count?: { enrollments: number };
  lessons?: any[];
}

// ─── Small confirm modal ──────────────────────────────────────────────────────
const ConfirmModal = ({
  courseName,
  onConfirm,
  onCancel,
  loading,
}: {
  courseName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="glass-card w-full max-w-sm mx-4 p-6 border border-destructive/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-destructive" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Delete Course</h3>
          <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Are you sure you want to delete <span className="text-foreground font-medium">"{courseName}"</span>?
        All lessons and enrollments will be permanently removed.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2 px-4 text-sm rounded-lg border border-border hover:bg-muted/40 transition-colors">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 py-2 px-4 text-sm rounded-lg bg-destructive text-white hover:bg-destructive/80 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const InstructorPortal = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [tab, setTab] = useState<Tab>("courses");
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revenue, setRevenue] = useState<number>(0);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<CourseItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Lesson form
  const [lessonForm, setLessonForm] = useState({
    courseId: "",
    title: "",
    content: "",
    videoUrl: "",
    order: 1,
  });
  const [lessonLoading, setLessonLoading] = useState(false);

  // ── Guard ──────────────────────────────────────────────────────────────────
  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // ── Fetch courses ──────────────────────────────────────────────────────────
  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await courseApi.getAllCourses();
      const all: CourseItem[] = res.data.data;
      // Instructors see only their own; admins see all
      const filtered =
        user.role === "admin"
          ? all
          : all; // Admin sees all by default in this view, though they can manage anything
      setCourses(filtered);
      if (!lessonForm.courseId && filtered.length > 0) {
        setLessonForm((f) => ({ ...f, courseId: filtered[0].id }));
      }

      // Fetch revenue
      try {
        if (user.role === "admin") {
          const { adminApi } = await import("@/api/admin.api");
          const statsRes = await adminApi.getStats();
          if (statsRes.success) {
            setRevenue(statsRes.data.totalRevenue || 0);
          }
        } else {
          const statsRes = await courseApi.getInstructorStats();
          if (statsRes.data.success) {
            setRevenue(statsRes.data.data.totalRevenue || 0);
          }
        }
      } catch (e) {
        console.error("Failed to fetch revenue", e);
      }
    } catch {
      toast({ title: "Failed to load courses", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user.id, user.role]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  // ── Delete course ──────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await courseApi.deleteCourse(deleteTarget.id);
      toast({ title: "Course deleted", description: `"${deleteTarget.title}" was removed.` });
      setCourses((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      toast({ title: "Delete failed", description: err?.response?.data?.error || "Something went wrong.", variant: "destructive" });
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Add lesson ─────────────────────────────────────────────────────────────
  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.courseId || !lessonForm.title || !lessonForm.content) {
      toast({ title: "Missing fields", description: "Course, title and content are required.", variant: "destructive" });
      return;
    }
    setLessonLoading(true);
    try {
      await courseApi.addLesson(lessonForm.courseId, {
        title: lessonForm.title,
        content: lessonForm.content,
        videoUrl: lessonForm.videoUrl || undefined,
        order: Number(lessonForm.order),
      });
      toast({ title: "Lesson added! ✅", description: `"${lessonForm.title}" added successfully.` });
      setLessonForm((f) => ({ ...f, title: "", content: "", videoUrl: "", order: f.order + 1 }));
      fetchCourses(); // refresh lesson counts
    } catch (err: any) {
      toast({ title: "Failed to add lesson", description: err?.response?.data?.error || "Something went wrong.", variant: "destructive" });
    } finally {
      setLessonLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  const totalEnrollments = courses.reduce((s, c) => s + (c._count?.enrollments ?? 0), 0);
  const totalLessons = courses.reduce((s, c) => s + (c.lessons?.length ?? 0), 0);

  return (
    <div className="container py-10 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-medium mb-4">
          <GraduationCap className="w-3.5 h-3.5" />
          Admin Portal
        </div>
        <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">
          Management <span className="text-gradient">Portal</span>
        </h1>
        <p className="text-muted-foreground/80">
          Manage your courses, lessons, and track student engagement.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: BookOpen,   label: "Total Courses",     val: courses.length,      color: "text-primary",   bg: "bg-primary/10"   },
          { icon: Users,      label: "Total Enrollments", val: totalEnrollments,    color: "text-secondary", bg: "bg-secondary/10" },
          { icon: Film,       label: "Total Lessons",     val: totalLessons,        color: "text-primary",   bg: "bg-primary/10"   },
          { icon: DollarSign, label: "Total Revenue",     val: `$${revenue}`,       color: "text-green-500", bg: "bg-green-500/10" },
        ].map((s) => (
          <div key={s.label} className="glass-card p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="font-display font-bold text-2xl">{s.val}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-border mb-8">
        {([
          { key: "courses",    icon: LayoutGrid, label: "All Courses" },
          { key: "curriculum", icon: BookOpen,   label: "Manage Curriculum" },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
          <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}

        {/* Create course shortcut - Admin Only */}
        {user?.role === "admin" && (
          <Link
            to="/courses/new"
            className="ml-auto flex items-center gap-2 btn-primary !py-2 !px-4 text-sm mb-1"
          >
            <PlusCircle className="w-4 h-4" /> Create Course
          </Link>
        )}
      </div>

      {/* ── Tab: All Courses ── */}
      {tab === "courses" && (
        <div className="glass-card divide-y divide-border/50">
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg">
              {user.role === "admin" ? "All Courses" : "My Courses"}
            </h2>
            <span className="text-xs text-muted-foreground">{courses.length} course{courses.length !== 1 ? "s" : ""}</span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : courses.length === 0 ? (
            <div className="py-16 text-center">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No courses yet.</p>
              {user?.role === "admin" && (
                <Link to="/courses/new" className="btn-primary mt-4 inline-flex items-center gap-2 text-sm">
                  <PlusCircle className="w-4 h-4" /> Create your first course
                </Link>
              )}
            </div>
          ) : (
            courses.map((c) => (
              <div
                key={c.id}
                className="px-6 py-4 flex items-center gap-4 hover:bg-muted/20 transition-colors group"
              >
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                  {c.thumbnail ? (
                    <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {c.category} · {c.celebrityTeacher || c.instructor?.name || "Unknown"}
                  </p>
                </div>

                {/* Badges */}
                <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                  <span className="flex items-center gap-1">
                    <Film className="w-3.5 h-3.5" /> {c.lessons?.length ?? 0} lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {c._count?.enrollments ?? 0} enrolled
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                    c.level === "Beginner"     ? "border-secondary/40 text-secondary bg-secondary/10"  :
                    c.level === "Intermediate" ? "border-primary/40 text-primary bg-primary/10"         :
                                                 "border-destructive/40 text-destructive bg-destructive/10"
                  }`}>
                    {c.level}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Link
                    to={`/portal/courses/${c.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-primary border border-primary/30 hover:bg-primary/10 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </Link>
                  <Link
                    to={`/courses/${c.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground border border-border hover:bg-muted/40 transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" /> View
                  </Link>
                  <button
                    onClick={() => setDeleteTarget(c)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Tab: Manage Curriculum ── */}
      {tab === "curriculum" && (
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Left: Add Lesson */}
          <div className="glass-card p-6 border border-border/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-secondary/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h2 className="font-display font-semibold">Add Lesson to Course</h2>
                <p className="text-xs text-muted-foreground">Create a new lesson/module</p>
              </div>
            </div>

            <form onSubmit={handleAddLesson} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Course</label>
                <select
                  value={lessonForm.courseId}
                  onChange={(e) => setLessonForm((f) => ({ ...f, courseId: e.target.value }))}
                  className="w-full bg-muted/40 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lesson Title</label>
                <input
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Introduction to Neural Networks"
                  className="w-full bg-muted/40 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lesson Content</label>
                <textarea
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm((f) => ({ ...f, content: e.target.value }))}
                  rows={3}
                  placeholder="Describe what this lesson covers..."
                  className="w-full bg-muted/40 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lesson Order</label>
                <input
                  type="number"
                  min={1}
                  value={lessonForm.order}
                  onChange={(e) => setLessonForm((f) => ({ ...f, order: Number(e.target.value) }))}
                  className="w-full bg-muted/40 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={lessonLoading || courses.length === 0}
                className="w-full btn-outline-teal flex items-center justify-center gap-2 py-3 disabled:opacity-60"
              >
                {lessonLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <><PlusCircle className="w-4 h-4" /> Add Lesson</>
                )}
              </button>
            </form>
          </div>

          {/* Right: Video Details */}
          <div className="glass-card p-6 border border-border/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
                <Film className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display font-semibold">Video Details</h2>
                <p className="text-xs text-muted-foreground">Optional video content for the lesson</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Video URL (MP4 / YouTube)</label>
                <input
                  value={lessonForm.videoUrl}
                  onChange={(e) => setLessonForm((f) => ({ ...f, videoUrl: e.target.value }))}
                  placeholder="https://example.com/video.mp4"
                  className="w-full bg-muted/40 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Video preview */}
              <div className="rounded-xl border border-border/50 bg-muted/20 h-44 flex items-center justify-center overflow-hidden relative">
                {lessonForm.videoUrl ? (
                  <div className="text-center">
                    <Film className="w-10 h-10 mx-auto text-primary/60 mb-2" />
                    <p className="text-xs text-muted-foreground truncate max-w-[200px] mx-auto">{lessonForm.videoUrl}</p>
                    <p className="text-xs text-secondary mt-1">Video URL set ✓</p>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground/40">
                    <Film className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-xs">Video preview area</p>
                  </div>
                )}
              </div>

              {/* Course lessons summary */}
              {lessonForm.courseId && (
                <div className="rounded-xl border border-border/50 bg-muted/10 p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Existing Lessons
                  </h4>
                  {(() => {
                    const selected = courses.find((c) => c.id === lessonForm.courseId);
                    const lessons = selected?.lessons ?? [];
                    return lessons.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No lessons yet. Add your first one!</p>
                    ) : (
                      <ul className="space-y-1.5 max-h-32 overflow-y-auto">
                        {lessons.map((l: any, i: number) => (
                          <li key={l.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center shrink-0 font-semibold">
                              {l.order ?? i + 1}
                            </span>
                            <span className="truncate">{l.title}</span>
                            {l.videoUrl && <Film className="w-3 h-3 text-secondary shrink-0" />}
                          </li>
                        ))}
                      </ul>
                    );
                  })()}
                </div>
              )}

              <button
                onClick={handleAddLesson}
                disabled={lessonLoading || courses.length === 0}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-60"
              >
                {lessonLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <><PlusCircle className="w-4 h-4" /> Add Lesson</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {deleteTarget && (
        <ConfirmModal
          courseName={deleteTarget.title}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default InstructorPortal;
