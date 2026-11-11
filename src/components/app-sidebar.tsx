"use client"

import * as React from "react"
import {
  BookOpen,
  FileText,
  Users,
  Calendar,
  Home,
  Globe,
  Link as LinkIcon,
  Archive,
  ImageIcon,
  Mic,
  Video,
  User as UserIcon,
  MessageSquare,
} from "lucide-react"
import { toast } from "sonner"
import { logoutUser } from "@/service/authService"
import { getMyProfile } from "@/service/userServices"
import { setCookie, getCookie } from "@/lib/cookies"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import type { User } from "@/types/user-types"
import { title } from "process"

// Admin-specific navigation data
const adminNavData = {
  teams: [
    {
      name: "Arunachal Literature",
      logo: "/logo.png",
      plan: "Admin",
    },
  ],
   navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: Home,
      isActive: true,
      items:[
        {
          title: "Main",
          url: "/admin/dashboard",
        },
      ]
    },
    {
      title: "Events",
      url: "/admin/dashboard/events",
      icon: Calendar,
      items: [
        {
          title: "All Events",
          url: "/admin/dashboard/events",
        },
        {
          title: "Create Event",
          url: "/admin/dashboard/events/create",
        },
        {
          title: "Add Time Slot",
          url: "/admin/dashboard/events/add-time",
        },
             {
          title:"Add Pdf",
          url:"/admin/dashboard/events/addpdf"
        },
        {
          title: "Schedule Images",
          url: "/admin/dashboard/events/schedule-images",
        },

      ],
    },
    {
      title: "Speakers",
      url: "/admin/dashboard/speakers",
      icon: Mic,
      items: [
        {
          title: "All Speakers",
          url: "/admin/dashboard/speakers",
        },
        {
          title: "Add Speaker",
          url: "/admin/dashboard/speakers/create",
        },
      ],
    },
    {
      title: "Team",
      url: "/admin/dashboard/team",
      icon: Users,
      items: [
        {
          title: "All Team",
          url: "/admin/dashboard/team",
        },
        {
          title: "Add Team",
          url: "/admin/dashboard/team/create",
        },
      ],
    },
        {
      title: "Archives",
      url: "/admin/dashboard/archive",
      icon: Archive,
      items: [
        {
          title: "All Archives",
          url: "/admin/dashboard/archive",
        },
        {
          title: "Add Archive",
          url: "/admin/dashboard/archive/add-year",
        },
        {
          title: "Upload Image",
          url: "/admin/dashboard/archive/upload",
        },
      ]
      
    },
    {
      title: "Videos",
      url: "/admin/dashboard/videos",
      icon: Video,
      items: [
        {
          title: "All Videos",
          url: "/admin/dashboard/videos",
        },
        {
          title: "Add Video",
          url: "/admin/dashboard/videos/add",
        },
      ],
    },
    {
      title: "Content",
      url: "/admin/dashboard/content",
      icon: FileText,
      items: [
        {
          title: "News & Blogs",
          url: "/admin/dashboard/content/blogs",
        },
        {
          title: "Create Content",
          url: "/admin/dashboard/content/create",
        },
        {
          title: "Categories",
          url: "/admin/dashboard/content/category",
        },
      ],
    },
    {
      title:"Home",
      url:"/admin/dashboard/home",
      icon:ImageIcon,
      items:[
        {
          title:"Home",
          url:"/admin/dashboard/home"
        },
        {
          title:"Poetry",
          url:"/admin/dashboard/home/poetry"
        },
        {
          title:"Testimonials",
          url:"/admin/dashboard/home/testimonials"
        },
        {
          title:"Intro",
          url:"/admin/dashboard/home/into"
        },
        {
          title:"contact",
          url:"/admin/dashboard/home/contact"
        }
      ]
    },
    {
      title: "Children's Corner",
      url: "/admin/dashboard/workshops",
      icon: BookOpen,
      items: [
        {
          title: "All Items",
          url: "/admin/dashboard/workshops",
        },
        {
          title: "Add Item",
          url: "/admin/dashboard/workshops/create",
        },
      ],
    },
    {
      title: "Users",
      url: "/admin/dashboard/users",
      icon: Users,
      items: [
        {
          title: "All Users",
          url: "/admin/dashboard/users",
        },
        {
          title: "Add User",
          url: "/admin/dashboard/users/create",
        },
      ],
    },
    {
      title:"Contact Us",
      url:"/admin/dashboard/contactus",
      icon: MessageSquare,
      items:[
        {
          title:"All Messages",
          url:"/admin/dashboard/contactus"
        },
      ]
    }
  ],
  projects: [
    {
      name: "Website Frontend",
      url: "/",
      icon: Globe,
    },
  ],
}

