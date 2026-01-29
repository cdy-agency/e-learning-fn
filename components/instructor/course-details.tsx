"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModuleList } from "./modules/module-list";
import { ModuleForm } from "./modules/module-form";
import { Button } from "@/components/ui/button";
import {
  Plus,
  BookOpen,
  Settings,
  FileText,
  GraduationCap,
  Edit3,
  Trash2,
  Rocket,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCourses } from "@/lib/hooks/use-courses";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { CourseStatus, DifficultyLevel, ICourse } from "@/types/course.types";
import Image from "next/image";
import { uploadApi } from "@/lib/api/upload";
import { DeleteConfirmDialog } from "../delete-confirm-dialog";

export const CourseDetails = ({ courseId }: { courseId: string }) => {
  const [activeTab, setActiveTab] = useState("modules");
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const {
    currentCourse,
    modules,
    loadCourse,
    loadModules,
    isLoading,
    updateCourse,
    deleteCourse,
    publishCourse,
  } = useCourses();
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editState, setEditState] = useState<ICourse | null>(null);

  useEffect(() => {
    loadCourse(courseId);
    loadModules(courseId);
  }, [courseId]);

  if (isLoading || !currentCourse) {
    return (
      <div className="space-y-6 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-80 bg-gray-100 rounded" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-24 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const uploadThumbnailToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadApi.uploadFileOrImage(formData);

    if (!res?.url) {
      throw new Error("No video URL returned");
    }

    return res.url;
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-600 rounded-lg shadow-md">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-lg md:text-2xl font-semibold text-gray-900">
              {currentCourse.title}
            </h1>
            <DeleteConfirmDialog
              title="Delete Course"
              description="This course and all its modules will be removed."
              onConfirm={() => deleteCourse(courseId)}
            />
            </div>
            <div
              className="text-sm text-gray-600 leading-relaxed
                prose-headings:text-gray-900 prose-headings:font-bold
                prose-p:text-gray-700 prose-p:leading-relaxed
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-900 prose-strong:font-semibold
                prose-ul:text-gray-700 prose-ol:text-gray-700
                prose-blockquote:border-l-primary prose-blockquote:bg-purple-50/50 prose-blockquote:py-2
                prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded
              "
              dangerouslySetInnerHTML={{
                __html: currentCourse.description || "",
              }}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <Card className="p-4 bg-white border shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
          <Button
            onClick={() => setIsAddModuleOpen(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white h-9 rounded-md"
          >
            <Plus className="h-4 w-4" /> Module
          </Button>
          <Button
            onClick={() => {
              setEditState({
                title: currentCourse.title,
                description: currentCourse.description,
                price: String(currentCourse.price),
                category: currentCourse.category ?? "",
                difficulty_level: currentCourse.difficulty_level,
                status: currentCourse.status ?? "draft",
                thumbnail: currentCourse.thumbnail,
                prerequisites: currentCourse.prerequisites,
                start_date: currentCourse.start_date
                  ? new Date(currentCourse.start_date)
                      .toISOString()
                      .slice(0, 10)
                  : "",
                end_date: currentCourse.end_date
                  ? new Date(currentCourse.end_date).toISOString().slice(0, 10)
                  : "",
                is_certified: currentCourse.is_certified,
                duration_weeks: String(currentCourse.duration_weeks),
              });

              setThumbnailPreview(currentCourse.thumbnail);
              setThumbnailFile(null);

              setIsEditOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white h-9 rounded-md"
          >
            <Edit3 className="h-4 w-4" /> Edit
          </Button>
          <Button
            onClick={async () => {
              await publishCourse(courseId);
            }}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white h-9 rounded-md"
          >
            <Rocket className="h-4 w-4" /> Publish
          </Button>
          <a href={`/instructor/exams/new?courseId=${courseId}`}>
            <Button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white w-full h-9 rounded-md">
              <GraduationCap className="h-4 w-4" /> Exam
            </Button>
          </a>
          <a href={`/instructor/assignments?courseId=${courseId}`}>
            <Button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white w-full h-9 rounded-md">
              <FileText className="h-4 w-4" /> Assignments
            </Button>
          </a>
        </div>
      </Card>

      {/* Add Module Dialog */}
      <Dialog open={isAddModuleOpen} onOpenChange={setIsAddModuleOpen}>
        <DialogContent className="p-6 max-h-[95vh] overflow-y-auto">
          <ModuleForm
            courseId={courseId}
            onSuccess={() => setIsAddModuleOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="w-[95vw] max-w-[1100px] h-[95vh] p-0 ">
          <div className="flex flex-col h-full min-h-0">
            <DialogHeader className="px-6 py-4 border-b bg-gray-50 shrink-0">
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Edit Course Details
              </DialogTitle>
              <p className="text-sm text-gray-500">
                Update all information related to this course.
              </p>
            </DialogHeader>

            {editState && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();

                  let thumbnailUrl = editState.thumbnail;

                  try {
                    if (thumbnailFile) {
                      setIsUploadingImage(true);
                      thumbnailUrl =
                        await uploadThumbnailToCloudinary(thumbnailFile);
                    }

                    await updateCourse(courseId, {
                      title: editState.title,
                      description: editState.description,
                      price: Number(editState.price),
                      category: editState.category,
                      difficulty_level: editState.difficulty_level,
                      status: editState.status,
                      prerequisites: editState.prerequisites,
                      start_date: editState.start_date,
                      end_date: editState.end_date,
                      is_certified: editState.is_certified,
                      duration_weeks: Number(editState.duration_weeks),
                      thumbnail: thumbnailUrl,
                    } as any);

                    setIsEditOpen(false);
                  } catch (err) {
                    alert("Failed to upload thumbnail");
                    console.error(err);
                  } finally {
                    setIsUploadingImage(false);
                  }
                }}
                className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-8"
              >
                <section className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-800 border-b pb-2">
                    Basic Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm">Course Title</label>
                      <input
                        required
                        className="w-full border rounded px-3 py-2 text-sm"
                        value={editState.title}
                        onChange={(e) =>
                          setEditState({ ...editState, title: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm">Category</label>
                      <input
                        className="w-full border rounded px-3 py-2 text-sm"
                        value={editState.category}
                        onChange={(e) =>
                          setEditState({
                            ...editState,
                            category: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm">Description</label>
                    <textarea
                      rows={4}
                      className="w-full border rounded px-3 py-2 text-sm"
                      value={editState.description}
                      onChange={(e) =>
                        setEditState({
                          ...editState,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </section>

                {/* ================= MEDIA ================= */}
                <section className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <div>
                      <section className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                          {/* Upload */}
                          <div>
                            <label className="block mb-1 text-sm">
                              Upload Thumbnail
                            </label>

                            <input
                              type="file"
                              accept="image/*"
                              className="w-full text-sm"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                setThumbnailFile(file);
                                setThumbnailPreview(URL.createObjectURL(file));
                              }}
                            />

                            <p className="text-xs text-gray-500 mt-1">
                              JPG, PNG, WEBP – max 5MB
                            </p>
                          </div>

                          {/* Preview */}
                          <div className="flex justify-center">
                            {thumbnailPreview ? (
                              <Image
                                src={thumbnailPreview}
                                alt="Thumbnail Preview"
                                width={400}
                                height={240}
                                className="h-40 w-full max-w-sm object-cover rounded border"
                              />
                            ) : (
                              <div className="h-40 w-full max-w-sm flex items-center justify-center border rounded text-gray-400 text-sm">
                                No thumbnail selected
                              </div>
                            )}
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-800 border-b pb-2">
                    Pricing & Difficulty
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block mb-1 text-sm">Price</label>
                      <input
                        type="number"
                        className="w-full border rounded px-3 py-2 text-sm"
                        value={editState.price}
                        onChange={(e) =>
                          setEditState({ ...editState, price: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm">Difficulty</label>
                      <select
                        className="w-full border rounded px-3 py-2 text-sm bg-white"
                        value={editState.difficulty_level}
                        onChange={(e) =>
                          setEditState({
                            ...editState,
                            difficulty_level: e.target.value as DifficultyLevel,
                          })
                        }
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 text-sm">
                        Duration (weeks)
                      </label>
                      <input
                        type="number"
                        className="w-full border rounded px-3 py-2 text-sm"
                        value={editState.duration_weeks}
                        onChange={(e) =>
                          setEditState({
                            ...editState,
                            duration_weeks: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-800 border-b pb-2">
                    Course Schedule
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm">Start Date</label>
                      <input
                        type="date"
                        className="w-full border rounded px-3 py-2 text-sm"
                        value={editState.start_date}
                        onChange={(e) =>
                          setEditState({
                            ...editState,
                            start_date: e.target.value as any,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm">End Date</label>
                      <input
                        type="date"
                        className="w-full border rounded px-3 py-2 text-sm"
                        value={editState.end_date}
                        onChange={(e) =>
                          setEditState({
                            ...editState,
                            end_date: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-800 border-b pb-2">
                    Course Settings
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm">Status</label>
                      <select
                        className="w-full border rounded px-3 py-2 text-sm bg-white"
                        value={editState.status}
                        onChange={(e) =>
                          setEditState({
                            ...editState,
                            status: e.target.value as CourseStatus,
                          })
                        }
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3 mt-6">
                      <input
                        type="checkbox"
                        checked={editState.is_certified}
                        onChange={(e) =>
                          setEditState({
                            ...editState,
                            is_certified: e.target.checked,
                          })
                        }
                      />
                      <label className="text-sm">Certified Course</label>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-800 border-b pb-2">
                    Prerequisites
                  </h3>

                  <section className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-800 border-b pb-2">
                      Prerequisites
                    </h3>

                    <div className="border rounded-md p-3 space-y-2">
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {editState.prerequisites.map((item, index) => (
                          <span
                            key={index}
                            className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full"
                          >
                            {item}
                            <button
                              type="button"
                              onClick={() =>
                                setEditState({
                                  ...editState,
                                  prerequisites: editState.prerequisites.filter(
                                    (_, i) => i !== index,
                                  ),
                                })
                              }
                              className="hover:text-red-600"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>

                      {/* Input */}
                      <input
                        type="text"
                        placeholder="Type and press Enter"
                        className="w-full border-none outline-none text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            const value = e.currentTarget.value.trim();

                            if (!value) return;
                            if (editState.prerequisites.includes(value)) return;

                            setEditState({
                              ...editState,
                              prerequisites: [
                                ...editState.prerequisites,
                                value,
                              ],
                            });

                            e.currentTarget.value = "";
                          }
                        }}
                      />
                    </div>
                  </section>
                </section>

                <div className="sticky bottom-0 bg-white border-t pt-4 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 text-white"
                    disabled={isUploadingImage}
                  >
                    {isUploadingImage ? "Uploading..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Tabs */}
      <Card className="bg-white border shadow-sm rounded-md">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="bg-gray-50 border-b px-3 py-2">
            <TabsList className="flex gap-2 bg-white rounded-md">
              <TabsTrigger
                value="modules"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
              >
                <FileText className="h-4 w-4" />
                Modules
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
              >
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="p-4">
            <TabsContent value="modules">
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <h2 className="text-base font-semibold text-gray-800">
                    Course Modules
                  </h2>
                </div>
                <ModuleList modules={modules} courseId={courseId} />
              </div>
            </TabsContent>
            <TabsContent value="settings">
              <div className="text-center py-6 text-gray-500 text-sm">
                <Settings className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                Course settings coming soon.
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
};
