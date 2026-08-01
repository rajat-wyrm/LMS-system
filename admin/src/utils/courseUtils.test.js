import { describe, expect, it } from 'vitest';
import { loadCourses, normalizeCourse } from './courseUtils';

describe('course utilities', () => {
  it('does not return seeded demo courses by default', () => {
    expect(loadCourses()).toEqual([]);
  });

  it('normalizes backend course payloads without demo fallbacks', () => {
    const normalized = normalizeCourse({
      id: 'course-1',
      title: 'Live Backend Course',
      description: 'From the database',
      category: 'AI/ML',
      level: 'Intermediate',
      price: 199,
      rating: 4.8,
      status: 'approved',
      _count: { enrollments: 42, lessons: 6 },
      instructor: { name: 'Ada' },
      thumbnail: 'https://example.com/thumb.jpg',
    });

    expect(normalized.title).toBe('Live Backend Course');
    expect(normalized.students).toBe(42);
    expect(normalized.active).toBe(true);
    expect(normalized.teacher).toBe('Ada');
    expect(normalized.thumbnail).toBe('https://example.com/thumb.jpg');
  });
});
