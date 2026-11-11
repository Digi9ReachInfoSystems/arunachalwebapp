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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Save, ArrowLeft, Upload, Loader2, X, Plus, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { addWorkshop, getEvents } from "@/service/registrationService"
import type { Event } from "@/types/events-types"
import type { CreateWorkshopData } from "@/types/workshop-types"
import { useToast } from "@/hooks/use-toast"
import { FormSkeleton, PageHeaderSkeleton } from "@/components/skeleton-card"

export default function CreateWorkshop() {
  const router = useRouter()
  const { toast } = useToast()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<CreateWorkshopData>({
    name: "",
    about: "",
    imageUrl: "",
    registrationFormUrl: "",
    eventRef: "",
  })
  const [uploadedImage, setUploadedImage] = useState<string>("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getEvents()
      if (response.success && response.data) {
        setEvents(response.data)
      } else {
        setError(response.error || "Failed to fetch events")
        toast({
          title: "Error",
          description: response.error || "Failed to fetch events",
        })
      }
    } catch (error) {
      const errorMessage = "Failed to fetch events. Please check your connection."
      setError(errorMessage)
      console.error("Error fetching events:", error)
      toast({
        title: "Error",
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Error",
          description: "Please select a valid image file",
        })
        return
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size should be less than 5MB",
        })
        return
      }

      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        console.log("Image uploaded, base64 length:", result?.length)
        setUploadedImage(result)
        setFormData((prev) => ({ ...prev, imageUrl: "" })) // Clear URL if file is uploaded
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setUploadedImage("")
    setImageFile(null)
    setFormData((prev) => ({ ...prev, imageUrl: "" }))
  }

  const validateForm = () => {
    console.log("Validating form:", {
      name: formData.name,
      about: formData.about,
      eventRef: formData.eventRef,
      uploadedImage: uploadedImage ? "present" : "missing",
      registrationFormUrl: formData.registrationFormUrl
    })

    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required",
      })
      return false
    }

    if (!formData.about.trim()) {
      toast({
        title: "Validation Error",
        description: "Description is required",
      })
      return false
    }

    if (!formData.eventRef) {
      toast({
        title: "Validation Error",
        description: "Please select an event",
      })
      return false
    }

    // Backend requires image upload (not URL)
    if (!uploadedImage) {
      toast({
        title: "Validation Error",
        description: "Please upload an image file (URLs are not supported)",
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

    console.log("Form validation passed")
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    try {
      // Prepare the data to send
      const workshopData = {
        name: formData.name.trim(),
        about: formData.about.trim(),
        registrationFormUrl: formData.registrationFormUrl.trim(),
        imageUrl: uploadedImage, // This should be base64 data from file upload
        eventRef: formData.eventRef,
      }

      console.log("Sending workshop data:", { 
        ...workshopData, 
        imageUrl: uploadedImage ? "base64_data_present" : "no_image" 
      })

      const response = await addWorkshop(formData.eventRef, workshopData)

      if (response.success) {
        toast({
          title: "Success",
          description: "Children's Corner item created successfully",
        })
        router.push("/admin/dashboard/workshops")
      } else {
        console.error("API Error Response:", response)
        toast({
          title: "Error",
          description: response.error || "Failed to create item",
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

  const handleSelectChange = (value: string) => {
    setFormData({
      ...formData,
      eventRef: value,
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
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight truncate">Add Children&apos;s Corner Item</h1>
            <p className="text-muted-foreground text-sm md:text-base truncate">Add a new item to Children&apos;s Corner.</p>
          </div>
          {/* Responsive button group: stack on mobile, row on sm+ */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={fetchEvents} 
              disabled={loading}
              className="w-full sm:w-auto bg-transparent"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Events
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
          <CardDescription>Fill in the information for the new item.</CardDescription>
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
                    value={formData.name}
                    onChange={handleChange}
                    required
                    suppressHydrationWarning={true}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eventRef">Associated Event *</Label>
                  <Select value={formData.eventRef} onValueChange={handleSelectChange} required>
                    <SelectTrigger suppressHydrationWarning={true}>
                      <SelectValue placeholder="Select an event" />
                    </SelectTrigger>
                    <SelectContent>
                      {loading ? (
                        <SelectItem value="loading" disabled>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading events...
                        </SelectItem>
                      ) : events.length === 0 ? (
                        <SelectItem value="no-events" disabled>
                          No events available
                        </SelectItem>
                      ) : (
                        events.map((event) => (
                          <SelectItem key={event._id} value={event._id}>
                            {event.name} ({event.year})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="about">About *</Label>
                <Textarea
                  id="about"
                  name="about"
                  placeholder="Enter description and details"
                  value={formData.about}
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
                  value={formData.registrationFormUrl}
                  onChange={handleChange}
                  suppressHydrationWarning={true}
                />
                <p className="text-xs text-muted-foreground">Optional. If added, must be a Google Forms URL</p>
              </div>

              <div className="space-y-4">
                <Label>Image *</Label>
                <p className="text-xs text-muted-foreground">Image upload is required</p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Upload Image File</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="file"
                        id="imageFile"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        required
                        suppressHydrationWarning={true}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto bg-transparent"
                        onClick={() => document.getElementById("imageFile")?.click()}
                        disabled={uploading}
                        suppressHydrationWarning={true}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {uploading ? "Uploading..." : "Choose Image File"}
                      </Button>
                      <p className="text-xs text-muted-foreground self-center">
                        Max size: 5MB. Supported: JPG, PNG, GIF
                      </p>
                    </div>
                  </div>

                  {/* Image Preview */}
                  {uploadedImage && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Image Preview</Label>
                        <Button type="button" variant="ghost" size="sm" onClick={removeImage} className="h-auto p-1" suppressHydrationWarning={true}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="w-full max-w-md h-48 bg-muted rounded-md overflow-hidden border">
                        <img
                          src={uploadedImage}
                          alt="Workshop preview"
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
                      <p className="text-xs text-muted-foreground">Uploaded file preview</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button type="submit" disabled={submitting || uploading} className="w-full sm:w-auto" suppressHydrationWarning={true}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Item
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
