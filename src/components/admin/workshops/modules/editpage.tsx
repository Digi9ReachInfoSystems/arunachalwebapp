"use client"

import type React from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, Save, ArrowLeft, Upload, Loader2, X, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { updateWorkshop, getWorkshops, getEvents } from "@/service/registrationService"
import type { Workshop, UpdateWorkshopData } from "@/types/workshop-types"
import type { Event } from "@/types/events-types"
import { useToast } from "@/hooks/use-toast"
import { FormSkeleton, PageHeaderSkeleton } from "@/components/skeleton-card"
import { getMediaUrl } from "@/utils/mediaUrl"

export default function EditWorkshop() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<UpdateWorkshopData>({
    name: "",
    about: "",
    imageUrl: "",
    registrationFormUrl: "",
  })
  const [uploadedImage, setUploadedImage] = useState<string>("")

  useEffect(() => {
    fetchData()
  }, [params.id])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [workshopsResponse, eventsResponse] = await Promise.all([getWorkshops(), getEvents()])

      if (workshopsResponse.success && workshopsResponse.data) {
        const foundWorkshop = workshopsResponse.data.find((w) => w._id === params.id)
        if (foundWorkshop) {
          setWorkshop(foundWorkshop)
          setFormData({
            name: foundWorkshop.name,
            about: foundWorkshop.about,
            imageUrl: foundWorkshop.imageUrl,
            registrationFormUrl: foundWorkshop.registrationFormUrl,
          })
        } else {
          setError("Item not found")
          toast({
            title: "Error",
            description: "Item not found",
          })
          router.push("/admin/dashboard/workshops")
        }
      } else {
        setError(workshopsResponse.error || "Failed to fetch item")
        toast({
          title: "Error",
          description: workshopsResponse.error || "Failed to fetch item",
        })
      }

      if (eventsResponse.success && eventsResponse.data) {
        setEvents(eventsResponse.data)
      } else {
        // Don't set error for events, just log it
        console.warn("Failed to fetch events:", eventsResponse.error)
      }
    } catch (error) {
      const errorMessage = "Failed to fetch item. Please check your connection."
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
    return event?.name || eventRef
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "Please select a valid image file",
        })
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size should be less than 5MB",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string)
        setFormData((prev) => ({ ...prev, imageUrl: "" }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setUploadedImage("")
    setFormData((prev) => ({ ...prev, imageUrl: "" }))
  }

  const validateForm = () => {
    if (!formData.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required",
      })
      return false
    }

    if (!formData.about?.trim()) {
      toast({
        title: "Validation Error",
        description: "Description is required",
      })
      return false
    }

    // Registration form URL is optional; if given it must be a Google Forms URL
    const formUrl = formData.registrationFormUrl?.trim() || ""
    if (formUrl && !formUrl.startsWith('https://docs.google.com/forms/')) {
      toast({
        title: "Validation Error",
        description: "Registration Form URL must be a Google Forms link (https://docs.google.com/forms/...)",
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!workshop) return

    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    try {
      const updateData: UpdateWorkshopData = {
        name: formData.name?.trim() || "",
        about: formData.about?.trim() || "",
        registrationFormUrl: formData.registrationFormUrl?.trim() || "",
      }

      // Only include image if a new one is uploaded
      if (uploadedImage) {
        updateData.imageUrl = uploadedImage
        console.log("Updating with new image, base64 length:", uploadedImage.length)
      } else {
        console.log("No new image uploaded, keeping existing image")
      }

      console.log("Sending update data:", { 
        ...updateData, 
        imageUrl: uploadedImage ? "base64_data_present" : "no_new_image" 
      })

      const response = await updateWorkshop(workshop._id, updateData)
      if (response.success) {
        console.log("Update successful, redirecting to workshops list")
        toast({
          title: "Success",
          description: "Item updated successfully",
        })
        
        // Try different navigation approaches
        try {
          await router.push("/admin/dashboard/workshops")
          console.log("Router push completed")
        } catch (navError) {
          console.error("Navigation error:", navError)
          // Fallback to window.location
          window.location.href = "/admin/dashboard/workshops"
        }
      } else {
        console.error("API Error Response:", response)
        toast({
          title: "Error",
          description: response.error || "Failed to update item",
        })
      }
    } catch (error) {
      console.error("Submit Error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // Show skeleton if loading OR if there's an error (to prevent showing empty form)
  const shouldShowSkeleton = loading || error

  return (
    <div className="flex flex-1 flex-col gap-4 p-2 sm:p-4 md:gap-6 md:p-6 pt-0 w-full max-w-full">
      {/* Header */}
      {shouldShowSkeleton ? (
        <PageHeaderSkeleton />
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full max-w-full">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight truncate">Edit Children&apos;s Corner Item</h1>
            <p className="text-muted-foreground text-sm md:text-base truncate">
              Update item information and details.
            </p>
            {workshop && (
              <p className="text-sm text-muted-foreground mt-1 truncate">
                Event: {getEventName(workshop.eventRef)}
              </p>
            )}
          </div>
          {/* Responsive button group: stack on mobile, row on sm+ */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={fetchData} 
              disabled={loading}
              className="w-full sm:w-auto bg-transparent"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto bg-transparent" suppressHydrationWarning={true}>
              <Link href="/admin/dashboard/workshops">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Children&apos;s Corner
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Item Details
          </CardTitle>
          <CardDescription>Update the information for this item.</CardDescription>
        </CardHeader>
        <CardContent>
          {shouldShowSkeleton ? (
            <FormSkeleton />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    required
                    suppressHydrationWarning={true}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventRef">Associated Event</Label>
                  <Input
                    id="eventRef"
                    value={workshop ? getEventName(workshop.eventRef) : ""}
                    disabled
                    className="bg-muted"
                    suppressHydrationWarning={true}
                  />
                  <p className="text-xs text-muted-foreground">Event cannot be changed after creation</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="about">About *</Label>
                <Textarea
                  id="about"
                  name="about"
                  placeholder="Enter description and details"
                  value={formData.about || ""}
                  onChange={handleChange}
                  rows={6}
                  required
                  suppressHydrationWarning={true}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationFormUrl">Registration Form URL (optional)</Label>
                <Input
                  id="registrationFormUrl"
                  name="registrationFormUrl"
                  type="url"
                  placeholder="https://docs.google.com/forms/..."
                  value={formData.registrationFormUrl || ""}
                  onChange={handleChange}
                  suppressHydrationWarning={true}
                />
                <p className="text-xs text-muted-foreground">Optional. If added, must be a Google Forms URL</p>
              </div>

              <div className="space-y-4">
                <Label>Image</Label>
                <p className="text-xs text-muted-foreground">Upload a new image to replace the current one</p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Current Image</Label>
                    <div className="w-full max-w-md h-48 bg-muted rounded-md overflow-hidden border">
                      <img
                        src={getMediaUrl(workshop?.imageUrl || "") || "/placeholder.svg"}
                        alt="Current image"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = "none"
                          const parent = target.parentElement
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-full h-full flex items-center justify-center text-muted-foreground">
                                <p>Image not found</p>
                              </div>
                            `
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Upload New Image (Optional)</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="file"
                        id="imageFile"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        suppressHydrationWarning={true}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto bg-transparent"
                        onClick={() => document.getElementById("imageFile")?.click()}
                        suppressHydrationWarning={true}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Choose New Image
                      </Button>
                      <p className="text-xs text-muted-foreground self-center">
                        Max size: 5MB. Supported: JPG, PNG, GIF
                      </p>
                    </div>
                  </div>

                  {/* New Image Preview */}
                  {uploadedImage && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">New Image Preview</Label>
                        <Button type="button" variant="ghost" size="sm" onClick={removeImage} className="h-auto p-1" suppressHydrationWarning={true}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="w-full max-w-md h-48 bg-muted rounded-md overflow-hidden border">
                        <img
                          src={uploadedImage}
                          alt="New image preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = "none"
                            const parent = target.parentElement
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center text-muted-foreground">
                                  <p>Image not found or invalid URL</p>
                                </div>
                              `
                            }
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">New image preview</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button type="submit" disabled={submitting} className="w-full sm:w-auto" suppressHydrationWarning={true}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Item
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" asChild className="w-full sm:w-auto bg-transparent" suppressHydrationWarning={true}>
                  <Link href="/admin/dashboard/workshops">Cancel</Link>
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
