"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { ResourceList } from "@/components/instructor/resources/resource-list"
import { AddResourceForm } from "@/components/instructor/resources/add-resources"
import { Button } from "@/components/ui/button"

export default function InstructorResourcesClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const lessonId = searchParams.get("lesson_id") || ""

  if (!lessonId) {
    return (
      <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-6">
        <h1 className="text-xl font-semibold mb-2">
          Missing lesson ID parameter.
        </h1>
        <p className="text-gray-600 mb-4">
          Expected URL format:{" "}
          <code>/instructor/resources?lesson_id=YOUR_LESSON_ID</code>
        </p>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lesson Resources</h1>
      </div>
      <ResourceList lessonId={lessonId} />
      <div className="max-w-2xl">
        <h2 className="text-lg font-semibold mb-2">Add Resource</h2>
        <AddResourceForm lessonId={lessonId} onSuccess={() => {}} />
      </div>
    </div>
  )
}
