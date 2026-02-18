  "use client";

  import { useState } from "react";
  import Link from "next/link";
  import { Button } from "@/components/ui/button";
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
  import { Plus, Video, FileText, Music, Eye } from 'lucide-react';
  import { ResourceList } from "../resources/resource-list";
  import { AddResourceForm } from "../resources/add-resources";

  const contentTypeIcons = {
    video: Video,
    text: FileText,
    audio: Music,
  };

  interface Lesson {
    _id: string;
    title: string;
    content?: string;
    content_type: keyof typeof contentTypeIcons;
    duration_minutes: number;
  }

  export function LessonList({
    lessons,
    moduleId,
    courseId,
  }: {
    lessons: Lesson[];
    moduleId: string;
    courseId: string;
  }) {
    const [openDialogs, setOpenDialogs] = useState<{ [key: string]: boolean }>({});

    const handleOpenChange = (lessonId: string, isOpen: boolean) => {
      setOpenDialogs((prev) => ({ ...prev, [lessonId]: isOpen }));
    };

    const handleSuccess = (lessonId: string) => {
      handleOpenChange(lessonId, false);
    };

    return (
      <div className="space-y-4">
        {lessons.length === 0 ? (
          <p>No lessons available for this module.</p>
        ) : (
          lessons.map((lesson) => {
            const Icon = contentTypeIcons[lesson.content_type];
            return (
              <Card key={lesson._id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <CardTitle className="text-base">{lesson.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/instructor/courses/${courseId}/modules/${moduleId}/lessons/${lesson._id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View content
                      </Button>
                    </Link>
                    <Dialog
                      open={openDialogs[lesson._id]}
                      onOpenChange={(isOpen) => handleOpenChange(lesson._id, isOpen)}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="bg-blue-700 text-white hover:bg-blue-400">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Resource
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Resource</DialogTitle>
                          <DialogDescription>
                            Add a new resource to the lesson &quot;{lesson.title}&quot;.
                          </DialogDescription>
                        </DialogHeader>
                        <AddResourceForm
                          lessonId={lesson._id}
                          onSuccess={() => handleSuccess(lesson._id)}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Duration: {lesson.duration_minutes} minutes
                  </CardDescription>
                  <div className="mt-4">
                    <ResourceList lessonId={lesson._id} />
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    );
  }

