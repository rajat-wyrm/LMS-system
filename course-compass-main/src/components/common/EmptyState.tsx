import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { cn } from "@/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  buttonText = "Browse Courses",
  buttonLink = "/courses",
  className,
}) => {
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-4 py-16 max-w-md mx-auto w-full",
        className
      )}
    >
      <div className="glass-card relative overflow-hidden p-8 md:p-10 w-full group shadow-[0_0_50px_rgba(6,182,212,0.05)] border-border/60 hover:border-primary/20 transition-all duration-500">
        
        {/* Glow Effects (Decorative Background Elements) */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-primary/10 blur-3xl group-hover:bg-primary/15 transition-all duration-500 pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-secondary/10 blur-3xl group-hover:bg-secondary/15 transition-all duration-500 pointer-events-none" />

        {/* Floating Neon Icon Container */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 text-primary mb-6 shadow-[0_0_20px_rgba(6,182,212,0.15)] group-hover:scale-110 transition-transform duration-500">
          {icon || <BookOpen size={48} />}
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-foreground tracking-tight font-display mb-3">
          {title}
        </h3>

        {/* Description */}
        <p className="text-muted-foreground/80 mt-2 mb-8 text-sm md:text-base leading-relaxed max-w-sm mx-auto">
          {description}
        </p>

        {/* Button with Neon Glow Shadow */}
        <button
          onClick={() => navigate(buttonLink)}
          className="btn-primary text-sm font-semibold tracking-wide w-full sm:w-auto shadow-[0_4px_20px_rgba(6,182,212,0.25)] hover:shadow-[0_8px_30px_rgba(6,182,212,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};