// User-specific navigation data (simplified navigation)
const userNavData = {
  teams: [
    {
      name: "Arunachal Literature",
      logo: "/logo.png",
      plan: "User",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: Home,
      isActive: true,
      items:[
        {
          title: "Main",
          url: "/admin/dashboard",
        },
      ]
    },
    {
      title: "Events",
      url: "/admin/dashboard/events",
      icon: Calendar,
      items: [
        {
          title: "All Events",
          url: "/admin/dashboard/events",
        },
      ],
    },
    {
      title: "Speakers",
      url: "/admin/dashboard/speakers",
      icon: Mic,
      items: [
        {
          title: "All Speakers",
          url: "/admin/dashboard/speakers",
        },
      ],
    },
    {
      title: "Team",
      url: "/admin/dashboard/team",
      icon: Users,
      items: [
        {
          title: "All Team",
          url: "/admin/dashboard/team",
        },
        {
          title: "Add Team",
          url: "/admin/dashboard/team/create",
        },
      ],
    },
    {
      title: "Archives",
      url: "/admin/dashboard/archive",
      icon: Archive,
      items: [
        {
          title: "All Archives",
          url: "/admin/dashboard/archive",
        },
      ]
    },
    {
      title: "Videos",
      url: "/admin/dashboard/videos",
      icon: Video,
      items: [
        {
          title: "All Videos",
          url: "/admin/dashboard/videos",
        },
      ],
    },
    {
      title: "Content",
      url: "/admin/dashboard/content",
      icon: FileText,
      items: [
        {
          title: "News & Blogs",
          url: "/admin/dashboard/content/blogs",
        },
      ],
    },
    {
      title: "My Profile",
      url: "/admin/dashboard/profile",
      icon: UserIcon,
    },
  ],
  projects: [
    {
      name: "Website Frontend",
      url: "/",
      icon: Globe,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userData, setUserData] = useState<User | null>(null)
  const [sidebarData, setSidebarData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const profileResponse = await getMyProfile()
        
        if (profileResponse.success && profileResponse.data) {
          const user = profileResponse.data
          setUserData(user)
          setUserRole(user.role)
          
          // Set navigation data based on user role
          if (user.role === "admin") {
            setSidebarData(adminNavData)
          } else {
            setSidebarData(userNavData)
          }
        } else {
          // Fallback to cookie role if API fails
          const role = getCookie("userRole")
          setUserRole(role)
          
          if (role === "admin") {
            setSidebarData(adminNavData)
          } else {
            setSidebarData(userNavData)
          }
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error)
        // Fallback to cookie role
        const role = getCookie("userRole")
        setUserRole(role)
        
        if (role === "admin") {
          setSidebarData(adminNavData)
        } else {
          setSidebarData(userNavData)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      await logoutUser({ message: "", success: true })
      setCookie("userRole", "", { days: -1 })
      toast.success("Logged out successfully")
      router.replace("/login")
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || "Logout failed")
    }
  }, [router])

  if (loading || !sidebarData || !userData) {
    return null
  }

  // Create user object for NavUser component
  const userForNav = {
    name: userData.name,
    email: userData.email,
            avatar: "/placeholder.svg",
    initials: userData.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2),
    role: userData.role
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData.navMain} />
        {/* <NavProjects projects={sidebarData.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userForNav} onLogout={handleLogout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
