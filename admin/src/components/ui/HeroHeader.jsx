import React from 'react';

/**
 * HeroHeader – displays the main headline and subtitle for the Student Dashboard.
 * Uses dark navy background, centered text and the premium gradient accent.
 */
const HeroHeader = () => {
  return (
    <section className="text-center py-12">
      <h1 className="text-4xl font-bold text-white tracking-wider">
        Learn Any Course with Your Favourite Celebrity
      </h1>
      <p className="mt-4 text-lg text-[#9CA3AF] max-w-2xl mx-auto">
        Students can instantly switch celebrity teachers anytime without losing their progress.
      </p>
    </section>
  );
};

export default HeroHeader;
