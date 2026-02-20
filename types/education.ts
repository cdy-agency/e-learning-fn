export interface IInstitution {
  _id: string;
  name: string;
  bio: string;
  location: string;
}

export interface ICourse {
  _id: string;
  institution: string;
  instructor_id: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  difficulty_level: string;
  status: string;
  prerequisites: string[];
  start_date: string;
  end_date: string;
  is_certified: boolean;
  duration_weeks: number;
  totalStudent: number;
}

export interface IEnrollment {
  _id: string;
  user_id: string;
  course_id: { 
    _id: string;
  instructor_id: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  students: number
  prerequisites: string[];
  start_date: Date;
  end_date: Date;
  is_certified: boolean;
  duration_weeks: number;
  };
  totalLessons: number;
  completedLessons: number;
  lastAccessed: string;
  enrolled_at: string;
  status: string;
  completion_date?: Date;
  progress_percentage: number;
}