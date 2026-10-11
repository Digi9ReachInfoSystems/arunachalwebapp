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
import { Plus, Edit, Trash2, Loader2, Users } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import Image from "next/image"
import { getTeamMembers, deleteTeamMember } from "@/service/teamService"
import type { TeamMember } from "@/types/team-types"
import { getMediaUrl } from "@/utils/mediaUrl"
import { useDeletePermission } from "@/hooks/use-delete-permission"
import { ContactAdminModal } from "@/components/ui/contact-admin-modal"

function truncate(text: string, maxLength: number) {
  if (!text) return ""
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text
}

export default function TeamPage() {
  const { isAdmin } = useDeletePermission()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  const fetchMembers = async () => {
    setLoading(true)
    setError("")
    const response = await getTeamMembers()
    if (response.success && response.data) {
      setMembers(response.data)
    } else {
      setError(response.error || "Failed to fetch team members")
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const handleDelete = async (id: string) => {
    setDeleteLoading(id)
    const response = await deleteTeamMember(id)
    setDeleteLoading(null)
    if (response.success) {
      setSuccess(response.message || "Team member deleted successfully")
      await fetchMembers()
      setTimeout(() => setSuccess(""), 3000)
    } else {
      setError(response.error || "Failed to delete team member")
      setTimeout(() => setError(""), 5000)
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">Upload team photos with name and designation.</p>
        </div>
        <Button asChild>
          <Link href="/admin/dashboard/team/create">
            <Plus className="mr-2 h-4 w-4" />
            Add Team
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
          <CardTitle>All Team</CardTitle>
          <CardDescription>
            {loading ? "Loading team..." : `${members.length} member${members.length !== 1 ? "s" : ""}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading team...</span>
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No team members found</h3>
              <p className="text-muted-foreground mb-4 text-center">
                Add a name, designation, and image to get started.
              </p>
              <Button asChild>
                <Link href="/admin/dashboard/team/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Team
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Order</TableHead>
                    <TableHead className="w-16">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Designation</TableHead>
                    <TableHead className="text-right w-[180px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member._id}>
                      <TableCell className="font-medium">{member.order ?? 0}</TableCell>
                      <TableCell>
                        {member.image_url ? (
                          <Image
                            src={getMediaUrl(member.image_url)}
                            alt={member.title}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                            style={{ width: "auto", height: "auto" }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <Users className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{member.title}</span>
                          <span className="text-xs text-muted-foreground md:hidden">
                            {truncate(member.designation || member.description || "", 30)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-xs">
                        <p className="truncate">{member.designation || member.description}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/dashboard/team/${member._id}/edit`}>
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
                                  disabled={deleteLoading === member._id}
                                >
                                  {deleteLoading === member._id ? (
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
                                    This will permanently delete {member.title} and cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={() => handleDelete(member._id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <ContactAdminModal
                              title="Delete Team Access Denied"
                              description="You don't have permission to delete team members."
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
    </div>
  )
}
