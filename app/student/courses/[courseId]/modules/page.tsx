"use client";

import {
  CheckCircle,
  Circle,
  CircleDot,
  ChevronDown,
  ChevronRight,
  FileText,
  ClipboardList,
  Lock,
  Clock,
  CheckCircle2,
  X,
  Play,
  Award,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { use, useEffect, useState } from "react";
import { fetchStundentModulesByCourseId } from "@/lib/api/courses";
import { cn } from "@/lib/utils";

// Progress tracking utilities (same as in page content)
const getProgressKey = (courseId: string) => `course_progress_${courseId}`
const getCompletedLessons = (courseId: string): string[] => {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(getProgressKey(courseId))
  return stored ? JSON.parse(stored) : []
}

const isLessonComplete = (courseId: string, lessonId: string): boolean => {
  return getCompletedLessons(courseId).includes(lessonId)
}

export default function CourseModulesPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});
  const [courseModules, setCourseModules] = useState<any[]>([]);
  const [userAccess, setUserAccess] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [modalStatus, setModalStatus] = useState<"mode" | "pending" | "approved">("mode");
  const [courseProgress, setCourseProgress] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchStundentModulesByCourseId(courseId);
        setCourseModules(data.modules || []);
        setUserAccess(data.userAccess);
        
        // Auto-open first module
        if (data.modules && data.modules.length > 0) {
          setOpenModules({ [`${data.modules[0]._id}-0`]: true });
        }
        
        // Calculate progress
        calculateProgress(data.modules || []);
      } catch (error: any) {
        if (error.isRestricted) {
          setShowPaymentModal(true);
        }
        setCourseModules([]);
      }
    };
    load();
  }, [courseId]);

  const calculateProgress = (modules: any[]) => {
    const allLessons = modules.flatMap((m) => m.items || m.lessons || []);
    const completed = getCompletedLessons(courseId);
    const progressPercent = allLessons.length > 0 
      ? Math.round((completed.length / allLessons.length) * 100) 
      : 0;
    setCourseProgress(progressPercent);
  };

  const toggleModule = (moduleId: string, isLocked: boolean, status: string) => {
    if (isLocked) {
      setModalStatus(status as "mode" | "pending" | "approved");
      setShowPaymentModal(true);
      return;
    }
    setOpenModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const handleModalClose = async () => {
    setShowPaymentModal(false);
    if (modalStatus === "approved") {
      try {
        const data = await fetchStundentModulesByCourseId(courseId);
        setCourseModules(data.modules || []);
        setUserAccess(data.userAccess);
      } catch (error: any) {
        console.error("Error reloading modules:", error);
      }
    }
  };

  const getModalContent = () => {
    switch (modalStatus) {
      case "mode":
        return {
          icon: <Lock className="h-5 w-5 text-orange-500" />,
          title: "Payment Required",
          message: "You need to complete the payment to access this module. Only the first module is available for free. Please make a payment to unlock all course content.",
          showPaymentButton: true,
        };
      case "pending":
        return {
          icon: <Clock className="h-5 w-5 text-yellow-500" />,
          title: "Payment Under Review",
          message: "Your payment is currently being reviewed. You will be notified once it has been approved and you'll gain access to all course modules.",
          showPaymentButton: false,
        };
      case "approved":
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
          title: "Access Granted",
          message: "Your payment has been approved! You now have full access to all course modules.",
          showPaymentButton: false,
        };
      default:
        return {
          icon: <Lock className="h-5 w-5 text-orange-500" />,
          title: "Payment Required",
          message: "You need to complete the payment to access this module.",
          showPaymentButton: true,
        };
    }
  };

  const modalContent = getModalContent();

  // Calculate total lessons and completed
  const totalLessons = courseModules.reduce(
    (acc, module) => acc + (module.items || module.lessons || []).length,
    0
  );
  const completedLessons = getCompletedLessons(courseId).length;

  return (
    <div className="flex flex-1 flex-col bg-gray-50">
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {modalContent.icon}
                <h2 className="text-lg font-semibold text-gray-900">
                  {modalContent.title}
                </h2>
              </div>
              <button
                onClick={handleModalClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">{modalContent.message}</p>
            {modalStatus === "mode" && (
              <p className="text-sm text-gray-500 mb-4 bg-blue-50 p-3 rounded-lg">
                📞 Tel: +250 790 147 808
              </p>
            )}
            <div className="flex gap-3">
              <Button
                onClick={handleModalClose}
                variant="outline"
                className="flex-1"
              >
                {modalContent.showPaymentButton ? "Cancel" : "Close"}
              </Button>
              {modalContent.showPaymentButton && (
                <Button
                  onClick={() => {
                    window.location.href = `/student/courses/${courseId}/payment`;
                  }}
                  className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                >
                  Proceed to Payment
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header with Progress */}
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Course Modules</h1>
          
          {/* Overall Progress Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Your Progress</h3>
                  <p className="text-sm text-gray-600">
                    {completedLessons} of {totalLessons} lessons completed
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{courseProgress}%</div>
                <p className="text-xs text-gray-600">Complete</p>
              </div>
            </div>
            <div className="w-full bg-white rounded-full h-3 shadow-inner">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${courseProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-4">
          {courseModules.map((module, index) => {
            const moduleKey = `${module.id}-${index}`;
            const isLocked = module.isLocked || false;
            const status = module.moduleStatus || "mode";
            const moduleItems = module.items || module.lessons || [];
            
            // Calculate module progress
            const completedInModule = moduleItems.filter((item: any) =>
              isLessonComplete(courseId, item._id || item.url)
            ).length;
            const moduleProgress = moduleItems.length > 0
              ? Math.round((completedInModule / moduleItems.length) * 100)
              : 0;

            const getStatusBadge = () => {
              switch (status) {
                case "mode":
                  return (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-200">
                      <Lock className="h-3 w-3" />
                      Payment Required
                    </span>
                  );
                case "pending":
                  return (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-full border border-yellow-200">
                      <Clock className="h-3 w-3" />
                      Under Review
                    </span>
                  );
                default:
                  return null;
              }
            };

            return (
              <div
                key={moduleKey}
                className="bg-white rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Module Header */}
                <div
                  className={cn(
                    "flex items-center p-5 cursor-pointer transition-colors",
                    isLocked && status !== "approved" 
                      ? "bg-gray-50 hover:bg-gray-100" 
                      : "hover:bg-blue-50"
                  )}
                  onClick={() => toggleModule(moduleKey, isLocked, status)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {/* Icon */}
                    <div className={cn(
                      "flex-shrink-0 p-2 rounded-lg",
                      isLocked && status !== "approved"
                        ? "bg-gray-200"
                        : moduleProgress === 100
                        ? "bg-green-100"
                        : "bg-blue-100"
                    )}>
                      {isLocked && status === "mode" ? (
                        <Lock className="h-5 w-5 text-orange-500" />
                      ) : isLocked && status === "pending" ? (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      ) : moduleProgress === 100 ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Play className="h-5 w-5 text-blue-600" />
                      )}
                    </div>

                    {/* Module Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className={cn(
                        "font-semibold text-lg mb-1",
                        isLocked && status !== "approved" ? "text-gray-500" : "text-gray-900"
                      )}>
                        {module.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{moduleItems.length} lessons</span>
                        {!isLocked && (
                          <>
                            <span>•</span>
                            <span className={cn(
                              "font-medium",
                              moduleProgress === 100 ? "text-green-600" : "text-blue-600"
                            )}>
                              {moduleProgress}% complete
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    {isLocked && getStatusBadge()}

                    {/* Expand Icon */}
                    {!isLocked && (
                      openModules[moduleKey] ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )
                    )}
                  </div>
                </div>

                {/* Module Progress Bar */}
                {!isLocked && moduleItems.length > 0 && (
                  <div className="px-5 pb-2">
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-500",
                          moduleProgress === 100 ? "bg-green-500" : "bg-blue-500"
                        )}
                        style={{ width: `${moduleProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Module Content */}
                {openModules[moduleKey] && !isLocked && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="p-4 space-y-2">
                      {moduleItems.map((item: any, itemIndex: number) => {
                        const isItemComplete = isLessonComplete(courseId, item._id || item.url);

                        return (
                          <Link
                            key={itemIndex}
                            href={`/student/courses/${courseId}/pages/${item.url || item._id}`}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg transition-all group",
                              isItemComplete
                                ? "bg-green-50 hover:bg-green-100 border border-green-200"
                                : "bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300"
                            )}
                          >
                            {/* Lesson Icon */}
                            <div className={cn(
                              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                              isItemComplete
                                ? "bg-green-500 border-green-500"
                                : "bg-white border-gray-300 group-hover:border-blue-500"
                            )}>
                              {isItemComplete ? (
                                <CheckCircle className="h-4 w-4 text-white" />
                              ) : item.type === "assignment" ? (
                                <ClipboardList className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                              ) : (
                                <FileText className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                              )}
                            </div>

                            {/* Lesson Info */}
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "text-sm font-medium transition-colors",
                                isItemComplete
                                  ? "text-green-900"
                                  : "text-gray-900 group-hover:text-blue-600"
                              )}>
                                {item.title}
                              </p>
                              {(item.dueDate || item.status) && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {item.dueDate && `Due: ${item.dueDate}`}
                                  {item.points && ` • ${item.points} pts`}
                                  {item.status && ` • ${item.status}`}
                                </p>
                              )}
                            </div>

                            {/* Completion Badge */}
                            {isItemComplete && (
                              <span className="flex-shrink-0 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                                ✓ Complete
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}