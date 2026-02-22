"use client";

import { useEffect, useState } from "react";
import { getCourseById, Course } from "@/lib/api/public";

interface UseCourseReturn {
  course: Course | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCourse(courseId?: string): UseCourseReturn {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourse = async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      setError(null);

      const result = await getCourseById(courseId);

      if (result.success) {
        setCourse(result.data);
      } else {
        throw new Error(result.message || "Failed to load course");
      }
    } catch (err) {
      console.error("useCourse error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setCourse(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]); 

  return { course, loading, error, refetch: fetchCourse };
}
