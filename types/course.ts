// ==================== COURSE TYPES ====================

import { CategoryResponse } from "./course.types";

export interface Course {
  _id: string;
  title: string;
  description: string;
  category: CategoryResponse;// Category ID
  price: number;
  thumbnail?: string;
  video?: string;
  videoThumbnail?: string;
  externalUrl?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'published' | 'archived';
  prerequisites: string[];
  start_date?: string;
  end_date?: string;
  is_certified: boolean;
  duration_weeks?: number;
  totalStudent: number;
  instructor_id: Instructor | null;
  institution: Institution;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface InstructorUser {
  _id: string;
  email: string;
  name: string;
}

export interface Instructor {
  _id: string;
    user_id: InstructorUser | null;
    expertise: string[];
    rating: number;
    total_students: number;
    bio?: string;
    profession_name?: string;
    profile_image?: string;
}

export interface Institution {
  _id: string;
  name: string;
  logo?: string;
  slug?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  thumbnail?: string;
  courseCount: number;
  description?: string;
  parent?: string | null;
  children?: Category[];
  _count?: {
    courses: number;
  };
}

// ==================== API QUERY PARAMS ====================

export interface CoursesQueryParams {
  page?: number;
  limit?: number;
  category?: string; // category slug
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  price_min?: number;
  price_max?: number;
  sort?: 'trending' | 'newest' | 'oldest' | 'price_low' | 'price_high';
  q?: string; // search query
  institution?: string; // institution ID
  instructor?: string; // instructor ID
}

export interface CoursesApiResponse {
  success: boolean;
  data: Course[];
  filters: {
    category?: string;
    difficulty?: string;
    price_min?: number;
    price_max?: number;
    sort?: string;
    q?: string;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCourses: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ==================== FILTER STATE ====================

export interface FilterState {
  selectedCategoryIds: string[];
  selectedDifficulties: ('beginner' | 'intermediate' | 'advanced')[];
  selectedInstitutionIds: string[];
  selectedInstructorIds: string[];
  priceRange: {
    min?: number;
    max?: number;
  };
  searchQuery: string;
  sortBy: 'trending' | 'newest' | 'oldest' | 'price_low' | 'price_high';
}

// ==================== UI STATE ====================

export interface FilterPanelState {
  isCategoryOpen: boolean;
  isDifficultyOpen: boolean;
  isPricingOpen: boolean;
  isSortOpen: boolean;
  isInstitutionsOpen: boolean;
  isInstructorsOpen: boolean;
}