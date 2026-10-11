"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/admin/speaker/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit, Trash2, Loader2, User, Calendar } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import {
  getSpeakersGrouped,
  getSpeakerYears,
  deleteSpeaker,
  createSpeakerYear,
  updateSpeakerYear,
  deleteSpeakerYear,
} from "@/service/speaker"
import type { SpeakerYear, SpeakerYearWithSpeakers } from "@/types/speaker-types"
import Image from "next/image"
import { getMediaUrl } from "@/utils/mediaUrl"
import { useDeletePermission } from "@/hooks/use-delete-permission"
import { ContactAdminModal } from "@/components/ui/contact-admin-modal"

function truncate(text: string, maxLength: number) {
  if (!text) return ""
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text
}

export default function SpeakersPage() {
  const { isAdmin } = useDeletePermission()
  const [groupedYears, setGroupedYears] = useState<SpeakerYearWithSpeakers[]>([])
  const [years, setYears] = useState<SpeakerYear[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [yearActionLoading, setYearActionLoading] = useState(false)

  const [createYearOpen, setCreateYearOpen] = useState(false)
  const [editYearOpen, setEditYearOpen] = useState(false)
  const [editingYear, setEditingYear] = useState<SpeakerYear | null>(null)
  const [yearForm, setYearForm] = useState({
    year: new Date().getFullYear(),
    label: "",
    isActive: true,
  })

  const totalSpeakers = groupedYears.reduce((sum, y) => sum + y.speakers.length, 0)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError("")
      const [groupedRes, yearsRes] = await Promise.all([
        getSpeakersGrouped(),
        getSpeakerYears(),
      ])

      if (groupedRes.success && groupedRes.data) {
        setGroupedYears(groupedRes.data.years)
      } else {
        setGroupedYears([])
        setError(groupedRes.error || "Failed to fetch speakers")
      }

      if (yearsRes.success && yearsRes.data) {
        setYears(yearsRes.data)
      }
    } catch {
      setError("Failed to fetch speakers")
      setGroupedYears([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSpeaker = async (speakerId: string) => {
    try {
      setDeleteLoading(speakerId)
      const response = await deleteSpeaker(speakerId)
      if (response.success) {
        setSuccess("Speaker deleted successfully!")
        await fetchData()
        setTimeout(() => setSuccess(""), 3000)
      } else {
        setError(response.error || "Failed to delete speaker")
        setTimeout(() => setError(""), 3000)
      }
    } catch {
      setError("Failed to delete speaker")
      setTimeout(() => setError(""), 3000)
    } finally {
      setDeleteLoading(null)
    }
  }

  const resetYearForm = () => {
    setYearForm({
      year: new Date().getFullYear(),
      label: "",
      isActive: true,
    })
  }

  const handleCreateYear = async () => {
    if (!yearForm.label.trim()) {
      setError("Please enter a year label")
      return
    }
    setYearActionLoading(true)
    setError("")
    const response = await createSpeakerYear({
      year: yearForm.year,
      label: yearForm.label.trim(),
      isActive: yearForm.isActive,
    })
    setYearActionLoading(false)
    if (response.success) {
      setSuccess("Year created successfully!")
      setCreateYearOpen(false)
      resetYearForm()
      await fetchData()
      setTimeout(() => setSuccess(""), 3000)
    } else {
      setError(response.error || "Failed to create year")
    }
  }

  const openEditYear = (year: SpeakerYear) => {
    setEditingYear(year)
    setYearForm({
      year: year.year,
      label: year.label,
      isActive: year.isActive,
    })
    setEditYearOpen(true)
  }

  const handleUpdateYear = async () => {
    if (!editingYear || !yearForm.label.trim()) {
      setError("Please enter a year label")
      return
    }
    setYearActionLoading(true)
    setError("")
    const response = await updateSpeakerYear(editingYear._id, {
      label: yearForm.label.trim(),
      isActive: yearForm.isActive,
    })
    setYearActionLoading(false)
    if (response.success) {
      setSuccess("Year updated successfully!")
      setEditYearOpen(false)
      setEditingYear(null)
      resetYearForm()
      await fetchData()
      setTimeout(() => setSuccess(""), 3000)
    } else {
      setError(response.error || "Failed to update year")
    }
  }

  const handleDeleteYear = async (yearId: string) => {
    setYearActionLoading(true)
    setError("")
    const response = await deleteSpeakerYear(yearId)
    setYearActionLoading(false)
    if (response.success) {
      setSuccess("Year deleted successfully!")
      await fetchData()
      setTimeout(() => setSuccess(""), 3000)
    } else {
      setError(response.error || "Failed to delete year")
      setTimeout(() => setError(""), 5000)
    }
  }

  const getSpeakerCount = (yearId: string) => {
    return groupedYears.find((y) => y._id === yearId)?.speakers.length ?? 0
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Speakers Management</h1>
          <p className="text-muted-foreground">Manage speaker years and speakers year-wise.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => { resetYearForm(); setCreateYearOpen(true) }}>
            <Calendar className="mr-2 h-4 w-4" />
            Create Year
          </Button>
          <Button asChild>
            <Link href="/admin/dashboard/speakers/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Speaker
            </Link>
          </Button>
        </div>
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

      {/* Year Management */}
      <Card>
        <CardHeader>
          <CardTitle>Speaker Years</CardTitle>
          <CardDescription>
            Create years before adding speakers. {years.length} year{years.length !== 1 ? "s" : ""} configured.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-6">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : years.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground">
              No speaker years yet. Create a year first before adding speakers.
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Speakers</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {years.map((year) => (
                    <TableRow key={year._id}>
                      <TableCell className="font-medium">{year.year}</TableCell>
                      <TableCell>{year.label}</TableCell>
                      <TableCell>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            year.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {year.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell>{getSpeakerCount(year._id)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => openEditYear(year)}>
                            <Edit className="h-3 w-3 sm:mr-2" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                          {isAdmin ? (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" disabled={yearActionLoading}>
                                  <Trash2 className="h-3 w-3 sm:mr-2" />
                                  <span className="hidden sm:inline">Delete</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete {year.label}?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This can only be done if no speakers are linked to this year.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={() => handleDeleteYear(year._id)}
                                  >
                                    Delete Year
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <ContactAdminModal
                              title="Delete Year Access Denied"
                              description="You don't have permission to delete years."
                            >
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </ContactAdminModal>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Speakers Grouped by Year */}
      <Card>
        <CardHeader>
          <CardTitle>All Speakers</CardTitle>
          <CardDescription>
            {loading ? "Loading speakers..." : `Total ${totalSpeakers} speakers across ${groupedYears.length} year(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading speakers...</span>
            </div>
          ) : totalSpeakers === 0 ? (
            <div className="flex flex-col items-center justify-center p-8">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No speakers found</h3>
              <p className="text-muted-foreground mb-4 text-center">
                {years.length === 0
                  ? "Create a speaker year first, then add speakers."
                  : "Get started by adding your first speaker."}
              </p>
              <Button asChild>
                <Link href="/admin/dashboard/speakers/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Speaker
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {groupedYears.map((yearGroup) => (
                <div key={yearGroup._id}>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-lg font-semibold">{yearGroup.label}</h3>
                    <span className="text-sm text-muted-foreground">
                      ({yearGroup.speakers.length} speaker{yearGroup.speakers.length !== 1 ? "s" : ""})
                    </span>
                  </div>
                  {yearGroup.speakers.length === 0 ? (
                    <p className="text-sm text-muted-foreground pl-2">No speakers for this year.</p>
                  ) : (
                    <div className="rounded-md border overflow-x-auto">
                      <Table className="min-w-[600px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16">Order</TableHead>
                            <TableHead className="w-16">Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="hidden md:table-cell">About</TableHead>
                            <TableHead className="text-right w-[180px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {yearGroup.speakers.map((speaker) => (
                            <TableRow key={speaker._id}>
                              <TableCell className="font-medium">{speaker.order ?? 0}</TableCell>
                              <TableCell>
                                {speaker.image_url ? (
                                  <Image
                                    src={getMediaUrl(speaker.image_url)}
                                    alt={speaker.name}
                                    width={40}
                                    height={40}
                                    className="rounded-full object-cover"
                                    style={{ width: "auto", height: "auto" }}
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="font-medium">
                                <div className="flex flex-col">
                                  <span>{speaker.name}</span>
                                  <span className="text-xs text-muted-foreground md:hidden">
                                    {truncate(speaker.about, 30)}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell max-w-xs">
                                <p className="truncate">{speaker.about}</p>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-2 justify-end">
                                  <Button asChild variant="outline" size="sm">
                                    <Link href={`/admin/dashboard/speakers/${speaker._id}/edit`}>
                                      <Edit className="h-3 w-3 sm:mr-2" />
                                      <span className="hidden sm:inline">Edit</span>
                                    </Link>
                                  </Button>
                                  {isAdmin ? (
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          disabled={deleteLoading === speaker._id}
                                        >
                                          {deleteLoading === speaker._id ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                          ) : (
                                            <>
                                              <Trash2 className="h-3 w-3 sm:mr-2" />
                                              <span className="hidden sm:inline">Delete</span>
                                            </>
                                          )}
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This will permanently delete {speaker.name} and cannot be undone.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            className="bg-red-600 hover:bg-red-700"
                                            onClick={() => handleDeleteSpeaker(speaker._id)}
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  ) : (
                                    <ContactAdminModal
                                      title="Delete Speaker Access Denied"
                                      description="You don't have permission to delete speakers."
                                    >
                                      <Button variant="destructive" size="sm">
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </ContactAdminModal>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Year Dialog */}
      <Dialog open={createYearOpen} onOpenChange={setCreateYearOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Speaker Year</DialogTitle>
            <DialogDescription>Add a new festival year before adding speakers.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="create-year">Year</Label>
              <Input
                id="create-year"
                type="number"
                value={yearForm.year}
                onChange={(e) => setYearForm({ ...yearForm, year: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-label">Label</Label>
              <Input
                id="create-label"
                placeholder="e.g. ALF 2026"
                value={yearForm.label}
                onChange={(e) => setYearForm({ ...yearForm, label: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="create-active"
                checked={yearForm.isActive}
                onCheckedChange={(checked) =>
                  setYearForm({ ...yearForm, isActive: checked === true })
                }
              />
              <Label htmlFor="create-active">Active (visible on public site)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateYearOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateYear} disabled={yearActionLoading}>
              {yearActionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Year
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Year Dialog */}
      <Dialog open={editYearOpen} onOpenChange={setEditYearOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Speaker Year</DialogTitle>
            <DialogDescription>Update label and visibility for {editingYear?.label}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-label">Label</Label>
              <Input
                id="edit-label"
                value={yearForm.label}
                onChange={(e) => setYearForm({ ...yearForm, label: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="edit-active"
                checked={yearForm.isActive}
                onCheckedChange={(checked) =>
                  setYearForm({ ...yearForm, isActive: checked === true })
                }
              />
              <Label htmlFor="edit-active">Active (visible on public site)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditYearOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateYear} disabled={yearActionLoading}>
              {yearActionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
