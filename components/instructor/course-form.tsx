"use client";

import { useState } from "react";
import { BookOpen, Loader, Award, Image as ImageIcon, Video, Link, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CourseFormState } from "@/types/course.types";
import { createCourse } from "@/lib/api/courses";

export default function CourseForm() {
  const { toast } = useToast();

  const [formState, setFormState] = useState<CourseFormState>({
    title: "",
    description: "",
    price: "",
    category: "",
    difficulty_level: "beginner",
    status: "draft",
    prerequisites: "",
    start_date: "",
    end_date: "",
    is_certified: false,
    duration_weeks: "",
    externalUrl: "",
  });

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoThumbnailFile, setVideoThumbnailFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoSource, setVideoSource] = useState<"upload" | "external">("upload");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const { name, value, type } = target;

    setFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (target as HTMLInputElement).checked : value,
    }));
  };

  const handleThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setThumbnailFile(file);
  };

  const handleVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setVideoFile(file);
  };

  const handleVideoThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setVideoThumbnailFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createCourse({
        title: formState.title,
        description: formState.description,
        price: formState.price,
        category: formState.category,
        difficulty_level: formState.difficulty_level,
        status: formState.status,
        prerequisites: formState.prerequisites,
        start_date: formState.start_date,
        end_date: formState.end_date,
        is_certified: formState.is_certified,
        duration_weeks: formState.duration_weeks,
        thumbnail: thumbnailFile,
        video: videoFile,
        videoThumbnail: videoThumbnailFile,
        externalUrl: videoSource === "external" ? formState.externalUrl : "",
      });

      toast({
        title: "Success",
        description: "Course created successfully!",
      });

      // Reset form
      setFormState({
        title: "",
        description: "",
        price: "",
        category: "",
        difficulty_level: "beginner",
        status: "draft",
        prerequisites: "",
        start_date: "",
        end_date: "",
        is_certified: false,
        duration_weeks: "",
        externalUrl: "",
      });
      setThumbnailFile(null);
      setVideoFile(null);
      setVideoThumbnailFile(null);
      setVideoSource("upload");
    } catch (error) {
      toast({
        title: "Failed",
        description: "Could not create course.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BookOpen className="w-8 h-8" />
            Create New Course
          </h1>
          <p className="text-blue-100 mt-2 text-sm">Fill in the details to create your course</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Basic Information Section */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formState.title}
                onChange={handleChange}
                required
                placeholder="Enter course title"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formState.description}
                onChange={handleChange}
                rows={4}
                placeholder="Enter course description"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formState.price}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formState.category}
                  onChange={handleChange}
                  placeholder="e.g., Web Development, Design"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  name="difficulty_level"
                  value={formState.difficulty_level}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm appearance-none cursor-pointer"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formState.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm appearance-none cursor-pointer"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prerequisites
              </label>
              <input
                type="text"
                name="prerequisites"
                value={formState.prerequisites}
                onChange={handleChange}
                placeholder="HTML, CSS, JavaScript basics (comma-separated)"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Enter prerequisites separated by commas</p>
            </div>
          </div>

          {/* Schedule Section */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Schedule & Duration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formState.start_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formState.end_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (weeks)
                </label>
                <input
                  type="number"
                  name="duration_weeks"
                  value={formState.duration_weeks}
                  onChange={handleChange}
                  placeholder="Enter duration in weeks"
                  min="0"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                />
              </div>

              <div className="flex items-center pt-8">
                <input
                  id="is_certified"
                  type="checkbox"
                  name="is_certified"
                  checked={formState.is_certified}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="is_certified" className="ml-3 text-sm font-medium text-gray-700 cursor-pointer">
                  <Award className="w-4 h-4 inline mr-1" />
                  Certified Course
                </label>
              </div>
            </div>
          </div>

          {/* Media Section */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Media & Resources</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                Course Thumbnail
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnail}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>
              {thumbnailFile && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  {thumbnailFile.name}
                </p>
              )}
            </div>

            {/* Video Source Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
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
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2 flex items-center gap-2">
                      <Video className="w-4 h-4 text-blue-600" />
                      Video File
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideo}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer"
                    />
                    {videoFile && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        {videoFile.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-blue-600" />
                      Video Thumbnail
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleVideoThumbnail}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer"
                    />
                    {videoThumbnailFile && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        {videoThumbnailFile.name}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2 flex items-center gap-2">
                    <Link className="w-4 h-4 text-blue-600" />
                    External Video URL
                  </label>
                  <input
                    type="url"
                    name="externalUrl"
                    value={formState.externalUrl}
                    onChange={handleChange}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter YouTube, Vimeo, or other video URL</p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Creating Course...
                </>
              ) : (
                <>
                  <Award className="w-5 h-5" />
                  Create Course
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}