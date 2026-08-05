import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Sparkles, PlusCircle, ImageOff, CheckCircle2, Loader2 } from "lucide-react";
import { courseApi } from "@/api/course.api";
import { useAuth } from "@/store/AuthContext";

// removed celebrities array
const levels = ["Beginner", "Intermediate", "Advanced"];
const categories = ["Python", "CSS", "MERN Stack", "Data Science", "AI & Machine Learning"];

const CreateCourse = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Python",
    level: "Beginner",
    thumbnail: "",
    price: 0,
  });
  const [generateAI, setGenerateAI] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  // thumbnail preview states
  const [thumbStatus, setThumbStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");

  if (user?.role !== "admin") {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
        <p className="text-muted-foreground mt-2">Only administrators can create and generate courses.</p>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError("");
    if (name === "thumbnail") {
      setThumbStatus(value.trim() ? "loading" : "idle");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) {
      setError("Title and description are required.");
      return;
    }

    setIsLoading(true);
    try {
      await courseApi.createCourse({ ...form, generateAI });
      navigate("/courses"); // Redirect to courses list upon success
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to create course. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-3xl py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-medium mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Instructor Dashboard
        </div>
        <h1 className="font-display font-bold text-3xl md:text-4xl mb-2 text-foreground">
          Create a <span className="text-gradient">New Course</span>
        </h1>
        <p className="text-muted-foreground/80">
          Share your knowledge with the world using AI celebrity avatars.
        </p>
      </div>

      <div className="glass-card p-8 border border-border/50">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">Course Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Complete Python Bootcamp"
              className="w-full bg-muted/40 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">Course Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="What will students learn in this course?"
              className="w-full bg-muted/40 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full bg-muted/40 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Difficulty Level</label>
              <select
                name="level"
                value={form.level}
                onChange={handleChange}
                className="w-full bg-muted/40 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {levels.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Price ($)</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00 for free"
                className="w-full bg-muted/40 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <p className="text-xs text-muted-foreground mt-1">Set to 0 to make this course free.</p>
            </div>
          </div>

          {/* Thumbnail URL input + live preview */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">Thumbnail Image URL</label>
            <div className="relative">
              <input
                name="thumbnail"
                value={form.thumbnail}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-muted/40 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all pr-10"
              />
              {/* Status icon */}
              {thumbStatus === "loading" && <Loader2 className="absolute right-3 top-3.5 w-4 h-4 animate-spin text-muted-foreground" />}
              {thumbStatus === "ok"      && <CheckCircle2 className="absolute right-3 top-3.5 w-4 h-4 text-secondary" />}
              {thumbStatus === "error"   && <ImageOff className="absolute right-3 top-3.5 w-4 h-4 text-destructive" />}
            </div>
            <p className="text-xs text-muted-foreground">Use a direct image link (ending in .jpg / .png / .webp). Getty, Shutterstock etc. block hotlinking — use <a href="https://unsplash.com" target="_blank" rel="noreferrer" className="text-secondary underline">Unsplash</a> or <a href="https://imgur.com" target="_blank" rel="noreferrer" className="text-secondary underline">Imgur</a> instead.</p>
          </div>

          {/* Preview */}
          <div className={`rounded-xl overflow-hidden border h-48 relative flex items-center justify-center transition-all ${
            thumbStatus === "ok"    ? "border-secondary/50 bg-muted" :
            thumbStatus === "error" ? "border-destructive/40 bg-destructive/5" :
            "border-border/50 bg-muted/30"
          }`}>
            {/* Hidden img used just to detect load/error — always mounted when URL present */}
            {form.thumbnail && (
              <img
                key={form.thumbnail}
                src={form.thumbnail}
                alt=""
                className="sr-only"
                onLoad={() => setThumbStatus("ok")}
                onError={() => setThumbStatus("error")}
              />
            )}

            {thumbStatus === "idle" && (
              <div className="text-center text-muted-foreground/50">
                <ImageOff className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-xs">Thumbnail preview will appear here</p>
              </div>
            )}
            {thumbStatus === "loading" && (
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            )}
            {thumbStatus === "ok" && (
              <img
                src={form.thumbnail}
                alt="Thumbnail preview"
                className="w-full h-full object-cover absolute inset-0"
              />
            )}
            {thumbStatus === "error" && (
              <div className="text-center px-6">
                <ImageOff className="w-10 h-10 mx-auto mb-2 text-destructive/60" />
                <p className="text-sm text-destructive font-medium">Cannot load this image</p>
                <p className="text-xs text-muted-foreground mt-1">The URL may be blocked by the image host (hotlink protection). Try an Unsplash or Imgur direct link.</p>
              </div>
            )}
          </div>

          {/* AI Generation Switch */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5 mb-6">
            <div className="flex gap-3">
              <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-foreground">Generate Course Lessons with AI</h4>
                <p className="text-xs text-muted-foreground">Automatically populate this course with detailed curriculum modules, lesson text, and video recommendations.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={generateAI}
                onChange={(e) => setGenerateAI(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-muted border border-border peer-focus:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-[#FF6B35] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-muted-foreground peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="pt-4 border-t border-border flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? "Publishing Course..." : <><PlusCircle className="w-5 h-5" /> Publish Course</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;
