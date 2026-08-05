import { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, PlayCircle, FileText, CheckCircle, Loader2, ChevronRight, Lock, Award, Check, Clock } from "lucide-react";
import { courseApi } from "@/api/course.api";
import { useAuth } from "@/store/AuthContext";
import { toast } from "sonner";

export default function CoursePlayer() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [course, setCourse] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  
  // To check if they are actually enrolled
  const [isEnrolled, setIsEnrolled] = useState(false);

  // Mentor Selection State
  const [mentorChangeOpen, setMentorChangeOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState("");
  const [updatingMentor, setUpdatingMentor] = useState(false);
  const celebrities = ["Virat Kohli", "Salman Khan", "Narendra Modi", "Sachin Tendulkar", "Hardik Pandya", "Virtual Mentor"];

  const fetchEnrollment = async () => {
    try {
      const res = await courseApi.getEnrollmentByCourse(id!);
      setEnrollment(res.data.data);
      return res.data.data;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch course details
        const courseRes = await courseApi.getCourseById(id!);
        const c = courseRes.data.data;
        c.lessons = [...(c.lessons || [])].sort((a: any, b: any) => a.order - b.order);
        setCourse(c);

        // Fetch enrollments to verify access
        if (user?.role === "admin") {
          setIsEnrolled(true);
        } else {
          const enr = await fetchEnrollment();
          setIsEnrolled(!!enr);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) fetchData();
  }, [id, user]);

  const handleMarkComplete = async () => {
    if (!enrollment || !activeLesson) return;
    
    try {
      setIsMarkingComplete(true);
      await courseApi.completeLesson(id!, activeLesson.id);
      
      // Re-fetch enrollment to get updated progress and completed lessons
      await fetchEnrollment();
      
      toast.success("Lesson marked as complete!");
      
      // Auto-advance to next lesson if available
      if (activeLessonIndex < course.lessons.length - 1) {
        setActiveLessonIndex(prev => prev + 1);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to mark lesson as complete");
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const handleMentorChange = async () => {
    if (!selectedMentor) return;
    try {
      setUpdatingMentor(true);
      await courseApi.updateEnrollmentMentor(id!, selectedMentor);
      setEnrollment((prev: any) => prev ? { ...prev, mentor: selectedMentor } : prev);
      toast.success(`Mentor changed to ${selectedMentor}!`);
      setMentorChangeOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to change mentor");
    } finally {
      setUpdatingMentor(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) return <Navigate to="/dashboard" replace />;

  if (!isEnrolled) {
    return (
      <div className="container py-20 text-center">
        <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h2 className="font-display font-bold text-2xl mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-6">You must be enrolled to view this course's content.</p>
        <Link to={`/courses/${id}`} className="btn-primary inline-flex items-center gap-2">
          View Course Details
        </Link>
      </div>
    );
  }

  const activeLesson = course.lessons[activeLessonIndex];
  const completedLessonIds = new Set(enrollment?.completedLessons?.map((l: any) => l.id) || []);
  const isCurrentCompleted = completedLessonIds.has(activeLesson?.id);
  const isFullyCompleted = enrollment?.progress === 100;
  
  // Helper to figure out how to render the video URL
  const renderVideo = (url?: string) => {
    if (!url) return null;
    
    if (url.toLowerCase().endsWith(".mp4") || url.toLowerCase().endsWith(".webm") || url.toLowerCase().endsWith(".ogg")) {
      return (
        <video controls className="w-full h-full bg-black" src={url}>
          Your browser does not support the video tag.
        </video>
      );
    }
    
    let embedUrl = url;
    if (url.includes("youtube.com/watch?v=")) {
      embedUrl = url.replace("watch?v=", "embed/");
    } else if (url.includes("youtu.be/")) {
      embedUrl = url.replace("youtu.be/", "youtube.com/embed/");
    }
    
    return (
      <iframe 
        className="w-full h-full bg-black"
        src={embedUrl} 
        title="Video Player" 
        frameBorder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowFullScreen 
      />
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background border-t border-border">
      {/* Top Bar */}
      <div className="h-16 border-b border-border flex items-center px-6 shrink-0 bg-muted/10">
        <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors mr-4">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="h-6 w-px bg-border mx-2 mr-4" />
        <h1 className="font-display font-semibold truncate flex-1">{course.title}</h1>
        
        {enrollment && (
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium">
              Progress: <span className="text-primary">{enrollment.progress}%</span>
            </div>
            {isFullyCompleted && enrollment.certificateApproved && (
              <Link to={`/certificate/${id}`} className="btn-primary !py-1.5 !px-3 text-sm flex items-center gap-2">
                <Award className="w-4 h-4" /> View Certificate
              </Link>
            )}
            {isFullyCompleted && !enrollment.certificateApproved && (
              <div className="bg-muted/50 border border-border text-muted-foreground px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" /> Pending Approval
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden h-[calc(100vh-130px)]">
        {/* Left: Player Area */}
        <div className="flex-1 overflow-y-auto flex flex-col bg-black/5 relative pb-20">
          {/* Video Container */}
          <div className="w-full aspect-video bg-black flex items-center justify-center relative shrink-0">
            {activeLesson?.videoUrl ? (
              renderVideo(activeLesson.videoUrl)
            ) : (
              <div className="text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No video available for this lesson.</p>
                <p className="text-xs mt-1 opacity-70">Please read the content below.</p>
              </div>
            )}
          </div>
          
          {/* Lesson Content */}
          <div className="p-6 lg:p-10 max-w-4xl mx-auto w-full flex-1 mb-20">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display font-bold text-2xl md:text-3xl mb-2 flex items-center gap-3">
                  {activeLesson?.order}. {activeLesson?.title || "Welcome"}
                  {isCurrentCompleted && (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500/20 text-green-500" title="Completed">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </h2>
              </div>
            </div>
            
            <div className="prose prose-invert max-w-none text-muted-foreground">
              {activeLesson?.content ? (
                <div className="whitespace-pre-wrap">{activeLesson.content}</div>
              ) : (
                <p className="italic opacity-50">No additional notes provided for this lesson.</p>
              )}
            </div>
          </div>
          
          {/* Action Footer */}
          {enrollment && activeLesson && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-border flex justify-between items-center shadow-lg">
              <div className="text-sm text-muted-foreground">
                Lesson {activeLessonIndex + 1} of {course.lessons.length}
              </div>
              
              <button 
                onClick={handleMarkComplete}
                disabled={isCurrentCompleted || isMarkingComplete}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${
                  isCurrentCompleted 
                    ? "bg-green-500/10 text-green-500 border border-green-500/20 cursor-default" 
                    : "btn-primary shadow-md hover:shadow-lg"
                }`}
              >
                {isMarkingComplete ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isCurrentCompleted ? (
                  <Check className="w-4 h-4" />
                ) : null}
                {isCurrentCompleted ? "Completed" : "Mark as Complete"}
              </button>
            </div>
          )}
        </div>

        {/* Right: Sidebar Syllabus */}
        <div className="w-full lg:w-[350px] border-l border-border bg-muted/5 flex flex-col shrink-0 h-full">
          {enrollment && (
            <div className="p-5 border-b border-border shrink-0 bg-primary/5">
              <h4 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">Your Celebrity Mentor</h4>
              <div className="flex items-center gap-3">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(enrollment.mentor || "Virtual Mentor")}&background=8B5CF6&color=fff&bold=true`}
                  alt={enrollment.mentor || "Virtual Mentor"}
                  className="w-10 h-10 rounded-full object-cover border-2 border-secondary"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-foreground">{enrollment.mentor || "Virtual Mentor"}</p>
                  <p className="text-xs text-muted-foreground">Personalized Guide</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedMentor(enrollment.mentor || "Virtual Mentor");
                    setMentorChangeOpen(true);
                  }}
                  className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Change
                </button>
              </div>
            </div>
          )}

          <div className="p-5 border-b border-border shrink-0">
            <h3 className="font-display font-bold text-lg mb-1">Course Content</h3>
            <p className="text-xs text-muted-foreground">{course.lessons.length} lessons</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {course.lessons.length === 0 ? (
              <div className="text-center p-6 text-sm text-muted-foreground">
                No lessons available yet.
              </div>
            ) : (
              course.lessons.map((lesson: any, i: number) => {
                const isActive = activeLessonIndex === i;
                const isCompleted = completedLessonIds.has(lesson.id);
                
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLessonIndex(i)}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                      isActive ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/40 border border-transparent"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : isActive ? (
                        <PlayCircle className="w-4 h-4 text-primary" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-muted-foreground/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium leading-tight mb-1 ${
                        isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        {lesson.order}. {lesson.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {lesson.videoUrl ? "Video" : "Article"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
      
      {/* Mentor Change Modal */}
      {mentorChangeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-background border border-border rounded-xl shadow-2xl max-w-md w-full overflow-hidden p-6 relative">
            <h3 className="text-lg font-bold font-display mb-2 text-foreground">Change Celebrity Mentor</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select the celebrity you want to guide you through this course.
            </p>
            
            <div className="py-4">
              <label className="text-sm font-medium text-foreground/80 mb-2 block">Choose Mentor</label>
              <select
                value={selectedMentor}
                onChange={(e) => setSelectedMentor(e.target.value)}
                className="w-full bg-muted/30 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-foreground"
              >
                <option value="">Select a Mentor</option>
                {celebrities.map((c) => (
                  <option key={c} value={c} className="bg-background text-foreground">{c}</option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setMentorChangeOpen(false)}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-lg transition-colors"
                disabled={updatingMentor}
              >
                Cancel
              </button>
              <button
                onClick={handleMentorChange}
                disabled={!selectedMentor || updatingMentor}
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/95 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2"
              >
                {updatingMentor && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
