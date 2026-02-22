"use client"

import { ClipboardList, Calendar, Clock, CheckCircle, Circle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAssignmentsByCourse } from "@/lib/hooks/assignments"
import { useParams } from "next/navigation"

interface AssignmentItem {
  priority: string
  _id: string
  title: string
  points?: number
  due_date?: string
  status?: string
  submitted?: boolean
  type?: string
}

export default function CourseAssignmentsPage() {
  const params = useParams()
  const courseId = params.courseId as string
  const { data: assignmentsData = [], isLoading } = useAssignmentsByCourse(courseId)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "upcoming":
        return "text-red-600 bg-red-50 border-red-200"
      case "undated":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "past":
        return "text-gray-600 bg-gray-50 border-gray-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getStatusIcon = (submitted: boolean, priority: string) => {
    if (submitted) {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    }
    if (priority === "upcoming") {
      return <AlertCircle className="h-5 w-5 text-red-600" />
    }
    return <Circle className="h-5 w-5 text-gray-400" />
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-white px-4 md:px-6">
        <h1 className="text-sm font-semibold text-gray-900">
          <Link href={`/student/courses/${courseId}/home`} className="text-blue-600 hover:underline">
            Communicating_for_Impact
          </Link>{" "}
          <span className="text-gray-400">›</span> Assignments
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" className="h-8 text-sm bg-transparent border-gray-300">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar View
          </Button>
          <Button variant="outline" className="h-8 text-sm bg-transparent border-gray-300">
            <ClipboardList className="h-4 w-4 mr-2" />
            List View
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        {/* Assignment Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">Total Assignments</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{assignmentsData.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-900">Completed</span>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {assignmentsData.filter(a => a).length}
            </p>
          </div>
        </div>

        {/* Assignments List */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">All Assignments</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {assignmentsData.map((assignment: any) => (
              <div key={assignment._id || assignment.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(!!assignment.submitted, assignment.priority)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/student/assignments/${assignment._id || assignment.id}`}
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          {assignment.title}
                        </Link>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(assignment.priority)}`}>
                          {assignment.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-500">{assignment.points ? `${assignment.points} pts` : ''}</span>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          {assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : (assignment.due_date ? new Date(assignment.due_date).toLocaleString() : '')}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{assignment.status || ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {assignment.submitted ? (
                      <Button variant="outline" className="h-8 text-sm bg-transparent border-gray-300">
                        View Submission
                      </Button>
                    ) : (
                      <Button className="h-8 text-sm">
                        Submit Assignment
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
