export const COURSE_PLACEHOLDER = "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80";

export const getCourseImageUrl = (thumbnail?: string | null) => {
  if (typeof thumbnail !== "string") return COURSE_PLACEHOLDER;
  const trimmed = thumbnail.trim();
  return trimmed ? trimmed : COURSE_PLACEHOLDER;
};
