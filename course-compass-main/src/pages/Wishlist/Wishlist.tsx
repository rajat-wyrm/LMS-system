import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { courseApi } from "@/api/course.api";

const WISHLIST_KEY = "lms_wishlist";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  price?: number;
}

const getWishlistIds = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
  } catch {
    return [];
  }
};

export default function Wishlist() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWishlist = async () => {
      const ids = getWishlistIds();
      if (ids.length === 0) {
        setLoading(false);
        return;
      }
      try {
        const results = await Promise.all(
          ids.map((id) => courseApi.getCourseById(id).then((res) => res.data.data))
        );
        setCourses(results);
      } catch (err) {
        console.error("Failed to load wishlist courses", err);
      } finally {
        setLoading(false);
      }
    };
    loadWishlist();
  }, []);

  if (loading) {
    return <div className="container py-16 text-center text-muted-foreground">Loading your wishlist...</div>;
  }

  if (courses.length === 0) {
    return (
      <div className="container py-16 text-center">
        <ShoppingBag className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
        <p className="text-muted-foreground mb-6">Browse courses and add them to your wishlist to see them here.</p>
        <Link to="/courses" className="btn-primary">
          Browse Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Link
            key={course.id}
            to={`/courses/${course.id}`}
            className="rounded-xl border border-border p-4 hover:border-primary transition-colors"
          >
            {course.thumbnail && (
              <img src={course.thumbnail} alt={course.title} className="w-full h-36 object-cover rounded-lg mb-3" />
            )}
            <h3 className="font-semibold mb-1">{course.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
            {course.price !== undefined && (
              <p className="mt-2 font-medium text-primary">${course.price}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}