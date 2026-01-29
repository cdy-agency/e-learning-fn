import type React from "react"
import { cookies } from "next/headers"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { MainSidebar } from "@/components/student/main-sidebar"
import StudentTopNav from "@/components/student/student-top-nav"
import MobileBottomNav from "@/components/student/mobile-bottom-nav"

export default async function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <MainSidebar />
      <SidebarInset className="bg-content-background text-content-foreground">
        <StudentTopNav />
        <div className="pb-14 lg:pb-0 min-h-screen">{children}</div>
        <MobileBottomNav />
      </SidebarInset>
    </SidebarProvider>
  )
}
