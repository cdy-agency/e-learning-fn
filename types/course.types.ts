export type DifficultyLevel = "beginner" | "intermediate" | "advanced";
export type CourseStatus = "draft" | "published" | "archived";

export interface CourseFormState {
  title: string;
  description: string;
  price: string;
  category: string;
  difficulty_level: DifficultyLevel;
  status: CourseStatus;
  prerequisites: string;
  start_date: string;
  end_date: string;
  is_certified: boolean;
  duration_weeks: string;
  externalUrl: string;
}

export interface ICourse {
  title: string;
  description: string;
  price: string;
  category: string;
  difficulty_level: DifficultyLevel;
  status: CourseStatus;
  thumbnail: string;
  videoThumbnail: string;
  externalUrl: string;
  video: string;
  prerequisites: string[]; 
  start_date: string;
  end_date: string;
  is_certified: boolean;
  duration_weeks: string;
}

// ==================== API RESPONSE TYPES ====================
// These match your exact API structure

export interface CategoryResponse {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  thumbnail?: string; // Optional to match existing Category type
  courseCount: number;
}

export interface InstitutionUser {
  _id: string;
  email: string;
  name: string;
  phone: string;
}

export interface InstitutionResponse {
  _id: string;
  name: string;
  bio: string;
  logo?: string;
  user_id: InstitutionUser;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface InstructorUser {
  _id: string;
  email: string;
  name: string;
}

export interface InstructorResponse {
  _id: string;
  user_id: InstructorUser | null;
  expertise: string[];
  rating: number;
  total_students: number;
  bio?: string;
  profession_name?: string;
  profile_image?: string;
}

export interface CourseCategory {
  _id: string;
  name: string;
  slug: string;
}

export interface CourseInstitution {
  _id: string;
  name: string;
  logo?: string;
}

export interface CourseInstructor {
  _id: string;
  user_id: {
    _id: string;
    name: string;
  };
  profession_name?: string;
}

export interface CourseResponse {
  _id: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  video: string;
  videoThumbnail: string;
  externalUrl: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'published' | 'archived';
  prerequisites: string[];
  start_date: string;
  end_date: string;
  is_certified: boolean;
  duration_weeks: number;
  totalStudent: number;
  category: CourseCategory;
  instructor_id: CourseInstructor | null;
  institution: CourseInstitution;
}

export interface CoursesApiResponse {
  success: boolean;
  data: CourseResponse[];
  filters: {
    is_certified: boolean;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCourses: number;
    hasNext: boolean;
    hasPrev: boolean;
    limit: number;
  };
}

export interface CategoriesApiResponse {
  success: boolean;
  data: CategoryResponse[];
}

export interface InstructorsApiResponse {
  success: boolean;
  data: InstructorResponse[];
}

export interface InstitutionsApiResponse {
  success: boolean;
  data: InstitutionResponse[];
}

// ==================== QUERY PARAMS TYPES ====================

export type SortOption = 'trending' | 'newest' | 'oldest' | 'price_low' | 'price_high';
export type PricingOption = 'free' | 'paid';

export interface CourseQueryParams {
  page: number;
  limit: number;
  sort: SortOption;
  q?: string;
  category?: string;
  difficulty?: DifficultyLevel;
  price_max?: number;
  price_min?: number;
  institution?: string;
  instructor?: string;
}