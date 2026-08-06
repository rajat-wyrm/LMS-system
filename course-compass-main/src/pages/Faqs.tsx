import { Sparkles } from "lucide-react";

const faqs = [
  {
    q: "What is UptoSkills?",
    a: "UptoSkills is an AI-powered learning platform that offers industry-ready courses, projects, and certifications to help you build future-ready skills.",
  },
  {
    q: "How do AI Mentors work?",
    a: "Our AI mentors are intelligent assistants inspired by experts and iconic personalities. They guide you through lessons, answer questions, and make learning interactive.",
  },
  {
    q: "Are the courses beginner-friendly?",
    a: "Yes! We have courses for all levels — beginner, intermediate, and advanced. Each course includes structured lessons, quizzes, and hands-on projects.",
  },
  {
    q: "Do I get a certificate after completing a course?",
    a: "Absolutely! You earn a certificate upon successful completion of any course. Certificates can be viewed and downloaded from your dashboard.",
  },
  {
    q: "Can I access courses on mobile?",
    a: "Yes, the platform is fully responsive and works on all devices — desktop, tablet, and mobile.",
  },
  {
    q: "How do I enroll in a course?",
    a: "Simply browse our course catalog, click on a course you're interested in, and hit the Enroll button. You can start learning immediately.",
  },
  {
    q: "Is there any placement assistance?",
    a: "We provide career guidance, skill assessments, and certificates that boost your resume. Our courses are designed to prepare you for internships and job placements.",
  },
  {
    q: "How can I contact support?",
    a: "You can reach us through the Contact page. If you're logged in, you can send a message directly from the Get Help section.",
  },
];

const Faqs = () => (
  <div className="overflow-hidden">
    <section className="relative py-20 md:py-28">
      <div className="absolute inset-0 gradient-mesh-bg animate-mesh" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background pointer-events-none" />
      <div className="container relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-secondary/40 bg-secondary/10 text-secondary text-xs font-medium mb-6 opacity-0 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" /> FAQs
          </span>
          <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl leading-tight mb-6 opacity-0 animate-fade-in" style={{ animationDelay: "100ms" }}>
            Frequently Asked <span className="text-gradient">Questions</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
            Everything you need to know about UptoSkills. Can't find what you're looking for? Reach out to our support team.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="glass-card p-6 opacity-0 animate-fade-in hover:border-primary/30 transition-all duration-300"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <h3 className="font-display font-semibold text-base mb-2">{faq.q}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default Faqs;
