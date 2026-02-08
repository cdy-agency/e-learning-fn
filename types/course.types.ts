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