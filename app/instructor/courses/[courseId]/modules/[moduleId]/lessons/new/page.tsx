"use client";

import { LessonForm } from "@/components/instructor/lessons/lesson-form";
import { useRouter } from "next/navigation";
import { use } from "react";

interface AddLessonPageProps {
  params: Promise<{ 
    courseId: string;
    moduleId: string;
  }>;
}

export default function AddLessonPage({ params }: AddLessonPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { courseId, moduleId } = resolvedParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg p-8">
        <LessonForm
          moduleId={moduleId}
          onSuccess={() => {
            router.back();
          }}
        />
      </div>
    </div>
  );
}