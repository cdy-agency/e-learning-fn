"use client"

import { courseToDoItems, recentFeedback } from "@/lib/data"
import {
  Bell,
  CalendarDays,
  CheckCircle,
  Circle,
  CircleDot,
  Eye,
  ChevronDown,
  ChevronRight,
  FileText,
  ClipboardList,
  Lock,
  Clock,
  CheckCircle2,
  X,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { fetchStundentModulesByCourseId } from "@/lib/api/courses"

export default function CourseModulesPage({ params }: { params: { courseId: string } }) {
  const { courseId } = params
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({})
  const [courseModules, setCourseModules] = useState<any[]>([])
  const [userAccess, setUserAccess] = useState<any>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [modalStatus, setModalStatus] = useState<'mode' | 'pending' | 'approved'>('mode')

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchStundentModulesByCourseId(courseId)
        setCourseModules(data.modules || [])
        setUserAccess(data.userAccess)
      } catch (error: any) {
        if (error.isRestricted) {
          setShowPaymentModal(true)
        }
        setCourseModules([])
      }
    }
    load()
  }, [courseId])

  const toggleModule = (moduleId: string, isLocked: boolean, status: string) => {
    if (isLocked) {
      setModalStatus(status as 'mode' | 'pending' | 'approved')
      setShowPaymentModal(true)
      return
    }
    setOpenModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }))
  }

  const expandAll = () => {
    const allOpen: Record<string, boolean> = {}
    for (const m of courseModules) {
      if (!m.isLocked) {
        allOpen[m.id] = true
      }
    }
    setOpenModules(allOpen)
  }

  const collapseAll = () => {
    setOpenModules({})
  }

  // Helper function to get modal content based on status
  const getModalContent = () => {
    switch (modalStatus) {
      case 'mode':
        return {
          icon: <Lock className="h-5 w-5 text-orange-500" />,
          title: "Payment Required",
          message: "You need to complete the payment to access this module. Only the first module is available for free. Please make a payment to unlock all course content.",
          showPaymentButton: true
        }
      case 'pending':
        return {
          icon: <Clock className="h-5 w-5 text-yellow-500" />,
          title: "Payment Under Review",
          message: "Your payment is currently being reviewed. You will be notified once it has been approved and you'll gain access to all course modules.",
          showPaymentButton: false
        }
      case 'approved':
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
          title: "Access Granted",
          message: "Your payment has been approved! You now have full access to all course modules.",
          showPaymentButton: false
        }
      default:
        return {
          icon: <Lock className="h-5 w-5 text-orange-500" />,
          title: "Payment Required",
          message: "You need to complete the payment to access this module.",
          showPaymentButton: true
        }
    }
  }

  const modalContent = getModalContent()

  return (
    <div className="flex flex-1 flex-col">
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {modalContent.icon}
                <h2 className="text-lg font-semibold text-gray-900">{modalContent.title}</h2>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              {modalContent.message}
            </p>
            {modalStatus === 'mode' && (
              <p className="text-sm text-gray-500 mb-4">Tel: +250 790 147 808</p>
            )}
            <div className="flex gap-3">
              <Button
                onClick={() => setShowPaymentModal(false)}
                variant="outline"
                className="flex-1"
              >
                {modalContent.showPaymentButton ? 'Cancel' : 'Close'}
              </Button>
              {modalContent.showPaymentButton && (
                <Button
                  onClick={() => {
                    window.location.href = `/student/courses/${courseId}/payment`
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

      <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-white px-4 md:px-6">
        <h1 className="text-sm font-semibold text-gray-900">
          <Link href={`/student/courses/${courseId}/home`} className="text-blue-600 hover:underline">
            Communicating_for_Impact
          </Link>{" "}
          <span className="text-gray-400">›</span> Modules
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" className="h-8 text-sm bg-transparent border-gray-300" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="outline" className="h-8 text-sm bg-transparent border-gray-300" onClick={collapseAll}>
            Collapse All
          </Button>
          <Button variant="outline" className="h-8 text-sm bg-transparent border-gray-300">
            Export Course Content
          </Button>
          <button className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100">
            <Eye className="h-5 w-5" />
            <span className="sr-only">View Course Stream</span>
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100">
            <CalendarDays className="h-5 w-5" />
            <span className="sr-only">View Calendar</span>
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100">
            <Bell className="h-5 w-5" />
            <span className="sr-only">View Course Notifications</span>
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 lg:flex-row">
        <div className="flex flex-1 flex-col gap-6">
          {courseModules.map((module, index) => {
            const moduleKey = `${module.id}-${index}`;
            const isLocked = module.isLocked || false;
            const status = module.moduleStatus || 'mode';
            
            // Helper function to get status badge
            const getStatusBadge = () => {
              switch (status) {
                case 'mode':
                  return (
                    <span className="ml-auto text-xs text-orange-600 font-normal flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Payment Required
                    </span>
                  )
                case 'pending':
                  return (
                    <span className="ml-auto text-xs text-yellow-600 font-normal flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Under Review
                    </span>
                  )
                case 'approved':
                  return null // No badge for approved status
                default:
                  return null
              }
            }

            return (
              <div key={moduleKey} className="rounded-md border border-gray-200 bg-white shadow-sm">
                <div
                  className="flex w-full items-center p-4 text-left font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleModule(moduleKey, isLocked, status)}
                >
                  {isLocked ? (
                    status === 'mode' ? (
                      <Lock className="h-4 w-4 mr-2 text-orange-500" />
                    ) : status === 'pending' ? (
                      <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-2" />
                    )
                  ) : (
                    openModules[moduleKey] ? <ChevronDown className="mr-2" /> : <ChevronRight className="mr-2" />
                  )}
                  <span className={isLocked && status !== 'approved' ? "text-gray-500" : ""}>{module.title}</span>
                  {isLocked && getStatusBadge()}
                </div>
            
                {openModules[moduleKey] && !isLocked && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4">
                    <div className="space-y-2">
                      {(module.items || module.lessons || []).map((item: any, itemIndex: number) => (
                        <div 
                          key={itemIndex} 
                          className="flex items-center gap-3 p-2 rounded-md hover:bg-blue-50"
                        >
                          {item.type === "page" && <FileText className="h-4 w-4 text-gray-500" />}
                          {item.type === "assignment" && <ClipboardList className="h-4 w-4 text-gray-500" />}
                          <Link
                            href={`/student/courses/${courseId}/pages/${item.url || item._id}`}
                            className="text-sm text-blue-600 hover:underline flex-1"
                            onClick={(e) => {
                              if (isLocked) {
                                e.preventDefault()
                                setModalStatus(status)
                                setShowPaymentModal(true)
                              }
                            }}
                          >
                            {item.title}
                          </Link>
                          {item.dueDate && (
                            <span className="ml-auto text-xs text-gray-500">
                              {item.dueDate} {item.points}
                            </span>
                          )}
                          {item.status && <span className="ml-auto text-xs text-gray-500">{item.status}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right sidebar for "To Do" and "Recent Feedback" */}
        <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
          <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-base font-semibold text-gray-700">To Do</h3>
            <div className="space-y-3">
              {courseToDoItems.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CircleDot className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">{item.title}</span>
                    <span className="text-xs text-gray-500">
                      {item.points} points • {item.dueDate}
                    </span>
                    <div className="flex flex-wrap gap-1 text-xs text-gray-500">
                      {item.courseGroups.map((group, gIndex) => (
                        <span key={gIndex} className="rounded-full bg-gray-100 px-2 py-0.5">
                          {group}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-base font-semibold text-gray-700">Recent Feedback</h3>
            <div className="space-y-4">
              {recentFeedback.map((feedback, index) => (
                <div key={index} className="flex flex-col">
                  <Link href="#" className="text-sm font-medium text-blue-600 hover:underline">
                    {feedback.title}
                  </Link>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {feedback.status === "Incomplete" ? (
                      <Circle className="h-3 w-3 text-gray-400" />
                    ) : (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    )}
                    <span>{feedback.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{feedback.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}