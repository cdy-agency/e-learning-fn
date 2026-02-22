import { useQuery } from '@tanstack/react-query';
import { getCourseAnnouncements } from '@/lib/api/student/courses.api';
import { GET_COURSE_ANNOUNCEMENTS } from '@/lib/constants';

export function useCourseAnnouncements(courseId: string | undefined) {
  return useQuery({
    queryKey: [GET_COURSE_ANNOUNCEMENTS, courseId],
    queryFn: async () => {
      const result = await getCourseAnnouncements(courseId!);
      return result || [];
    },
    enabled: !!courseId,
  });
}

