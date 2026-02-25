"use client"

import type React from "react"
import { useState } from "react"

import { SidebarProvider } from "@/components/ui/sidebar"
import { MainSidebar, ICON_W, FULL_W } from "@/components/student/main-sidebar"
import StudentTopNav from "@/components/student/student-top-nav"
import MobileBottomNav from "@/components/student/mobile-bottom-nav"

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <SidebarProvider>
      <MainSidebar hovered={hovered} setHovered={setHovered} />

      <div
        style={{
          marginLeft: hovered ? FULL_W : ICON_W,
          transition: "margin-left 220ms cubic-bezier(0.4,0,0.2,1)",
        }}
        className="flex-1 bg-content-background text-content-foreground min-h-screen"
      >
        <StudentTopNav />
        <div className="pb-14 lg:pb-0">{children}</div>
        <MobileBottomNav />
      </div>
    </SidebarProvider>
  )
}