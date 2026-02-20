'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { BookOpen, Loader2 } from 'lucide-react';
import { LoginModal } from './loginModal';
import { enrollInCourse } from '@/lib/api';

interface EnrollButtonProps {
  courseId: string;
  courseName?: string;
  token?: string | null;
  isEnrolled?: boolean;
  className?: string;
}

export function EnrollButton({
  courseId,
  courseName,
  token,
  isEnrolled = false,
  className = '',
}: EnrollButtonProps) {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(isEnrolled);

  if (enrolled) {
    return (
      <button
        onClick={() => router.push(`/course/${courseId}/learn`)}
        className={`w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 ${className}`}
      >
        <BookOpen className="h-4 w-4" />
        Continue Learning
      </button>
    );
  }

  const handleEnroll = async () => {
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    // Logged in → call API
    setEnrolling(true);
    try {
      await enrollInCourse(courseId);
      setEnrolled(true);
      toast.success(
        courseName
          ? `You've enrolled in "${courseName}"!`
          : "You've successfully enrolled!"
      );
    } catch (error: any) {
      const message = error?.message || 'Failed to enroll. Please try again.';

      if (message.toLowerCase().includes('already enrolled')) {
        setEnrolled(true);
        toast.info('You are already enrolled in this course.');
      } else {
        toast.error(message);
      }
    } finally {
      setEnrolling(false);
    }
  };

  const handleLoginSuccess = async () => {
    const freshToken = localStorage.getItem('token');
    if (!freshToken) return;

    setEnrolling(true);
    try {
      await enrollInCourse(courseId);
      setEnrolled(true);
      toast.success(
        courseName
          ? `You've enrolled in "${courseName}"!`
          : "You've successfully enrolled!"
      );
    } catch (error: any) {
      toast.error(error?.message || 'Failed to enroll. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  // Render enroll button
  return (
    <>
      <button
        onClick={handleEnroll}
        disabled={enrolling}
        className={`w-full bg-primary hover:bg-cyan-600 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2 px-4 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 ${className}`}
      >
        {enrolling ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Enrolling...
          </>
        ) : (
          'Enroll Now'
        )}
      </button>

      {/* Login modal — only mounts when needed */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
        redirectMessage={
          courseName
            ? `Sign in to enroll in "${courseName}"`
            : 'Sign in to enroll in this course'
        }
      />
    </>
  );
}