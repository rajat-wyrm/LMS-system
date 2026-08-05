import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { courseApi } from "@/api/course.api";
import { ChevronLeft, Download, Award, Loader2 } from "lucide-react";

export const Certificate = () => {
  const { courseId } = useParams();
  const [enrollment, setEnrollment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnrollment = async () => {
      try {
        setIsLoading(true);
        if (!courseId) return;
        const res = await courseApi.getEnrollmentByCourse(courseId);
        if (res.data.success) {
          setEnrollment(res.data.data);
        } else {
          setError("Certificate not found or you have not completed this course yet.");
        }
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load certificate");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEnrollment();
  }, [courseId]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !enrollment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <div className="glass-card p-10 max-w-md w-full">
          <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Certificate Unavailable</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link to="/dashboard" className="btn-primary w-full justify-center flex">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { user, course, updatedAt, id } = enrollment;
  const completionDate = new Date(updatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-muted/30 py-10 px-4 print:p-0 print:bg-white flex flex-col items-center justify-center">
      
      {/* Controls (Hidden on Print) */}
      <div className="w-full max-w-[1000px] flex justify-between items-center mb-6 print:hidden">
        <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <button 
          onClick={handlePrint}
          className="btn-primary flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Download PDF
        </button>
      </div>

      {/* Certificate Container */}
      <div className="relative w-full max-w-[1000px] aspect-[1.414] bg-white text-slate-900 shadow-2xl print:shadow-none overflow-hidden print:w-full print:max-w-none print:h-screen print:aspect-auto">
        
        {/* Decorative Border Elements */}
        <div className="absolute inset-4 border-2 border-slate-200 print:inset-8"></div>
        <div className="absolute inset-5 border border-slate-300 print:inset-9"></div>
        
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full print:-mr-10 print:-mt-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-tr-full print:-ml-10 print:-mb-10"></div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center z-10">
          
          <div className="mb-8 flex items-center justify-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Award className="w-8 h-8 text-primary" />
            </div>
          </div>

          <h1 className="font-display font-bold text-4xl md:text-6xl tracking-tight mb-4 uppercase text-slate-800" style={{ letterSpacing: "0.1em" }}>
            Certificate of Completion
          </h1>
          
          <p className="text-slate-500 text-lg md:text-xl italic mb-8 mt-2">
            This is to certify that
          </p>

          <h2 className="font-display text-4xl md:text-5xl font-semibold text-primary mb-8 pb-4 border-b-2 border-slate-200 inline-block px-12">
            {user?.name || "Student Name"}
          </h2>

          <p className="text-slate-500 text-lg md:text-xl italic mb-4">
            has successfully completed the course
          </p>

          <h3 className="font-display text-2xl md:text-3xl font-bold text-slate-700 mb-12 max-w-2xl leading-tight">
            {course?.title || "Course Name"}
          </h3>

          <div className="flex justify-between w-full max-w-3xl mt-auto px-8 pt-8">
            <div className="flex flex-col items-center w-48">
              <span className="text-slate-700 font-semibold border-b border-slate-400 pb-2 mb-2 w-full text-center">
                {completionDate}
              </span>
              <span className="text-slate-500 text-sm uppercase tracking-wider">Date</span>
            </div>

            <div className="flex flex-col items-center">
              {/* Fake Seal */}
              <div className="w-24 h-24 border-4 border-amber-400 rounded-full flex items-center justify-center bg-amber-50 shadow-inner rotate-12 opacity-90">
                <div className="w-20 h-20 border-2 border-amber-300 rounded-full flex items-center justify-center">
                  <span className="text-amber-500 font-bold text-xs uppercase text-center leading-tight">
                    Official<br/>Certified
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center w-48">
              <span className="text-slate-700 font-signature text-xl border-b border-slate-400 pb-2 mb-2 w-full text-center" style={{ fontFamily: "cursive" }}>
                {course?.instructor?.name || "Instructor Name"}
              </span>
              <span className="text-slate-500 text-sm uppercase tracking-wider">Instructor</span>
            </div>
          </div>

          {/* Certificate ID */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-400 text-xs font-mono">
            Certificate ID: {id}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Certificate;
