"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mic, Save, ArrowLeft, Upload, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { addSpeaker, getSpeakerYears } from "@/service/speaker"
import type { SpeakerYear } from "@/types/speaker-types"

export default function CreateSpeaker() {
  const [formData, setFormData] = useState({
    name: "",
    about: "",
    year_ref: "",
    order: "0",
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [years, setYears] = useState<SpeakerYear[]>([])
  const [loading, setLoading] = useState(false)
  const [yearsLoading, setYearsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchYears()
  }, [])

  const fetchYears = async () => {
    try {
      setYearsLoading(true)
      const response = await getSpeakerYears()
      if (response.success && response.data) {
        setYears(response.data)
      } else {
        setError("Failed to fetch speaker years")
      }
    } catch {
      setError("Failed to fetch speaker years")
    } finally {
      setYearsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (years.length === 0) {
      setError("Create a speaker year first before adding speakers.")
      return
    }

    if (!formData.year_ref) {
      setError("Please select a year")
      return
    }

    if (!formData.name.trim() || !formData.about.trim()) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      const submitData = new FormData()
      submitData.append("name", formData.name)
      submitData.append("about", formData.about)
      submitData.append("order", formData.order)

      if (selectedFile) {
        submitData.append("image_url", selectedFile)
      }

      const response = await addSpeaker(formData.year_ref, submitData)

      if (response.success) {
        setSuccess("Speaker added successfully!")
        setFormData({ name: "", about: "", year_ref: "", order: "0" })
        setSelectedFile(null)
        const fileInput = document.getElementById("image_file") as HTMLInputElement
        if (fileInput) fileInput.value = ""
      } else {
        setError(response.error || "Failed to add speaker")
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
          <h1 className="text-3xl font-bold tracking-tight">Add New Speaker</h1>
          <p className="text-muted-foreground">Add a new speaker under a festival year.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/dashboard/speakers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Speakers
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
            <Mic className="h-5 w-5" />
            Speaker Details
          </CardTitle>
          <CardDescription>Fill in the information for the new speaker.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="year_ref">Festival Year *</Label>
              {yearsLoading ? (
                <div className="flex items-center gap-2 p-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading years...</span>
                </div>
              ) : years.length === 0 ? (
                <p className="text-sm text-destructive">
                  No speaker years found.{" "}
                  <Link href="/admin/dashboard/speakers" className="underline">
                    Create a year first
                  </Link>
                  .
                </p>
              ) : (
                <select
                  id="year_ref"
                  name="year_ref"
                  value={formData.year_ref}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select a year</option>
                  {years.map((year) => (
                    <option key={year._id} value={year._id}>
                      {year.label} ({year.year})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Speaker Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter speaker name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="about">About Speaker *</Label>
              <Textarea
                id="about"
                name="about"
                placeholder="Enter speaker biography and background"
                value={formData.about}
                onChange={handleChange}
                rows={6}
                required
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
              <Label htmlFor="image_file">Profile Image</Label>
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
              <Button type="submit" disabled={loading || years.length === 0}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Speaker...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Add Speaker
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild disabled={loading}>
                <Link href="/admin/dashboard/speakers">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
