import type { Course, Category } from '@/types/course';

// ==================== PRICE FORMATTING ====================

export function formatPrice(price: number): string {
  if (price === 0) return 'Free';
  
  // Format with thousand separators
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function getAccessStatus(price: number): string {
  return price === 0 ? 'Free' : 'Paid';
}

// ==================== DURATION FORMATTING ====================

export function formatDuration(weeks?: number): string {
  if (!weeks) return '—';
  
  if (weeks < 1) {
    return `${Math.round(weeks * 7)} days`;
  }
  
  if (weeks === 1) {
    return '1 week';
  }
  
  if (weeks >= 4) {
    const months = Math.round(weeks / 4);
    return months === 1 ? '1 month' : `${months} months`;
  }
  
  return `${weeks} weeks`;
}

// ==================== DIFFICULTY FORMATTING ====================

export function formatDifficulty(difficulty: string): string {
  const map: Record<string, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  };
  
  return map[difficulty] || difficulty;
}

export function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    beginner: '#10b981', // green
    intermediate: '#f59e0b', // amber
    advanced: '#ef4444', // red
  };
  
  return colors[difficulty] || '#6b7280';
}

// ==================== CATEGORY TREE UTILITIES ====================

/**
 * Build a hierarchical tree from flat category list
 */
export function buildCategoryTree(categories: Category[]): Category[] {
  const categoryMap = new Map<string, Category>();
  const rootCategories: Category[] = [];

  // First pass: create a map of all categories
  categories.forEach((category) => {
    categoryMap.set(category._id, { ...category, children: [] });
  });

  // Second pass: build the tree
  categories.forEach((category) => {
    const node = categoryMap.get(category._id);
    if (!node) return;

    if (category.parent) {
      const parent = categoryMap.get(category.parent);
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(node);
      } else {
        // Parent not found, treat as root
        rootCategories.push(node);
      }
    } else {
      rootCategories.push(node);
    }
  });

  return rootCategories;
}

/**
 * Filter categories that have courses (including descendants)
 */
export function filterCategoriesWithCourses(
  categories: Category[]
): Category[] {
  return categories.filter((cat) => cat.courseCount > 0);
}

/**
 * Get all descendant category IDs
 */
export function getAllDescendantIds(category: Category): string[] {
  const ids: string[] = [category._id];
  
  if (category.children) {
    category.children.forEach((child) => {
      ids.push(...getAllDescendantIds(child));
    });
  }
  
  return ids;
}

// ==================== COURSE DATA MAPPING ====================

/**
 * Map API course data to UI-friendly format
 */
export function mapCourseToListItem(course: Course, categoryName?: string) {
  return {
    id: course._id,
    slug: course._id, // Use _id as slug if no slug field exists
    title: course.title,
    description: course.description,
    category: categoryName,
    thumbnailImage: course.thumbnail,
    duration: formatDuration(course.duration_weeks),
    level: formatDifficulty(course.difficulty_level),
    accessStatus: getAccessStatus(course.price),
    price: course.price,
    _count: {
      enrollments: course.totalStudent,
    },
    institution: course.institution ? {
      id: course.institution._id,
      name: course.institution.name,
      logo: course.institution.logo,
      slug: course.institution.slug || course.institution._id,
    } : undefined,
    creator: course.instructor_id ? {
      name: course.instructor_id.user_id?.name || "Unknown Instructor",
      email: course.instructor_id.user_id?.email || "No Email",
      avatar: undefined, // Not available in current API
    } : undefined,
    rating: course.instructor_id?.rating,
  };
}

// SEARCH UTILITIES
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// URL PARAMS UTILITIES
export function buildQueryParams(filters: Record<string, any>): string {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, String(v)));
      } else {
        params.append(key, String(value));
      }
    }
  });
  
  return params.toString();
}

export function parseQueryParams(searchParams: URLSearchParams): Record<string, any> {
  const params: Record<string, any> = {};
  
  searchParams.forEach((value, key) => {
    if (params[key]) {
      // Convert to array if multiple values
      if (Array.isArray(params[key])) {
        params[key].push(value);
      } else {
        params[key] = [params[key], value];
      }
    } else {
      params[key] = value;
    }
  });
  
  return params;
}