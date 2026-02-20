import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DashboardParams, getStudentDashboard } from '@/lib/api/student';
import { GET_STUDENT_DASHBOARD } from '@/lib/constants';


export function useStudentDashboard(params?: DashboardParams) {
  return useQuery({
    queryKey: [GET_STUDENT_DASHBOARD, params],
    queryFn: () => getStudentDashboard(params), 
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 2 * 60 * 1000,
  });
}

export function useInvalidateDashboard() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: [GET_STUDENT_DASHBOARD] });
}