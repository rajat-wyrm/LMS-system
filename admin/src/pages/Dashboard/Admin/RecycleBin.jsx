import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../../api/config';

const RecycleBin = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchDeletedCourses = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/courses/deleted');
      setCourses(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch deleted courses:', error);
      setMessage('Unable to load deleted courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedCourses();
  }, []);

  const handleRestore = async (id) => {
    try {
      await apiFetch(`/courses/${id}/restore`, {
        method: 'PATCH',
      });

      setMessage('Course restored successfully.');
      await fetchDeletedCourses();
    } catch (error) {
      console.error('Failed to restore course:', error);
      setMessage('Unable to restore course.');
    }
  };

  return (
    <div className="admin-page space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold admin-text-primary">
          Recycle Bin
        </h1>
        <p className="admin-text-secondary mt-1">
          Deleted courses can be restored from here.
        </p>
      </div>

      {message && (
        <div className="rounded-lg border border-[var(--admin-border)] p-3 admin-text-primary">
          {message}
        </div>
      )}

      {loading ? (
        <p className="admin-text-secondary">Loading deleted courses...</p>
      ) : courses.length === 0 ? (
        <div className="rounded-xl border border-[var(--admin-border)] p-8 text-center">
          <p className="admin-text-primary font-medium">
            Recycle Bin is empty.
          </p>
          <p className="admin-text-secondary mt-1">
            No deleted courses found.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="rounded-xl border border-[var(--admin-border)] p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div>
                <h2 className="font-semibold admin-text-primary">
                  {course.title}
                </h2>

                <p className="text-sm admin-text-secondary mt-1">
                  Deleted:{' '}
                  {course.deletedAt
                    ? new Date(course.deletedAt).toLocaleString()
                    : 'Unknown'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleRestore(course.id)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Restore
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecycleBin;