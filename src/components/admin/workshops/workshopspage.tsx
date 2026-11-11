"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  BookOpen,
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  MoreHorizontal,
  Calendar,
  ExternalLink,
  Loader2,
  RefreshCw,
  Save,
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { getWorkshops, deleteWorkshop, getEvents, getSectionTitle, updateSectionTitle, DEFAULT_SECTION_TITLE } from "@/service/registrationService"
import type { Workshop } from "@/types/workshop-types"
import type { Event } from "@/types/events-types"
import { useToast } from "@/hooks/use-toast"
import { 
  WorkshopListSkeleton, 
  StatsCardsSkeleton, 
  SearchSkeleton, 
  PageHeaderSkeleton 
} from "@/components/skeleton-card"
import { useDeletePermission } from "@/hooks/use-delete-permission"
import { ContactAdminModal } from "@/components/ui/contact-admin-modal"
import { getMediaUrl } from "@/utils/mediaUrl"

export default function WorkshopsManagement() {
  const { isAdmin } = useDeletePermission()
  const [searchTerm, setSearchTerm] = useState("")
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [workshopToDelete, setWorkshopToDelete] = useState<Workshop | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()
  const [sectionTitle, setSectionTitle] = useState(DEFAULT_SECTION_TITLE)
  const [savedSectionTitle, setSavedSectionTitle] = useState(DEFAULT_SECTION_TITLE)
  const [savingTitle, setSavingTitle] = useState(false)

  useEffect(() => {
    fetchData()
    getSectionTitle().then((res) => {
      if (res.data) {
        setSectionTitle(res.data)
        setSavedSectionTitle(res.data)
      }
    })
  }, [])

  const handleSaveSectionTitle = async () => {
    const title = sectionTitle.trim()
    if (!title) {
      toast({ title: "Error", description: "Title cannot be empty" })
      return
    }
    setSavingTitle(true)
    const res = await updateSectionTitle(title)
    setSavingTitle(false)
    if (res.success) {
      setSectionTitle(res.data || title)
      setSavedSectionTitle(res.data || title)
      toast({ title: "Success", description: "Section title updated" })
    } else {
      toast({ title: "Error", description: res.error || "Failed to update title" })
    }
  }

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [workshopsResponse, eventsResponse] = await Promise.all([getWorkshops(), getEvents()])

      if (workshopsResponse.success && workshopsResponse.data) {
        setWorkshops(workshopsResponse.data)
      } else {
        setError(workshopsResponse.error || "Failed to fetch workshops")
        toast({
          title: "Error",
          description: workshopsResponse.error || "Failed to fetch workshops",
        })
      }

      if (eventsResponse.success && eventsResponse.data) {
        setEvents(eventsResponse.data)
      } else {
        // Don't set error for events, just log it
        console.warn("Failed to fetch events:", eventsResponse.error)
      }
    } catch (error) {
      const errorMessage = "Failed to fetch data. Please check your connection."
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const getEventName = (eventRef: string) => {
    const event = events.find((e) => e._id === eventRef)
    return event?.name || "Unknown Event"
  }

  const handleDeleteClick = (workshop: Workshop) => {
    setWorkshopToDelete(workshop)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!workshopToDelete) return

    setDeleting(true)
    try {
      const response = await deleteWorkshop(workshopToDelete._id)
      if (response.success) {
        setWorkshops(workshops.filter((w) => w._id !== workshopToDelete._id))
        toast({
          title: "Success",
          description: "Workshop deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete workshop",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete workshop",
      })
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setWorkshopToDelete(null)
    }
  }

  const filteredWorkshops = workshops.filter(
    (workshop) =>
      workshop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workshop.about.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getEventName(workshop.eventRef).toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Show skeleton if loading OR if there's an error (to prevent showing empty state)
  const shouldShowSkeleton = loading || error

  return (
    <div className="flex flex-1 flex-col gap-4 p-2 sm:p-4 md:gap-6 md:p-6 pt-0 w-full max-w-full">
      {/* Header */}
      {shouldShowSkeleton ? (
        <PageHeaderSkeleton />
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full max-w-full">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight truncate">Workshops Management</h1>
            <p className="text-muted-foreground text-sm md:text-base truncate">
              Manage workshops, registrations, and participant data.
            </p>
          </div>
          {/* Responsive button group: stack on mobile, row on sm+ */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={fetchData} 
              disabled={loading}
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button asChild className="w-full sm:w-auto" suppressHydrationWarning={true}>
              <Link href="/admin/dashboard/workshops/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Workshop
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="overflow-x-auto w-full">
        {shouldShowSkeleton ? (
          <StatsCardsSkeleton />
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full min-w-[320px]">
            <Card className="w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Workshops</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{workshops.length}</div>
                <p className="text-xs text-muted-foreground">Across all events</p>
              </CardContent>
            </Card>
            <Card className="w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Events</CardTitle>
                <Calendar className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{events.length}</div>
                <p className="text-xs text-muted-foreground">Total events</p>
              </CardContent>
            </Card>
            <Card className="sm:col-span-2 lg:col-span-1 w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {workshops.length > 0 ? new Date(workshops[0].createdAt).toLocaleDateString() : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">Last workshop created</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Section Title (shown on home page and sub page) */}
      <Card className="w-full max-w-full">
        <CardHeader>
          <CardTitle className="text-lg">Section Title</CardTitle>
          <CardDescription>
            Heading shown on the home page section and the sub page (e.g. &quot;CHILDREN&apos;S CORNER&quot;).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 w-full max-w-full">
            <Label htmlFor="section-title" className="sr-only">
              Section title
            </Label>
            <Input
              id="section-title"
              value={sectionTitle}
              maxLength={100}
              onChange={(e) => setSectionTitle(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleSaveSectionTitle}
              disabled={savingTitle || !sectionTitle.trim() || sectionTitle.trim() === savedSectionTitle}
              className="w-full sm:w-auto"
            >
              {savingTitle ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Title
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card className="w-full max-w-full">
        <CardHeader>
          <CardTitle className="text-lg">Search Workshops</CardTitle>
        </CardHeader>
        <CardContent>
          {shouldShowSkeleton ? (
            <SearchSkeleton />
          ) : (
            <div className="flex gap-4 w-full max-w-full">
              <div className="flex-1 min-w-0">
                <Label htmlFor="search" className="sr-only">
                  Search workshops
                </Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by name, description, or event..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workshops List */}
      <Card className="w-full max-w-full">
        <CardHeader>
          <CardTitle className="text-lg">All Workshops</CardTitle>
          <CardDescription>
            {shouldShowSkeleton ? "Loading..." : `${filteredWorkshops.length} workshop${filteredWorkshops.length !== 1 ? "s" : ""} found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {shouldShowSkeleton ? (
            <WorkshopListSkeleton />
          ) : (
            <div className="space-y-4 w-full max-w-full">
              {filteredWorkshops.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">No workshops found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {searchTerm ? "Try adjusting your search terms." : "Get started by creating a new workshop."}
                  </p>
                  {!searchTerm && (
                    <div className="mt-6">
                      <Button asChild>
                        <Link href="/admin/dashboard/workshops/create" suppressHydrationWarning={true}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Workshop
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                filteredWorkshops.map((workshop) => (
                  <div
                    key={workshop._id}
                    className="flex flex-col lg:flex-row items-start gap-4 p-4 border rounded-lg w-full max-w-full"
                  >
                    <div className="w-full lg:w-32 h-32 lg:h-24 bg-muted rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={getMediaUrl(workshop.imageUrl) || "/placeholder.svg"}
                        alt={workshop.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-2 w-full lg:w-auto min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
                        <h3 className="text-lg font-semibold truncate">{workshop.name}</h3>
                        <Badge variant="secondary" className="w-fit">
                          {getEventName(workshop.eventRef)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 truncate">{workshop.about}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Created: {new Date(workshop.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {workshop.registrationFormUrl && (
                        <div className="flex items-center gap-2 text-sm">
                          <ExternalLink className="h-4 w-4 text-blue-600" />
                          <a
                            href={workshop.registrationFormUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate"
                          >
                            Registration Form
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" suppressHydrationWarning={true}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/dashboard/workshops/${workshop._id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/dashboard/workshops/${workshop._id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          {workshop.registrationFormUrl && (
                            <DropdownMenuItem asChild>
                              <a href={workshop.registrationFormUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Open Form
                              </a>
                            </DropdownMenuItem>
                          )}
                          {isAdmin ? (
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(workshop)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          ) : (
                            <ContactAdminModal
                              title="Delete Workshop Access Denied"
                              description="You don't have permission to delete workshops. Please contact the administrator for assistance."
                            >
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </ContactAdminModal>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the workshop "{workshopToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
              suppressHydrationWarning={true}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
