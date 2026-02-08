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
  Image as ImageIcon,
  Video,
  Link,
  Upload,
  X,
  Check,
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
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoThumbnailFile, setVideoThumbnailFile] = useState<File | null>(null);
  const [videoThumbnailPreview, setVideoThumbnailPreview] = useState<string | null>(null);
  const [videoSource, setVideoSource] = useState<"upload" | "external">("upload");
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

  const uploadFileToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadApi.uploadFileOrImage(formData);

    if (!res?.url) {
      throw new Error("No URL returned from upload");
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
                video: currentCourse.video || "",
                videoThumbnail: currentCourse.videoThumbnail || "",
                externalUrl: currentCourse.externalUrl || "",
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
              setVideoThumbnailPreview(currentCourse.videoThumbnail || null);
              setThumbnailFile(null);
              setVideoFile(null);
              setVideoThumbnailFile(null);
              setVideoSource(currentCourse.externalUrl ? "external" : "upload");

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
        <DialogContent className="w-[95vw] max-w-[1100px] h-[95vh] p-0">
          <div className="flex flex-col h-full min-h-0">
            <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 shrink-0">
              <DialogTitle className="text-lg font-semibold text-white flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Edit Course Details
              </DialogTitle>
            </DialogHeader>

            {editState && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsUploadingImage(true);

                  try {
                    let thumbnailUrl = editState.thumbnail;
                    let videoUrl = editState.video;
                    let videoThumbnailUrl = editState.videoThumbnail;

                    // Upload new thumbnail if selected
                    if (thumbnailFile) {
                      thumbnailUrl = await uploadFileToCloudinary(thumbnailFile);
                    }

                    // Upload new video if selected
                    if (videoFile) {
                      videoUrl = await uploadFileToCloudinary(videoFile);
                    }

                    // Upload new video thumbnail if selected
                    if (videoThumbnailFile) {
                      videoThumbnailUrl = await uploadFileToCloudinary(videoThumbnailFile);
                    }

                    const payload: any = {
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
                      videoThumbnail: videoThumbnailUrl,
                    };

                    // Add video or externalUrl based on source
                    if (videoSource === "external") {
                      payload.externalUrl = editState.externalUrl;
                      payload.video = ""; // Clear video if using external
                    } else {
                      payload.video = videoUrl;
                      payload.externalUrl = ""; // Clear external if using video
                    }

                    await updateCourse(courseId, payload);
                    setIsEditOpen(false);
                  } catch (error) {
                    console.error("Failed to update course:", error);
                  } finally {
                    setIsUploadingImage(false);
                  }
                }}
                className="flex-1 overflow-y-auto px-6 py-4 space-y-6"
              >
                {/* Basic Information Section */}
                <section className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-800 border-b pb-2">
                    Basic Information
                  </h3>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Course Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      value={editState.title}
                      onChange={(e) =>
                        setEditState({ ...editState, title: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                      value={editState.description}
                      onChange={(e) =>
                        setEditState({
                          ...editState,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        value={editState.price}
                        onChange={(e) =>
                          setEditState({ ...editState, price: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Category
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Difficulty Level
                      </label>
                      <select
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Duration (weeks)
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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

                {/* Media Section */}
                <section className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-800 border-b pb-2">
                    Media & Resources
                  </h3>

                  {/* Course Thumbnail - COMPACT */}
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                      Course Thumbnail
                    </label>
                    
                    {thumbnailPreview && (
                      <div className="flex items-center gap-3 mb-2 p-2 bg-gray-50 rounded-lg border">
                        <div className="relative w-20 h-20 rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={thumbnailPreview}
                            alt="Thumbnail"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-600 truncate">
                            {thumbnailFile ? thumbnailFile.name : "Current thumbnail"}
                          </p>
                          {!thumbnailFile && (
                            <p className="text-xs text-blue-600 mt-0.5">Existing</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setThumbnailPreview(null);
                            setThumbnailFile(null);
                            setEditState({ ...editState, thumbnail: "" });
                          }}
                          className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setThumbnailFile(file);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setThumbnailPreview(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer"
                    />
                  </div>

                  {/* Video Source Selection */}
                  <div>
                    <label className="block mb-3 text-sm font-medium text-gray-700">
                      Course Video Source
                    </label>
                    <div className="flex gap-4 mb-4">
                      <button
                        type="button"
                        onClick={() => setVideoSource("upload")}
                        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                          videoSource === "upload"
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <Upload className="w-5 h-5 mx-auto mb-1" />
                        Upload Video
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoSource("external")}
                        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                          videoSource === "external"
                            ? "border-blue-600 bg-blue-50 text-blue-700"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <Link className="w-5 h-5 mx-auto mb-1" />
                        External URL
                      </button>
                    </div>

                    {videoSource === "upload" ? (
                      <div className="space-y-4">
                        {/* Video File - COMPACT */}
                        <div>
                          <label className="block mb-2 text-xs font-medium text-gray-600 flex items-center gap-2">
                            <Video className="w-4 h-4 text-blue-600" />
                            Video File
                          </label>

                          {/* Show existing video */}
                          {editState.video && !videoFile && (
                            <div className="flex items-center gap-3 mb-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                              <Video className="w-10 h-10 text-blue-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-700">Current Video</p>
                                <p className="text-xs text-gray-500 truncate">
                                  {editState.video}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditState({ ...editState, video: "" });
                                }}
                                className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 flex-shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}

                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setVideoFile(file);
                              }
                            }}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer"
                          />
                          {videoFile && (
                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              New: {videoFile.name}
                            </p>
                          )}
                        </div>

                        {/* Video Thumbnail - COMPACT */}
                        <div>
                          <label className="block mb-2 text-xs font-medium text-gray-600 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-blue-600" />
                            Video Thumbnail
                          </label>
                          
                          {videoThumbnailPreview && (
                            <div className="flex items-center gap-3 mb-2 p-2 bg-gray-50 rounded-lg border">
                              <div className="relative w-20 h-20 rounded overflow-hidden flex-shrink-0">
                                <Image
                                  src={videoThumbnailPreview}
                                  alt="Video thumbnail"
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-600 truncate">
                                  {videoThumbnailFile ? videoThumbnailFile.name : "Current video thumbnail"}
                                </p>
                                {!videoThumbnailFile && (
                                  <p className="text-xs text-blue-600 mt-0.5">Existing</p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setVideoThumbnailPreview(null);
                                  setVideoThumbnailFile(null);
                                  setEditState({ ...editState, videoThumbnail: "" });
                                }}
                                className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 flex-shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setVideoThumbnailFile(file);
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setVideoThumbnailPreview(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block mb-2 text-xs font-medium text-gray-600 flex items-center gap-2">
                          <Link className="w-4 h-4 text-blue-600" />
                          External Video URL
                        </label>
                        <input
                          type="url"
                          placeholder="https://youtube.com/watch?v=..."
                          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          value={editState.externalUrl}
                          onChange={(e) =>
                            setEditState({
                              ...editState,
                              externalUrl: e.target.value,
                            })
                          }
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter YouTube, Vimeo, or other video URL
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Schedule Section */}
                <section className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-800 border-b pb-2">
                    Schedule
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Start Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        End Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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

                {/* Course Settings Section */}
                <section className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-800 border-b pb-2">
                    Course Settings
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                        id="is_certified_edit"
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                        checked={editState.is_certified}
                        onChange={(e) =>
                          setEditState({
                            ...editState,
                            is_certified: e.target.checked,
                          })
                        }
                      />
                      <label htmlFor="is_certified_edit" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Certified Course
                      </label>
                    </div>
                  </div>
                </section>

                {/* Prerequisites Section */}
                <section className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-800 border-b pb-2">
                    Prerequisites
                  </h3>

                  <div className="border rounded-lg p-3 bg-gray-50 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {editState.prerequisites?.map((item, index) => (
                        <span
                          key={index}
                          className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full"
                        >
                          {item}
                          <button
                            type="button"
                            onClick={() =>
                              setEditState({
                                ...editState,
                                prerequisites: editState.prerequisites.filter(
                                  (_, i) => i !== index
                                ),
                              })
                            }
                            className="hover:text-red-600 ml-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    <input
                      type="text"
                      placeholder="Type and press Enter or comma to add"
                      className="w-full border-none outline-none text-sm bg-transparent"
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

                {/* Action Buttons */}
                <div className="sticky bottom-0 bg-white border-t pt-4 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditOpen(false)}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30"
                    disabled={isUploadingImage}
                  >
                    {isUploadingImage ? (
                      <>
                        <Upload className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Save Changes"
                    )}
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