"use client"

import { useEffect, useState } from "react"
import {
  BookOpen,
  LayoutDashboard,
  Menu,
  X,
  Users,
  BarChart3,
  Settings,
  UserCheck,
  Award,
  Calendar,
  Bell,
  ChevronDown,
  LogOut,
  ChevronRight,
  LucideMessagesSquare,
  HandCoins,
  CreditCard,
} from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { usePathname } from "next/navigation"
import axios from "axios"
import { API_URL } from "@/lib/axios"
import Link from "next/link"
import { getMyInstitutionProfile } from "@/lib/api/institution"


const navigation = [
  { name: "Dashboard", href: "/institution", icon: LayoutDashboard, badge: null },
  { name: "Payments", href: "/institution/payments", icon: CreditCard, badge: null },
  {
    name: "Course Management",
    href: "/institution/courses",
    icon: BookOpen,
    badge: null,
    // subItems: [
    //   { name: "All Courses", href: "/instructor/courses" },
    //   { name: "Create Course", href: "/instructor/courses/new"},
    //   { name: "Course Analytics", href: "/instructor/analytics" },
    // ],
  },
  { name: "Instructors", href: "/institution/instructors", icon: UserCheck, badge: null },
  
  { 
    name: "Communication", 
    href: "/institution/announcements", 
    icon: Bell, 
    badge: null,
    subItems: [
      { name: "Announcements", href: "/institution/announcements" },
    ]
  },
  { 
    name: "Student Management", 
    href: "/institution/students", 
    icon: Users, 
    badge: null,
    // subItems: [
    //   { name: "All Students", href: "/instructor/students" },
    //   { name: "Enrollments", href: "/instructor/enrollments" },
    //   { name: "Progress Tracking", href: "/instructor/progress" },
    // ]
  },
]

const cn = (...classes: (string | boolean | undefined)[]): string => classes.filter(Boolean).join(' ')

export default function InstitutionSidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const { user } = useAuth()
  const [instructors, setInstructors] = useState<Array<{ name: string; email: string; institution?: { id?: string } }>>([])
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return
        const res = await axios.get(`${API_URL}/api/institutions/instructors/all`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = Array.isArray(res.data) ? res.data : res.data?.instructors || []
        const filtered = user?.institution?.id ? data.filter((i: any) => i?.institution?.id === user.institution.id) : data
        setInstructors(filtered)
      } catch (_e) {
        setInstructors([])
      }
    }
    fetchInstructors()
  }, [user])

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getMyInstitutionProfile()
        const url = res?.institution?.logo || null
        setAvatarUrl(url)
      } catch {}
    }
    loadProfile()
  }, [])

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((item) => item !== itemName)
        : [...prev, itemName]
    )
  }

  const NavItems = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="space-y-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
        const isExpanded = expandedItems.includes(item.name)
        const hasSubItems = item.subItems && item.subItems.length > 0

        return (
          <div key={item.name}>
            <div className="relative">
              <a
                href={item.href}
                className={cn(
                  "flex items-center gap-6 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                  isDesktopCollapsed && !isMobile ? "justify-center" : "",
                  isActive
                    ? "bg-gray-700 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                )}
                onClick={(e) => {
                  if (hasSubItems && !isDesktopCollapsed) {
                    e.preventDefault()
                    toggleExpanded(item.name)
                  }
                  if (isMobile) setIsMobileOpen(false)
                }}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />

                {(!isDesktopCollapsed || isMobile) && (
                  <>
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-blue-600 text-white"
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}

                {hasSubItems && (!isDesktopCollapsed || isMobile) && (
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 ml-2 transition-transform duration-200 text-gray-400",
                      isExpanded && "rotate-180"
                    )}
                  />
                )}
              </a>
            </div>

            {hasSubItems && isExpanded && (!isDesktopCollapsed || isMobile) && (
              <div className="ml-11 mt-1 space-y-1">
                {item.subItems.map((subItem) => {
                  const isSubActive = pathname === subItem.href
                  return (
                    <a
                      key={subItem.name}
                      href={subItem.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                        isSubActive
                          ? "bg-gray-600 text-white"
                          : "text-gray-400 hover:bg-gray-700 hover:text-white",
                      )}
                      onClick={() => isMobile && setIsMobileOpen(false)}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                      {subItem.name}
                    </a>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  const UserProfile = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={cn("border-t border-gray-700 pt-4 mt-4", !isMobile && isDesktopCollapsed ? "px-2" : "px-2")}>
      {(!isDesktopCollapsed || isMobile) && (
        <div className="px-2 mb-3">
          <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider">
            Account
          </h3>
        </div>
      )}
      <Link href='/institution/profile'
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer group",
          !isMobile && isDesktopCollapsed && "justify-center"
        )}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="Institution" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {user?.name?.substring(0, 2).toUpperCase() || 'NA'}
          </div>
        )}
        {(!isDesktopCollapsed || isMobile) && (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-gray-400 text-xs truncate">
                {user?.email || ''}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </>
        )}
      </Link>
    </div>
  )

  return (
    <div className="flex min-h-screen">
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg shadow-lg"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full w-80 bg-gray-800 transform transition-transform duration-300 z-50 md:hidden",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Mobile Header */}
          <div className="flex items-center p-4 border-b border-gray-700">
            <button
              className="text-white hover:bg-gray-700 p-2 rounded-lg mr-3"
              onClick={() => setIsMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-lg">{user?.institution?.name || 'Institution'}</span>
            </div>
          </div>

          <nav className="flex-1 px-2 py-4 overflow-y-auto">
            <NavItems isMobile />
          </nav>
          <UserProfile isMobile />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden md:flex h-screen flex-col bg-gray-800 transition-all duration-300",
        isDesktopCollapsed ? "w-20" : "w-64"
      )}>
        {/* Desktop Header */}
        <div className="flex items-center p-4 border-b border-gray-700">
          <button
            className="text-white hover:bg-gray-700 p-2 rounded-lg mr-3"
            onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
          >
            <Menu className="h-5 w-5" />
          </button>
          {!isDesktopCollapsed && (
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-lg">{user?.institution?.name || 'Institution'}</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          <NavItems />
        </nav>

        <UserProfile />
      </div>
      </div>
  )
}