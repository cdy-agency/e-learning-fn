import { getEnrollmentByCourseId } from "@/lib/api/student";
import { useQuery } from "@tanstack/react-query";
import { GET_COURSE_ENROLLMENT } from "@/lib/constants";

export function useEnrolledCourseById(courseId: string) {
  return useQuery({
    queryKey: [GET_COURSE_ENROLLMENT, courseId],
    queryFn: () => getEnrollmentByCourseId(courseId),
    enabled: !!courseId && courseId !== 'undefined',
  });
}