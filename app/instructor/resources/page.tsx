import { Suspense } from "react"
import InstructorResourcesClient from '@/components/instructor/resources/instructor-resources-client'

export default function InstructorResourcesPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading resources...</div>}>
      <InstructorResourcesClient />
    </Suspense>
  )
}
