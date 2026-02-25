'use client'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { listExams } from '@/app/lib/api'
import { fetchCourseById } from '@/lib/api/student/courses.api'
import type { Course } from '@/lib/types/course'
import type { Exam } from '@/lib/types/assessments'
import ExamCard from '@/components/assessments/ExamCard'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Skeleton } from '@/components/ui/skeleton'

export default function CourseExamsPage() {
  const params = useParams()
  const courseId = params?.courseId as string
  const [course, setCourse] = useState<Course | null>(null)
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!courseId) return
      try {
        const [c, e] = await Promise.all([
          fetchCourseById(courseId),
          listExams({ course: courseId })
        ])
        if (!mounted) return
        setCourse(c as any)
        if (e.ok) setExams(e.data.exams)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [courseId])

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/student">Student</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/student/courses/${courseId}/home`}>{course?.title ?? 'Course'}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Exams</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="text-2xl font-semibold">Exams for {course?.title ?? 'Course'}</h1>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-24 w-full" />
              </div>
            ))}
          </div>
        ) : exams.length === 0 ? (
          <div className="text-muted-foreground">No exams available for this course.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exams.map(e => (
              <ExamCard key={e._id} exam={e} href={`/student/exams/${e._id}`} cta="Attempt" />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

