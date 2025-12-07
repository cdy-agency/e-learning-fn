export interface Course {
  _id: string;
  instructor_id: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  category?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  students: number
  prerequisites: string[];
  start_date: Date;
  end_date: Date;
  is_certified: boolean;
  duration_weeks: number;
  status?: 'draft' | 'published' | 'archived';
}

export interface Module {
  _id: string;
  course_id: string;
  title: string;
  lessons: Lesson[];
  description: string;
  order_index: number;
  is_published: boolean;
  duration_hours: number;
  isLocked?: boolean; // Add this
  requiresPayment?: boolean; // Add this
  lessonCount?: number; // Add this
}

// Add this new interface
export interface CourseModulesResponse {
  modules: Module[];
  userAccess: {
    isFullyUnlocked: boolean;
    moduleAccessLimit: number;
    totalModules: number;
    unlockedModules: number;
  };
}

export interface Lesson {
  _id: string;
  module_id: string;
  title: string;
  content: string;
  content_type: 'text' | 'video' | 'audio';
  lessonStatus: 'mode'| 'pending' | 'approved'
  video_url?: string;
  duration_minutes: number;
  order_index: number;
  is_free_preview: boolean;
}

export interface Resource {
  _id: string;
  lesson_id: string;
  title: string;
  file_url: string;
  resource_type: 'pdf' | 'doc' | 'video' | 'audio' | 'other';
  download_count: number;
  file_size: number;
}

export interface InstitutionRef {
  _id?: string | null;
  name?: string;
}

export interface InstructorRef {
  _id?: string | null;
  rating?: number;
  user_id?: { name?: string } | null;
}



export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCourses: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface FetchResponse {
  success: boolean;
  data: Course[];
  category?: string;
  pagination: Pagination;
}
