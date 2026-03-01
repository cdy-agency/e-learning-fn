"use client";

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Course, Module, Lesson, Resource } from '../types/course';
import { CourseProgress, UserProgress } from '../types/progress';
import * as courseApi from '../api/courses';
import * as progressApi from '../api/progress';
import { useAuth } from '@/lib/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface CourseState {
  courses: Course[];
  currentCourse: Course | null;
  modules: Module[];
  lessons: Record<string, Lesson[]>;
  resources: Record<string, Resource[]>;
  progress: Record<string, CourseProgress>;
  lessonProgress: Record<string, UserProgress>;
  isLoading: boolean;
  error: string | null;
}

interface CourseContextType extends CourseState {
  loadCourses: (id: string) => Promise<void>;
  loadInstructorCourses: () => Promise<void>;
  createCourse: (data: {
    title: string;
    description: string;
    price: string;
    category: string;
    difficulty_level: string;
    status: string;
    prerequisites: string;
    start_date?: string;
    end_date?: string;
    is_certified: boolean;
    duration_weeks: string;
    thumbnail?: File | null;
  }) => Promise<void>;
  loadCourse: (courseId: string) => Promise<void>;
  loadModules: (courseId: string) => Promise<void>;
  createModule: (courseId: string,title:string,description:string,duration_hours:number) => Promise<void>;
  createLesson: (moduleId: string, title: string, content: string, content_type: "text", duration_minutes: number) => Promise<void>;
  loadLessons: (moduleId: string, studentId: string) => Promise<void>;
  loadResources: (lessonId: string) => Promise<void>;
  updateProgress: (lessonId: string, data: Partial<UserProgress>) => Promise<void>;
  updateCourse: (courseId: string, payload: Partial<Course>) => Promise<Course | null>;
  deleteCourse: (courseId: string) => Promise<boolean>;
  publishCourse: (courseId: string) => Promise<Course | null>;
}

const initialState: CourseState = {
  courses: [],
  currentCourse: null,
  modules: [],
  lessons: {},
  resources: {},
  progress: {},
  lessonProgress: {},
  isLoading: false,
  error: null,
};

type CourseAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_COURSES'; payload: Course[] }
  | { type: 'SET_CURRENT_COURSE'; payload: Course }
  | { type: 'SET_MODULES'; payload: Module[] }
  | { type: 'SET_LESSONS'; payload: { moduleId: string; lessons: Lesson[] } }
  | { type: 'SET_RESOURCES'; payload: { lessonId: string; resources: Resource[] } }
  | { type: 'SET_COURSE_PROGRESS'; payload: { courseId: string; progress: CourseProgress } }
  | { type: 'SET_LESSON_PROGRESS'; payload: { lessonId: string; progress: UserProgress } };

const courseReducer = (state: CourseState, action: CourseAction): CourseState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_COURSES':
      return { ...state, courses: action.payload, isLoading: false };
    case 'SET_CURRENT_COURSE':
      return { ...state, currentCourse: action.payload, isLoading: false };
    case 'SET_MODULES':
      return { ...state, modules: action.payload, isLoading: false };
    case 'SET_LESSONS':
      return {
        ...state,
        lessons: {
          ...state.lessons,
          [action.payload.moduleId]: action.payload.lessons,
        },
        isLoading: false,
      };
    case 'SET_RESOURCES':
      return {
        ...state,
        resources: {
          ...state.resources,
          [action.payload.lessonId]: action.payload.resources,
        },
        isLoading: false,
      };
    case 'SET_COURSE_PROGRESS':
      return {
        ...state,
        progress: {
          ...state.progress,
          [action.payload.courseId]: action.payload.progress,
        },
      };
    case 'SET_LESSON_PROGRESS':
      return {
        ...state,
        lessonProgress: {
          ...state.lessonProgress,
          [action.payload.lessonId]: action.payload.progress,
        },
      };
    default:
      return state;
  }
};

