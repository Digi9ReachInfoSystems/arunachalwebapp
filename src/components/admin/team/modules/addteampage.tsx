"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Save, ArrowLeft, Upload, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { addTeamMember } from "@/service/teamService"

export default function CreateTeamMember() {
  const [formData, setFormData] = useState({
    title: "",
    designation: "",
    description: "",
    order: "0",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!formData.title.trim()) {
      setError("Name is required")
      return
    }

    try {
      setLoading(true)
      const submitData = new FormData()
      submitData.append("title", formData.title)
      submitData.append("designation", formData.designation)
      submitData.append("description", formData.description)
      submitData.append("order", formData.order)
      if (selectedFile) {
        submitData.append("image_url", selectedFile)
      }

      const response = await addTeamMember(submitData)
      if (response.success) {
        setSuccess("Team member added successfully!")
        setFormData({ title: "", designation: "", description: "", order: "0" })
        setSelectedFile(null)
        const fileInput = document.getElementById("image_file") as HTMLInputElement
        if (fileInput) fileInput.value = ""
      } else {
        setError(response.error || "Failed to add team member")
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB")
        return
      }
      setSelectedFile(file)
      setError("")
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Team Member</h1>
          <p className="text-muted-foreground">Add a photo, name, and designation.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/dashboard/team">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Team
          </Link>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Details
          </CardTitle>
          <CardDescription>Name is required. Image and designation are optional.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Name *</Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter name"
                value={formData.title}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                name="designation"
                placeholder="e.g. Festival Director"
                value={formData.designation}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Display order</Label>
              <Input
                id="order"
                name="order"
                type="number"
                min={0}
                placeholder="1"
                value={formData.order}
                onChange={handleChange}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                1 is first place, 2 is second, 3 is third. Leave 0 to fill a remaining place.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_file">Image</Label>
              <div className="flex gap-2">
                <Input
                  id="image_file"
                  name="image_file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="flex-1"
                />
                <Button type="button" variant="outline" disabled>
                  <Upload className="mr-2 h-4 w-4" />
                  {selectedFile ? selectedFile.name : "No file selected"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Supported formats: JPG, PNG, GIF. Max size: 5MB</p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Add Team
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild disabled={loading}>
                <Link href="/admin/dashboard/team">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
