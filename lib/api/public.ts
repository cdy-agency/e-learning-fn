import axiosInstance from "@/lib/axios";

// Types
export interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  thumbnail?: string;
  video?: string;
  videoThumbnail?: string;
  externalUrl?: string;
  difficulty_level: "beginner" | "intermediate" | "advanced";
  status: string;
  prerequisites: string[];
  start_date?: string;
  end_date?: string;
  is_certified: boolean;
  duration_weeks?: number;
  totalStudent: number;
  category: {
    _id: string;
    name: string;
    slug: string;
    description?: string;
  };
  instructor_id?: {
    _id: string;
    profession_name?: string;
    bio?: string;
    expertise: string[];
    rating: number;
    total_students: number;
    profile_image?: string;
    user_id: {
      _id: string;
      name: string;
      email: string;
      profile_picture?: string;
    };
  };
  institution: {
    _id: string;
    name: string;
    logo?: string;
    location?: string;
    website?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  courseCount: number;
  thumbnail?: string;
}

export interface InstitutionUser {
  _id: string;
  email: string;
  name: string;
  phone: string;
}

export interface Institution {
  _id: string;
  name: string;
  bio: string;
  logo?: string;
  location?: string;
  website?: string;
  user_id: InstitutionUser;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface LandingPageData {
  featured: Course[];
  trending: Course[];
  new: Course[];
  categories: Category[];
  stats: {
    totalCourses: number;
    totalInstructors: number;
    totalStudents: number;
    totalInstitutions: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Landing page
export async function fetchLandingPageData(params?: {
  featured_limit?: number;
  trending_limit?: number;
  new_limit?: number;
  categories_limit?: number;
}): Promise<ApiResponse<LandingPageData>> {
  const { data } = await axiosInstance.get<ApiResponse<LandingPageData>>(
    "/api/public/landing",
    { params },
  );
  return data;
}

// Institutions

export async function fetchInstitutions(): Promise<{
  success: boolean;
  data: Institution[];
}> {
  const { data } = await axiosInstance.get("/api/institutions");
  return {
    success: true,
    data: data.institutions ?? [],
  };
}

// Courses by category

export async function fetchCoursesByCategory(
  categorySlug: string,
  params?: {
    page?: number;
    limit?: number;
    sort?: "trending" | "newest" | "oldest" | "price_low" | "price_high";
  },
): Promise<ApiResponse<{ courses: Course[]; totalCourses: number }>> {
  const { data } = await axiosInstance.get(
    `/api/public/courses/category/${categorySlug}`,
    { params },
  );
  return {
    success: data.success,
    data: {
      courses: data.data.courses,
      totalCourses: data.data.totalCourses,
    },
  };
}

// Course search
export async function searchCourses(
  query: string,
  limit = 20,
): Promise<ApiResponse<Course[]>> {
  const { data } = await axiosInstance.get<ApiResponse<Course[]>>(
    "/api/public/courses/search",
    { params: { q: query, limit } },
  );
  return data;
}

// Enroll
export async function enrollInCourse(
  courseId: string,
): Promise<ApiResponse<any>> {
  const { data } = await axiosInstance.post<ApiResponse<any>>(
    `/api/courses/${courseId}/enroll`,
  );
  return data;
}

// Single course
export async function getCourseById(
  courseId: string,
): Promise<ApiResponse<Course>> {
  const { data } = await axiosInstance.get<ApiResponse<Course>>(
    `/api/public/courses/${courseId}`,
  );
  return data;
}
