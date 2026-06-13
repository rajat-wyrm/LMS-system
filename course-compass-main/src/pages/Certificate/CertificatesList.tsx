import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Award, Calendar, ExternalLink, Loader2, ArrowRight } from "lucide-react";
import { courseApi } from "@/api/course.api";
import { useAuth } from "@/store/AuthContext";

export const CertificatesList = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await courseApi.getMyEnrollments();
        const enrollments = res.data?.data || [];
        // Filter for completed and approved courses
        const completed = enrollments.filter((e: any) => e.progress === 100 && e.certificateApproved);
        setCertificates(completed);
      } catch (error) {
        console.error("Failed to fetch certificates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchCertificates();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="container py-20 flex justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
          <Award className="w-8 h-8" />
        </div>
        <h1 className="font-display font-bold text-4xl mb-4">My Certificates</h1>
        <p className="text-muted-foreground text-lg">
          View, download, and share the certificates you've earned from completing courses on UptoSkills.
        </p>
      </div>

      {!user ? (
        <div className="text-center py-20 glass-card">
          <p className="text-xl font-medium mb-4">Please log in to view your certificates.</p>
          <Link to="/login" className="btn-primary inline-flex">Log In</Link>
        </div>
      ) : certificates.length === 0 ? (
        <div className="text-center py-20 glass-card">
          <Award className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
          <h3 className="text-2xl font-semibold mb-2">No certificates yet</h3>
          <p className="text-muted-foreground mb-8">
            Complete your enrolled courses to earn certificates and show off your new skills!
          </p>
          <Link to="/courses" className="btn-primary inline-flex items-center gap-2">
            Explore Courses <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div key={cert.id} className="glass-card flex flex-col overflow-hidden group hover:border-primary/50 transition-colors">
              {/* Preview Image (Placeholder styling for aesthetic) */}
              <div className="aspect-[1.4] bg-muted relative overflow-hidden flex flex-col items-center justify-center p-6 text-center border-b border-border">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary via-background to-background"></div>
                <Award className="w-12 h-12 text-primary mb-3 drop-shadow-sm" />
                <h4 className="font-display font-bold text-lg leading-tight z-10 text-foreground">{cert.course.title}</h4>
                <p className="text-xs text-muted-foreground mt-2 z-10 font-mono">ID: {cert.id.substring(0, 8)}...</p>
              </div>
              
              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-semibold text-lg mb-2 line-clamp-1" title={cert.course.title}>
                  {cert.course.title}
                </h3>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Issued: {new Date(cert.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="mt-auto">
                  <Link 
                    to={`/certificate/${cert.courseId}`} 
                    className="w-full inline-flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground py-2.5 rounded-lg font-medium transition-colors"
                  >
                    View Certificate <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificatesList;
