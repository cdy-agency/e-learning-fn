"use client"

import React, { useState } from "react";
import { useCourses } from "@/lib/hooks/use-courses";
import { Button } from "@/components/ui/button";
import { TiptapEditor } from "@/components/ui/editor";

export function LessonForm({
  moduleId,
  onSuccess,
}: {
  moduleId: string;
  onSuccess: () => void;
}) {
  const { createLesson } = useCourses();

  const [title, setTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("0");
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  try {
    await createLesson(
      moduleId,
      title.trim(),
      content,
      "text",
      Number(durationMinutes)
    );

    onSuccess();
  } catch (error) {
    console.error("Error creating lesson:", error);
  }
};

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-5xl w-full mx-auto">
      <div>
        <label className="block mb-1 font-medium">Lesson Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter lesson title"
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Duration (minutes)</label>
        <input
          type="number"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
          min="1"
          className="w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Lesson Content</label>
        <TiptapEditor
          name="lesson-content"
          content={content}
          onChange={setContent}
          placeholder="Enter lesson content (text, images, video, etc.)"
          className="bg-white border border-gray-300 rounded-lg min-h-[300px] w-full max-w-5xl"
        />
      </div>

      <Button type="submit" className="w-full bg-blue-700 text-white">
        Create Lesson
      </Button>
    </form>
  );
}
