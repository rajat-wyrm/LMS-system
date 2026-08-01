import React from 'react';

/**
 * HeroHeader – displays the main headline and subtitle for the Student Dashboard.
 * Uses unified glass container with font-display and text-gradient accents.
 */
const HeroHeader = () => {
  return (
    <section className="relative overflow-hidden text-center py-12 px-6 rounded-3xl bg-card/60 border border-border/60 backdrop-blur-xl mb-8">
      <div className="aurora-bg" />
      <div className="relative z-10 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-foreground tracking-tight">
          Learn Any Course with Your <span className="text-gradient">Favourite Celebrity</span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground font-body max-w-2xl mx-auto">
          Students can instantly switch celebrity teachers anytime without losing their progress.
        </p>
      </div>
    </section>
  );
};

export default HeroHeader;
