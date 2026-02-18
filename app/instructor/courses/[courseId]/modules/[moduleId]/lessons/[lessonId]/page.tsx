"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TiptapEditor } from "@/components/ui/editor";
import { fetchLessonById, updateLesson } from "@/lib/api/courses";
import { Lesson } from "@/lib/types/course";
import { showToast } from "@/lib/api/courses";
import { ArrowLeft, Eye, Pencil, Loader2 } from "lucide-react";

interface LessonPageProps {
  params: Promise<{ courseId: string; moduleId: string; lessonId: string }>;
}

export default function LessonViewPage({ params }: LessonPageProps) {
  const resolved = use(params);
  const { courseId, moduleId, lessonId } = resolved;
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editDuration, setEditDuration] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchLessonById(lessonId);
        if (!cancelled) {
          setLesson(data);
          setEditTitle(data.title);
          setEditContent(data.content ?? "");
          setEditDuration(data.duration_minutes ?? 0);
        }
      } catch (e) {
        if (!cancelled) {
          showToast("Failed to load lesson", "error");
          router.push(`/instructor/courses/${courseId}`);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lessonId, courseId, router]);

  const handleSave = async () => {
    if (!lesson) return;
    setSaving(true);
    try {
      const updated = await updateLesson(lessonId, {
        title: editTitle,
        content: editContent,
        duration_minutes: editDuration,
      });
      setLesson(updated);
    } catch {
      setSaving(false);
      return;
    }
    setSaving(false);
  };

  if (loading || !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const backUrl = `/instructor/courses/${courseId}`;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href={backUrl}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to course
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="edit" className="flex items-center gap-2">
                <Pencil className="h-4 w-4" />
                Edit
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="mt-0">
              <div className="space-y-4">
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">{lesson.title}</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Duration: {lesson.duration_minutes} min
                  </p>
                </div>
                <div className="rounded-md border bg-muted/30 p-4 prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary">
                  {lesson.content ? (
                    <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                  ) : (
                    <p className="text-muted-foreground">No content yet.</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="edit" className="mt-0 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  min={0}
                  value={editDuration}
                  onChange={(e) => setEditDuration(Number(e.target.value) || 0)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <TiptapEditor
                  name="lesson-content-edit"
                  content={editContent}
                  onChange={setEditContent}
                  placeholder="Lesson content..."
                  className="bg-white border border-gray-300 rounded-lg min-h-[300px] w-full"
                />
              </div>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-700 text-white hover:bg-blue-800"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