export const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(courseReducer, initialState);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const loadCourses = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const courses = await courseApi.fetchCourses(id);
      dispatch({ type: 'SET_COURSES', payload: courses });
      // Load progress for each course
      // if (user) {
        await Promise.all(
          courses.map(async (course) => {
            const progress = await progressApi.fetchCourseProgress(course._id);
            dispatch({
              type: 'SET_COURSE_PROGRESS',
              payload: { courseId: course._id, progress },
            });
          })
        );
      // }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load courses';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const loadInstructorCourses = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const courses = await courseApi.fetchInstructorCourses();
      dispatch({ type: 'SET_COURSES', payload: courses });
      await Promise.all(
        courses.map(async (course) => {
          const progress = await progressApi.fetchCourseProgress(course._id);
          dispatch({
            type: 'SET_COURSE_PROGRESS',
            payload: { courseId: course._id, progress },
          });
        })
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load instructor courses';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const loadCourse = async (courseId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const course = await courseApi.fetchCourseById(courseId);
      dispatch({ type: 'SET_CURRENT_COURSE', payload: course });

      // if (user) {
        const progress = await progressApi.fetchCourseProgress(courseId);
        dispatch({
          type: 'SET_COURSE_PROGRESS',
          payload: { courseId, progress },
        });
      // }
    } catch (error) {

      const message = error instanceof Error ? error.message : 'Failed to load course';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const createCourse = async (data: {
    title: string;
    description: string;
    price: string;
    category: string;
    difficulty_level: string;
    status: string;
    prerequisites: string;
    start_date?: string;
    end_date?: string;
    is_certified: boolean;
    duration_weeks: string;
    thumbnail?: File | null;
  }) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newCourse = await courseApi.createCourse(data);
      dispatch({ type: 'SET_COURSES', payload: [...state.courses, newCourse] });
      toast({
        title: "Success",
        description: "Course created successfully",
        variant: "default",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create course';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  
  const createModule = async (courseId: string,title:string,description:string,duration_hours:number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
       await courseApi.createModule(courseId,title,description,duration_hours);
       const modules = await courseApi.fetchModulesByCourseId(courseId)
      dispatch({ type: 'SET_MODULES', payload: modules });
      toast({
        title: "success",
        description: 'module added',
        variant: "default",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create module modules';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };
  
  const createLesson = async (
  moduleId: string,
  title: string,
  content: string,
  content_type: "text",
  duration_minutes: number
) => {
  try {
    dispatch({ type: "SET_LOADING", payload: true });

    await courseApi.createLesson(
      moduleId,
      title,
      content,
      content_type,
      duration_minutes
    );

    const lessons = await courseApi.fetchLessonsByModuleId(moduleId);

    dispatch({
      type: "SET_LESSONS",
      payload: { moduleId, lessons },
    });

    // Refetch modules so ModuleList shows the new lesson (it reads from state.modules)
    const module = state.modules.find((m) => m._id === moduleId);
    if (module?.course_id) {
      const modules = await courseApi.fetchModulesByCourseId(module.course_id);
      dispatch({ type: "SET_MODULES", payload: modules });
    }

    toast({
      title: "Success",
      description: "Lesson added",
      variant: "default",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create lesson";

    dispatch({ type: "SET_ERROR", payload: message });

    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  } finally {
    dispatch({ type: "SET_LOADING", payload: false });
  }
};

  const loadModules = async (courseId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const modules = await courseApi.fetchModulesByCourseId(courseId);
      dispatch({ type: 'SET_MODULES', payload: modules });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load modules';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };
  const loadLessons = async (moduleId: string, studentId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const lessons = await courseApi.fetchLessonsByModuleId(moduleId);
      dispatch({ type: 'SET_LESSONS', payload: { moduleId, lessons } });

      if (studentId) {
        await Promise.all(
          lessons.map(async (lesson) => {
            const progress = await progressApi.fetchUserProgress(studentId);
            const lessonProgress = progress.find(p => {
              const lessonId = typeof p.lesson_id === 'string' ? p.lesson_id : p.lesson_id._id;
              return lessonId === lesson._id;
            });
                 
            if (lessonProgress) {
              dispatch({
                type: 'SET_LESSON_PROGRESS',
                payload: { lessonId: lesson._id, progress: lessonProgress },
              });
            }
          })
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load lessons';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };
  const loadResources = async (lessonId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const resources = await courseApi.fetchResourcesByLessonId(lessonId);
      dispatch({ type: 'SET_RESOURCES', payload: { lessonId, resources } });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load resources';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  

  const updateProgress = async (lessonId: string, data: Partial<UserProgress>) => {
    try {
      if (!user) throw new Error('User not authenticated');
      const progress = await progressApi.updateLessonProgress(user._id, lessonId, data);
      dispatch({
        type: 'SET_LESSON_PROGRESS',
        payload: { lessonId, progress },
      });
      
      // Refresh course progress after updating lesson progress
      if (state.currentCourse) {
        const courseProgress = await progressApi.fetchCourseProgress(
          state.currentCourse._id
        );
        dispatch({
          type: 'SET_COURSE_PROGRESS',
          payload: { courseId: state.currentCourse._id, progress: courseProgress },
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update progress';
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const updateCourse = async (courseId: string, payload: Partial<Course>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updated = await courseApi.updateCourse(courseId, payload);
      // Update currentCourse and list
      dispatch({ type: 'SET_CURRENT_COURSE', payload: updated });
      const next = state.courses.map(c => (c._id === updated._id ? updated : c));
      dispatch({ type: 'SET_COURSES', payload: next });
      return updated;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update course';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast({ title: 'Error', description: message, variant: 'destructive' });
      return null;
    }
  };

  const deleteCourse = async (courseId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await courseApi.deleteCourse(courseId);
      const next = state.courses.filter(c => c._id !== courseId);
      dispatch({ type: 'SET_COURSES', payload: next });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete course';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast({ title: 'Error', description: message, variant: 'destructive' });
      return false;
    }
  };

  const publishCourse = async (courseId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const published = await courseApi.publishCourse(courseId);
      dispatch({ type: 'SET_CURRENT_COURSE', payload: published });
      const next = state.courses.map(c => (c._id === published._id ? published : c));
      dispatch({ type: 'SET_COURSES', payload: next });
      return published;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to publish course';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast({ title: 'Error', description: message, variant: 'destructive' });
      return null;
    }
  };

  return (
    <CourseContext.Provider
      value={{
        ...state,
        loadCourses,
        loadInstructorCourses,
        loadCourse,
        loadModules,
        createCourse,
        createModule,
        createLesson,
        loadLessons,
        loadResources,
        updateProgress,
        updateCourse,
        deleteCourse,
        publishCourse,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}
