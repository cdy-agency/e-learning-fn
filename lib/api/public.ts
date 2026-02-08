'use client'
import axios from 'axios';
import { toast } from 'react-toastify';

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Show toast notifications for success or error
const showToast = (message: string, type: "success" | "error") => {
  if (type === "success") {
    toast.success(message);
  } else {
    toast.error(message);
  }
};

export interface TrendingCoursesResponse {
  success: boolean;
  data: Course[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCourses: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  thumbnail?: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  status: 'draft' | 'published' | 'archived';
  prerequisites: string[];
  start_date?: Date;
  end_date?: Date;
  is_certified: boolean;
  duration_weeks?: number;
  totalStudent: number;
  videoThumbnail: string;
  video: string;
  instructor_id: {
    _id: string;
    profession_name?: string;
    expertise: string[];
    rating: number;
    user_id: {
      _id: string;
      name: string;
      email: string;
    };
  } | null;
  institution: {
    _id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  _id: string;
  name: string;
  description: string;
  icon: string;
  courseCount: number;
}

export interface SearchCoursesResponse {
  success: boolean;
  data: Course[];
  searchQuery: {
    q?: string;
    category?: string;
    difficulty?: string;
    price_min?: number;
    price_max?: number;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCourses: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Get trending courses (courses with most students)
 */
export async function fetchTrendingCourses(limit = 10, page = 1): Promise<TrendingCoursesResponse> {
  try {
    const response = await axios.get(`${API_URL}/api/public/courses/trending`, {
      params: { limit, page }
    });
    return response.data;
  } catch (error) {
    showToast('Failed to fetch trending courses', 'error');
    throw error;
  }
}

/**
 * Get courses by category
 */
export async function fetchCoursesByCategory(
  category: string, 
  limit = 10, 
  page = 1, 
  sortBy = 'totalStudent'
): Promise<TrendingCoursesResponse> {
  try {
    const response = await axios.get(`${API_URL}/api/public/courses/category/${encodeURIComponent(category)}`, {
      params: { limit, page, sortBy }
    });
    return response.data;
  } catch (error) {
    showToast('Failed to fetch courses by category', 'error');
    throw error;
  }
}

/**
 * Get all available categories
 */
export async function fetchCategories(): Promise<{ success: boolean; data: Category[] }> {
  try {
    const response = await axios.get(`${API_URL}/api/public/courses/categories`);
    return response.data;
  } catch (error) {
    showToast('Failed to fetch categories', 'error');
    throw error;
  }
}

/**
 * Search courses
 */
export async function searchCourses(params: {
  q?: string;
  category?: string;
  difficulty?: string;
  price_min?: number;
  price_max?: number;
  limit?: number;
  page?: number;
}): Promise<SearchCoursesResponse> {
  try {
    const response = await axios.get(`${API_URL}/api/public/courses/search`, {
      params
    });
    return response.data;
  } catch (error) {
    showToast('Failed to search courses', 'error');
    throw error;
  }
}

/**
 * Enroll in a course (requires authentication)
 */
export async function enrollInCourse(courseId: string): Promise<{ success: boolean; message: string; data: any }> {
  try {
    const response = await axios.post(`${API_URL}/api/public/courses/${courseId}/enroll`, {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    showToast('Successfully enrolled in course!', 'success');
    return response.data;
  } catch (error) {
    showToast('Failed to enroll in course', 'error');
    throw error;
  }
}

/**
 * Get course by ID
 */
export async function fetchCourseById(courseId: string): Promise<Course> {
  try {
    const response = await axios.get(`${API_URL}/api/courses/${courseId}`);
    return response.data;
  } catch (error) {
    showToast('Failed to fetch course details', 'error');
    throw error;
  }
}
