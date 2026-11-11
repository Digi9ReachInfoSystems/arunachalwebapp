"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Users,
  FileText,
  Mic,
  BookOpen,
  TrendingUp,
  Plus,
  Eye,
  BarChart3,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCookie } from "@/lib/cookies";
import ProtectedRoute from "@/components/auth/protected-route";
import UserProfileCard from "@/components/admin/UserProfileCard";
import { getAllEvents } from "@/service/events-apis";
import { getAllUsers } from "@/service/userServices";
import { getBlogs } from "@/service/newsAndBlogs";
import { getSpeakersGrouped } from "@/service/speaker";
import { getAllImages } from "@/service/archive";
import DashboardLoading from "@/components/admin/dashboard/DashboardLoading";
import DashboardError from "@/components/admin/dashboard/DashboardError";
import { getCookieViewCount } from "@/service/getCookiesServices";
import { ViewCounter } from "@/types/viewCounter-types";
import { getMediaUrl } from "@/utils/mediaUrl";

export default function AdminDashboard() {
  // State for API data
  const [stats, setStats] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [topSpeakers, setTopSpeakers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showAllSpeakers, setShowAllSpeakers] = useState(false);
  const [archiveLoading, setArchiveLoading] = useState(true);
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [archiveStats, setArchiveStats] = useState<{
    total: number;
    recent: any[];
  }>({ total: 0, recent: [] });
  const [getView, setGetView] = useState<ViewCounter[]>([]);
  useEffect(() => {
    setUserRole(getCookie("userRole"));
  }, []);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch all data in parallel
        const [eventsRes, usersRes, blogsRes, speakersRes] = await Promise.all([
          getAllEvents(),
          getAllUsers(),
          getBlogs(),
          getSpeakersGrouped(),
        ]);
        // Stats

        let totalEvents = 0;
        if (eventsRes.success && eventsRes.data) {
          if (Array.isArray(eventsRes.data)) {
            totalEvents = eventsRes.data.length;
          } else if (Array.isArray(eventsRes.data.event)) {
            totalEvents = eventsRes.data.event.length;
          } else {
            totalEvents = 1;
          }
        }
        setStats([
          {
            title: "Total Events",
            value: totalEvents,
            change: "-",
            icon: Calendar,
            color: "text-blue-600",
            trend: "up",
          },
          {
            title: "Active Users",
            value: usersRes.success && usersRes.data ? usersRes.data.length : 0,
            change: "-",
            icon: Users,
            color: "text-green-600",
            trend: "up",
          },
          {
            title: "Published Content",
            value: blogsRes.success && blogsRes.data ? blogsRes.data.length : 0,
            change: "-",
            icon: FileText,
            color: "text-purple-600",
            trend: "up",
          },
          {
            title: "Total Speakers",
            value:
              speakersRes.success && speakersRes.data
                ? speakersRes.data.years.reduce(
                    (sum, y) => sum + y.speakers.length,
                    0,
                  )
                : 0,
            change: "-",
            icon: Mic,
            color: "text-orange-600",
            trend: "up",
          },
        ]);
        // Recent Activity (example: show latest blogs, events, users, speakers)
        setRecentActivity([
          ...(blogsRes.success && blogsRes.data
            ? blogsRes.data.slice(0, 2).map((b: any) => ({
                id: b._id,
                type: "content",
                title: `Blog published: ${b.title}`,
                time: b.createdAt
                  ? new Date(b.createdAt).toLocaleString()
                  : "-",
                user: b.author || "-",
              }))
            : []),
          ...(eventsRes.success &&
          eventsRes.data &&
          Array.isArray(eventsRes.data.event)
            ? eventsRes.data.event.slice(0, 2).map((e: any) => ({
                id: e._id,
                type: "event",
                title: `Event: ${e.eventName || e.name}`,
                time: e.createdAt
                  ? new Date(e.createdAt).toLocaleString()
                  : "-",
                user: e.createdBy || "-",
              }))
            : []),
          ...(usersRes.success && usersRes.data
            ? usersRes.data.slice(0, 1).map((u: any) => ({
                id: u._id,
                type: "user",
                title: `New user registered: ${u.name || u.email}`,
                time: u.createdAt
                  ? new Date(u.createdAt).toLocaleString()
                  : "-",
                user: "System",
              }))
            : []),
        ]);
        // Upcoming Events (show next 2 events)
        setUpcomingEvents(
          eventsRes.success &&
            eventsRes.data &&
            Array.isArray(eventsRes.data.event)
            ? eventsRes.data.event.slice(0, 2).map((e: any) => ({
                id: e._id,
                name: e.eventName || e.name,
                date: e.eventDate || e.startDate || "-",
                location: e.venue || "-",
                status: e.status || "upcoming",
                registrations: e.registrationsCount || 0,
              }))
            : []
        );
        // Top Speakers (show top 3 by sessions or rating)
        setTopSpeakers(
          speakersRes.success && speakersRes.data
            ? speakersRes.data.years
                .flatMap((y) => y.speakers)
                .slice(0, 3)
                .map((s) => ({
                  id: s._id,
                  name: s.name,
                  sessions: 0,
                  rating: 0,
                  avatar: s.image_url || "/placeholder.svg?height=40&width=40",
                }))
            : []
        );
      } catch (err: any) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

 useEffect(() => {
  const fetchViewCount = async () => {
    try {
      const viewResponse = await getCookieViewCount();
      
      if (viewResponse && viewResponse.data) {
        setGetView(viewResponse.data);
      } else {
        console.warn("No data in view count response");
      }
    } catch (error) {
      console.error("Error fetching view count:", error);
    }
  };

  fetchViewCount();
}, []);
  useEffect(() => {
    async function fetchArchive() {
      setArchiveLoading(true);
      setArchiveError(null);
      try {
        const res = await getAllImages();
        if (res.success && res.data && Array.isArray(res.data.archive)) {
          setArchiveStats({
            total: res.data.archive.length,
            recent: res.data.archive.slice(0, 3),
          });
        } else {
          setArchiveStats({ total: 0, recent: [] });
        }
      } catch (err) {
        setArchiveError("Failed to load archive data.");
      } finally {
        setArchiveLoading(false);
      }
    }
    fetchArchive();
  }, []);

  const isAdmin = userRole === "admin";

  // Loading and error states
  if (loading) {
    return <DashboardLoading />;
  }
  if (error) {
    return <DashboardError message={error} />;
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "user"]}>
      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        {/* Welcome Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {isAdmin ? "Admin" : "User"}!
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your Arunachal Literature platform
              today.
            </p>
          </div>
          {isAdmin && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild>
                <Link href="/admin/dashboard/content/create">
                  <Plus className="mr-2 h-4 w-4" />
                  New Content
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/dashboard/events/create">
                  <Calendar className="mr-2 h-4 w-4" />
                  New Event
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Stats Cards - Only show for admin */}
        {isAdmin && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                    {stat.change}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* User Profile Card - Show for users */}
          {!isAdmin && (
            <div className="lg:col-span-2">
              <UserProfileCard />
            </div>
          )}

          {/* Recent Activity - Only show for admin */}
          {isAdmin && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>
                      Latest actions and updates on your platform
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/dashboard/content/blogs">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{activity.time}</span>
                          <span>•</span>
                          <span>by {activity.user}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Speakers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Top Speakers
              </CardTitle>
              <CardDescription>Most active speakers this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(showAllSpeakers ? topSpeakers : topSpeakers.slice(0, 3)).map(
                  (speaker, index) => (
                    <div key={speaker.id} className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
                        {index + 1}
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={getMediaUrl(speaker.avatar) || "/placeholder.svg"}
                          alt={speaker.name}
                        />
                        <AvatarFallback>
                          {speaker.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{speaker.name}</p>
                      </div>
                    </div>
                  )
                )}
                {topSpeakers.length > 3 && (
                  <div className="flex justify-end pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllSpeakers((prev) => !prev)}
                      className="text-xs"
                    >
                      {showAllSpeakers ? "Show Less" : "See More"}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events (replaced with Archive Overview) */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Archive Overview
                  </CardTitle>
                  <CardDescription>
                    Recent uploads and archive stats
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {archiveLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-1/2" />
                  <div className="h-10 bg-gray-100 rounded w-full" />
                  <div className="h-10 bg-gray-100 rounded w-full" />
                </div>
              ) : archiveError ? (
                <div className="text-red-500 text-sm">{archiveError}</div>
              ) : archiveStats.total === 0 ? (
                <div className="text-muted-foreground text-sm">
                  No archive images found.
                </div>
              ) : (
                <>
                  <div className="text-lg font-bold mb-2">
                    Total Images: {archiveStats.total}
                  </div>
                  <div className="space-y-2">
                    {archiveStats.recent.map((img: any) => (
                      <div key={img._id} className="flex items-center gap-3">
                        <img
                          src={getMediaUrl(img.image_url) || "/file.svg"}
                          alt={img.originalName || "Archive Image"}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="truncate text-sm font-medium">
                            {img.originalName || "Untitled"}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {img.createdAt
                              ? new Date(img.createdAt).toLocaleDateString()
                              : ""}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                {isAdmin ? "Common administrative tasks" : "Available actions"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/admin/dashboard/content/blogs">
                    <FileText className="mr-2 h-4 w-4" />
                    View Content
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/admin/dashboard/events">
                    <Calendar className="mr-2 h-4 w-4" />
                    View Events
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link href="/admin/dashboard/speakers">
                    <Mic className="mr-2 h-4 w-4" />
                    View Speakers
                  </Link>
                </Button>
                {isAdmin && (
                  <Button variant="outline" className="justify-start" asChild>
                    <Link href="/admin/dashboard/users">
                      <Users className="mr-2 h-4 w-4" />
                      Manage Users
                    </Link>
                  </Button>
                )}
                {isAdmin && (
                  <Button variant="outline" className="justify-start" asChild>
                    <Link href="/admin/dashboard/workshops">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Manage Children&apos;s Corner
                    </Link>
                  </Button>
                )}
              </div>
              {!isAdmin && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Note: Some features are only available to admins.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </ProtectedRoute>
  );
}
