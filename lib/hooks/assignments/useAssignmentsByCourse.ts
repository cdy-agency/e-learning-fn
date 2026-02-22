import { useQuery } from '@tanstack/react-query';
import { GET_ASSIGNMENTS_BY_COURSE } from '@/lib/constants';
import { getCourseAssignments } from '@/lib/api/student/courses.api';

export function useAssignmentsByCourse(courseId: string | undefined) {
  return useQuery({
    queryKey: [GET_ASSIGNMENTS_BY_COURSE, courseId],
    queryFn: () => getCourseAssignments(courseId!),
    enabled: !!courseId,
  });
}

