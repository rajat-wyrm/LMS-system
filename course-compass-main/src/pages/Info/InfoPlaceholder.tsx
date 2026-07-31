import { Link } from "react-router-dom";

interface InfoPlaceholderProps {
  title: string;
  description: string;
}

const InfoPlaceholder = ({ title, description }: InfoPlaceholderProps) => {
  return (
    <section className="container py-20 md:py-28">
      <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card/60 p-8 text-center shadow-sm backdrop-blur md:p-12">
        <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Coming Soon
        </span>
        <h1 className="mt-6 font-display text-4xl font-bold md:text-5xl">{title}</h1>
        <p className="mt-4 text-base text-muted-foreground md:text-lg">{description}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/courses" className="btn-primary">
            Explore Courses
          </Link>
          <Link to="/" className="btn-secondary">
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
};

export default InfoPlaceholder;
