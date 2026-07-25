import { useState, useEffect } from "react";
import { useParams, Link, Navigate, useNavigate } from "react-router-dom";
import {
  ArrowLeft, BookOpen, Film, Loader2, PlusCircle, Trash2,
  Save, Edit2, AlertTriangle, CheckCircle2, GraduationCap,
  Users, BarChart3, X, Sparkles
} from "lucide-react";
import { courseApi } from "@/api/course.api";
import { useAuth } from "@/store/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getCourseImageUrl } from "@/utils/courseImage";

const celebrities = ["Virat Kohli", "Salman Khan", "Narendra Modi", "Sachin Tendulkar", "Hardik Pandya"];
const levels      = ["Beginner", "Intermediate", "Advanced"];
const categories  = ["Python", "CSS", "MERN Stack", "Data Science", "AI & Machine Learning"];

interface Lesson { id: string; title: string; content: string; videoUrl?: string; order: number; }
interface CourseDetail {
  id: string; title: string; description: string; category: string; level: string;
  thumbnail?: string; celebrityTeacher?: string;
  instructor?: { id: string; name: string };
  lessons: Lesson[];
  _count?: { enrollments: number };
}

// ── Confirm delete modal ───────────────────────────────────────────────────────
const ConfirmModal = ({ label, onConfirm, onCancel, loading }: {
  label: string; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
    <div className="glass-card w-full max-w-sm mx-4 p-6 border border-destructive/30">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-destructive" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Confirm Delete</h3>
          <p className="text-xs text-muted-foreground">This cannot be undone.</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Delete <span className="text-foreground font-medium">"{label}"</span>?
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2 text-sm rounded-lg border border-border hover:bg-muted/40 transition-colors">Cancel</button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 py-2 text-sm rounded-lg bg-destructive text-white hover:bg-destructive/80 flex items-center justify-center gap-2 disabled:opacity-60">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
        </button>
      </div>
    </div>
  </div>
);

// ── Main ───────────────────────────────────────────────────────────────────────
type PageTab = "details" | "lessons";

const ManageCourse = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState<PageTab>("details");
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // ── Edit form ──────────────────────────────────────────────────────────────
  const [editForm, setEditForm] = useState({
    title: "", description: "", category: "", level: "", thumbnail: "", celebrityTeacher: "",
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [thumbError, setThumbError] = useState(false);

  // ── Add lesson form ────────────────────────────────────────────────────────
  const [lessonForm, setLessonForm] = useState({ title: "", content: "", videoUrl: "", order: 1 });
  const [lessonLoading, setLessonLoading] = useState(false);

  // ── Delete lesson ──────────────────────────────────────────────────────────
  const [deleteLesson, setDeleteLesson] = useState<Lesson | null>(null);
  const [deleteLessonLoading, setDeleteLessonLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);

  // ── Guard ──────────────────────────────────────────────────────────────────
  if (user?.role !== "admin") return <Navigate to="/" replace />;

  // ── Load course ────────────────────────────────────────────────────────────
  const load = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await courseApi.getCourseById(id);
      const c: CourseDetail = res.data.data;
      setCourse(c);
      setEditForm({
        title: c.title, description: c.description, category: c.category,
        level: c.level, thumbnail: c.thumbnail ?? "", celebrityTeacher: c.celebrityTeacher ?? "",
      });
      setLessonForm((f) => ({ ...f, order: (c.lessons?.length ?? 0) + 1 }));
    } catch {
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (notFound) return <Navigate to="/portal" replace />;

  // ── Save course edits ──────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.title || !editForm.description) {
      toast({ title: "Title and description are required.", variant: "destructive" }); return;
    }
    setSaveLoading(true);
    try {
      await courseApi.updateCourse(id!, editForm);
      toast({ title: "Course updated ✅", description: "Changes saved successfully." });
      load();
    } catch (err: any) {
      toast({ title: "Update failed", description: err?.response?.data?.error || "Something went wrong.", variant: "destructive" });
    } finally {
      setSaveLoading(false);
    }
  };

  // ── Add lesson ─────────────────────────────────────────────────────────────
  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.title || !lessonForm.content) {
      toast({ title: "Title and content are required.", variant: "destructive" }); return;
    }
    setLessonLoading(true);
    try {
      await courseApi.addLesson(id!, {
        title: lessonForm.title, content: lessonForm.content,
        videoUrl: lessonForm.videoUrl || undefined, order: Number(lessonForm.order),
      });
      toast({ title: "Lesson added ✅", description: `"${lessonForm.title}" added.` });
      setLessonForm((f) => ({ title: "", content: "", videoUrl: "", order: f.order + 1 }));
      load();
    } catch (err: any) {
      toast({ title: "Failed to add lesson", description: err?.response?.data?.error || "Error.", variant: "destructive" });
    } finally {
      setLessonLoading(false);
    }
  };

  // ── Delete course ────────────────────────────────────────────────────────────
  const [deleteCourseLoading, setDeleteCourseLoading] = useState(false);
  const [showCourseDeleteModal, setShowCourseDeleteModal] = useState(false);

  const handleDeleteCourse = async () => {
    setDeleteCourseLoading(true);
    try {
      await courseApi.deleteCourse(id!);
      toast({ title: "Course deleted", description: "The course was successfully removed." });
      navigate("/portal");
    } catch (err: any) {
      toast({ title: "Delete failed", description: err?.response?.data?.error || "Error.", variant: "destructive" });
    } finally {
      setDeleteCourseLoading(false);
      setShowCourseDeleteModal(false);
    }
  };

  // ── Delete lesson ──────────────────────────────────────────────────────────
  const handleDeleteLesson = async () => {
    if (!deleteLesson) return;
    setDeleteLessonLoading(true);
    try {
      await courseApi.deleteLesson(id!, deleteLesson.id);
      toast({ title: "Lesson deleted", description: `"${deleteLesson.title}" removed.` });
      setDeleteLesson(null);
      load();
    } catch (err: any) {
      toast({ title: "Delete failed", description: err?.response?.data?.error || "Error.", variant: "destructive" });
    } finally {
      setDeleteLessonLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    setGeneratingAI(true);
    try {
      await courseApi.generateLessonsAI(id!);
      toast({ title: "Syllabus Generated ✨", description: "Lessons created by AI successfully." });
      load();
    } catch (err: any) {
      toast({ title: "Generation failed", description: err?.response?.data?.error || "Error.", variant: "destructive" });
    } finally {
      setGeneratingAI(false);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center py-32">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div>
  );

  const sortedLessons = [...(course?.lessons ?? [])].sort((a, b) => a.order - b.order);

  return (
    <div className="container py-10 max-w-5xl">
      {/* Back + header */}
      <div className="mb-8">
        <Link to="/portal" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-5 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Portal
        </Link>

        <div className="flex items-start gap-4">
          {/* Thumbnail preview */}
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0 border border-border/50">
            {editForm.thumbnail && !thumbError ? (
              <img src={getCourseImageUrl(editForm.thumbnail)} alt={course?.title} className="w-full h-full object-cover"
                onError={() => setThumbError(true)} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                <BookOpen className="w-7 h-7 text-primary" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-medium mb-2">
              <GraduationCap className="w-3 h-3" /> Manage Course
            </div>
            <h1 className="font-display font-bold text-2xl md:text-3xl truncate">{course?.title}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {course?.category} · {course?.level} · {course?._count?.enrollments ?? 0} students enrolled
            </p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border mb-8">
        {([
          { key: "details", icon: Edit2,    label: "Edit Details"    },
          { key: "lessons", icon: BookOpen, label: `Lessons (${sortedLessons.length})` },
        ] as const).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* ── Edit Details Tab ── */}
      {tab === "details" && (
        <form onSubmit={handleSave} className="glass-card p-8 border border-border/50 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Course Title</label>
              <input value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Complete Python Bootcamp"
                className="w-full bg-muted/40 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</label>
              <textarea value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                rows={4} placeholder="What will students learn?"
                className="w-full bg-muted/40 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
              <select value={editForm.category} onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full bg-muted/40 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Difficulty Level</label>
              <select value={editForm.level} onChange={(e) => setEditForm((f) => ({ ...f, level: e.target.value }))}
                className="w-full bg-muted/40 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                {levels.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Celebrity Teacher</label>
              <select value={editForm.celebrityTeacher} onChange={(e) => setEditForm((f) => ({ ...f, celebrityTeacher: e.target.value }))}
                className="w-full bg-muted/40 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                <option value="">None</option>
                {celebrities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Thumbnail URL</label>
              <input value={editForm.thumbnail} onChange={(e) => { setEditForm((f) => ({ ...f, thumbnail: e.target.value })); setThumbError(false); }}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-muted/40 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
            </div>

            {/* Thumbnail live preview */}
            {editForm.thumbnail && (
              <div className="md:col-span-2 rounded-xl overflow-hidden border border-border/50 h-40 bg-muted/20 relative">
                {!thumbError ? (
                  <img src={getCourseImageUrl(editForm.thumbnail)} alt="preview" className="w-full h-full object-cover"
                    onError={() => setThumbError(true)} />
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-destructive gap-2">
                    <AlertTriangle className="w-4 h-4" /> Cannot load this image URL
                  </div>
                )}
              </div>
            )}
          </div>

                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setShowCourseDeleteModal(true)} className="btn-outline px-4 py-2 text-sm text-destructive border-destructive/30 hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4 mr-2 inline" /> Delete Course
                  </button>
                  <button type="button" onClick={() => navigate("/portal")} className="btn-outline px-4 py-2 text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={saveLoading} className="btn-primary px-6 py-2 text-sm flex items-center gap-2">
                    {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                </div>
        </form>
      )}

      {/* ── Lessons Tab ── */}
      {tab === "lessons" && (
        <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">

          {/* Existing lessons list */}
          <div className="glass-card divide-y divide-border/50">
            <div className="px-6 py-4 flex items-center justify-between">
              <h2 className="font-display font-semibold">Course Lessons</h2>
              <span className="text-xs text-muted-foreground">{sortedLessons.length} lesson{sortedLessons.length !== 1 ? "s" : ""}</span>
            </div>

            {sortedLessons.length === 0 ? (
              <div className="py-16 text-center px-6">
                <Film className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm mb-4">No lessons yet.</p>
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={generatingAI}
                  className="btn-primary inline-flex items-center gap-2 mb-2"
                >
                  {generatingAI ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-white fill-white/20" />
                  )}
                  Generate Syllabus with AI
                </button>
                <p className="text-xs text-muted-foreground mt-2">Or use the form on the right to manually build your course outline.</p>
              </div>
            ) : (
              sortedLessons.map((l) => (
                <div key={l.id} className="px-6 py-4 flex items-start gap-4 hover:bg-muted/10 transition-colors group">
                  {/* Order badge */}
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {l.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm">{l.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{l.content}</p>
                    {l.videoUrl && (
                      <a href={l.videoUrl} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-secondary hover:text-primary mt-1 transition-colors">
                        <Film className="w-3 h-3" /> Video attached
                      </a>
                    )}
                  </div>
                  <button onClick={() => setDeleteLesson(l)}
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-destructive/20 text-destructive transition-all shrink-0 mt-0.5">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add lesson form */}
          <div className="glass-card p-6 border border-border/50 lg:sticky lg:top-20">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-secondary/20 flex items-center justify-center">
                <PlusCircle className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-sm">Add New Lesson</h2>
                <p className="text-xs text-muted-foreground">Append a lesson to this course</p>
              </div>
            </div>

            <form onSubmit={handleAddLesson} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lesson Title *</label>
                <input value={lessonForm.title} onChange={(e) => setLessonForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Introduction to Variables"
                  className="w-full bg-muted/40 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Content / Summary *</label>
                <textarea value={lessonForm.content} onChange={(e) => setLessonForm((f) => ({ ...f, content: e.target.value }))}
                  rows={3} placeholder="What does this lesson cover?"
                  className="w-full bg-muted/40 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order</label>
                  <input type="number" min={1} value={lessonForm.order}
                    onChange={(e) => setLessonForm((f) => ({ ...f, order: Number(e.target.value) }))}
                    className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Duration</label>
                  <input placeholder="15 Mins" disabled
                    className="w-full bg-muted/20 border border-border/50 rounded-lg px-3 py-2.5 text-sm text-muted-foreground cursor-not-allowed" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Video URL (optional)</label>
                <input value={lessonForm.videoUrl} onChange={(e) => setLessonForm((f) => ({ ...f, videoUrl: e.target.value }))}
                  placeholder="https://example.com/video.mp4"
                  className="w-full bg-muted/40 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>

              <button type="submit" disabled={lessonLoading}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3 disabled:opacity-60">
                {lessonLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><PlusCircle className="w-4 h-4" /> Add Lesson</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete lesson modal */}
      {deleteLesson && (
        <ConfirmModal label={deleteLesson.title} onConfirm={handleDeleteLesson}
          onCancel={() => setDeleteLesson(null)} loading={deleteLessonLoading} />
      )}

      {/* Delete course modal */}
      {showCourseDeleteModal && (
        <ConfirmModal label={course.title} onConfirm={handleDeleteCourse}
          onCancel={() => setShowCourseDeleteModal(false)} loading={deleteCourseLoading} />
      )}
    </div>
  );
};

export default ManageCourse;
